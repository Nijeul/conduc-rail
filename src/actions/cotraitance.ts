'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'
import type { CoTraitant } from '@prisma/client'

const CoTraitantSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire').max(200),
  estMandataire: z.boolean().default(false),
})

const UpdateCoTraitantSchema = CoTraitantSchema.partial().extend({
  id: z.string().min(1),
})

const RepartitionSchema = z.object({
  ligneDEId: z.string().min(1),
  repartition: z.record(z.string().max(100), z.number()),
})

export interface LigneRepartition {
  id: string
  code: string
  designation: string
  unite: string
  quantite: number
  prixUnitaire: number
  estChapitre: boolean
  repartition: Record<string, number>
}

export interface CoTraitanceData {
  coTraitants: CoTraitant[]
  lignes: LigneRepartition[]
}

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Non authentifie')
  return session.user
}

async function checkMembership(projetId: string, userId: string) {
  const member = await prisma.projetMember.findUnique({
    where: { userId_projetId: { userId, projetId } },
  })
  if (!member) throw new Error('Acces refuse')
  return member
}

function toRepartition(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'number' && !isNaN(v)) out[k] = v
  }
  return out
}

export async function getCoTraitance(projetId: string): Promise<CoTraitanceData> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const [coTraitants, lignes] = await Promise.all([
    prisma.coTraitant.findMany({ where: { projetId }, orderBy: { ordre: 'asc' } }),
    prisma.ligneDE.findMany({ where: { projetId }, orderBy: { ordre: 'asc' } }),
  ])

  return {
    coTraitants,
    lignes: lignes.map((l) => ({
      id: l.id,
      code: l.code,
      designation: l.designation,
      unite: l.unite,
      quantite: l.quantite,
      prixUnitaire: l.prixUnitaire,
      estChapitre: l.estChapitre,
      repartition: toRepartition(l.repartition),
    })),
  }
}

export async function createCoTraitant(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = CoTraitantSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const maxOrdre = await prisma.coTraitant.aggregate({
      where: { projetId },
      _max: { ordre: true },
    })

    const ct = await prisma.coTraitant.create({
      data: {
        projetId,
        nom: parsed.data.nom,
        estMandataire: parsed.data.estMandataire,
        ordre: (maxOrdre._max.ordre ?? -1) + 1,
      },
    })

    revalidatePath(`/projets/${projetId}/detail-estimatif`)
    return { success: true, data: { id: ct.id } }
  } catch (error) {
    console.error('createCoTraitant error:', error)
    return { success: false, error: 'Erreur lors de la creation du co-traitant' }
  }
}

export async function updateCoTraitant(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateCoTraitantSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { id, ...updateData } = parsed.data
    const ct = await prisma.coTraitant.findUnique({ where: { id } })
    if (!ct || ct.projetId !== projetId) {
      return { success: false, error: 'Co-traitant introuvable' }
    }

    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    )
    await prisma.coTraitant.update({ where: { id }, data: cleanData })

    revalidatePath(`/projets/${projetId}/detail-estimatif`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateCoTraitant error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteCoTraitant(
  projetId: string,
  coTraitantId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const ct = await prisma.coTraitant.findUnique({ where: { id: coTraitantId } })
    if (!ct || ct.projetId !== projetId) {
      return { success: false, error: 'Co-traitant introuvable' }
    }

    await prisma.coTraitant.delete({ where: { id: coTraitantId } })

    revalidatePath(`/projets/${projetId}/detail-estimatif`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteCoTraitant error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

/** Enregistre la répartition des PU d'une ligne du DE (auto-save) */
export async function saveRepartitionLigne(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = RepartitionSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Repartition invalide' }
    }

    const ligne = await prisma.ligneDE.findUnique({
      where: { id: parsed.data.ligneDEId },
    })
    if (!ligne || ligne.projetId !== projetId) {
      return { success: false, error: 'Ligne introuvable' }
    }

    await prisma.ligneDE.update({
      where: { id: ligne.id },
      data: { repartition: parsed.data.repartition },
    })

    // Pas de revalidatePath : auto-save
    return { success: true, data: undefined }
  } catch (error) {
    console.error('saveRepartitionLigne error:', error)
    return { success: false, error: "Erreur lors de l'enregistrement de la repartition" }
  }
}
