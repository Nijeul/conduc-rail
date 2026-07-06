'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'
import type { SousTraitant, AvenantSousTraitant, FacturationSousTraitant } from '@prisma/client'

const SousTraitantSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire').max(200),
  contact: z.string().max(200).optional().nullable(),
  telephone: z.string().max(30).optional().nullable(),
  email: z.string().max(200).optional().nullable(),
  paiementDirect: z.boolean().default(false),
  montantMarche: z.number().min(0).default(0),
  montantAS: z.number().min(0).default(0),
  commentaire: z.string().max(1000).optional().nullable(),
})

const UpdateSousTraitantSchema = SousTraitantSchema.partial().extend({
  id: z.string().min(1),
})

const AvenantSchema = z.object({
  libelle: z.string().max(300).optional().nullable(),
  montant: z.number(),
  date: z.string().optional().nullable(),
})

const UpdateAvenantSchema = AvenantSchema.partial().extend({
  id: z.string().min(1),
})

const FacturationSchema = z.object({
  sousTraitantId: z.string().min(1),
  annee: z.number().int().min(2000).max(2100),
  mois: z.number().int().min(1).max(12),
  montant: z.number(),
})

export type SousTraitantComplet = SousTraitant & {
  avenants: AvenantSousTraitant[]
  facturations: FacturationSousTraitant[]
}

export interface SousTraitantsData {
  sousTraitants: SousTraitantComplet[]
  montantMarcheTotal: number // total du Détail Estimatif (marché mandataire)
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

async function checkSousTraitant(projetId: string, sousTraitantId: string) {
  const st = await prisma.sousTraitant.findUnique({ where: { id: sousTraitantId } })
  if (!st || st.projetId !== projetId) throw new Error('Sous-traitant introuvable')
  return st
}

export async function getSousTraitants(projetId: string): Promise<SousTraitantsData> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const [sousTraitants, lignesDE] = await Promise.all([
    prisma.sousTraitant.findMany({
      where: { projetId },
      orderBy: { ordre: 'asc' },
      include: {
        avenants: { orderBy: { numero: 'asc' } },
        facturations: { orderBy: [{ annee: 'asc' }, { mois: 'asc' }] },
      },
    }),
    prisma.ligneDE.findMany({ where: { projetId } }),
  ])

  const montantMarcheTotal = lignesDE.reduce(
    (sum, l) => sum + l.quantite * l.prixUnitaire,
    0
  )

  return { sousTraitants, montantMarcheTotal }
}

export async function createSousTraitant(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = SousTraitantSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const maxOrdre = await prisma.sousTraitant.aggregate({
      where: { projetId },
      _max: { ordre: true },
    })

    const st = await prisma.sousTraitant.create({
      data: {
        projetId,
        ...parsed.data,
        ordre: (maxOrdre._max.ordre ?? -1) + 1,
      },
    })

    revalidatePath(`/projets/${projetId}/sous-traitants`)
    revalidatePath(`/projets/${projetId}/suivi/sous-traitants`)
    return { success: true, data: { id: st.id } }
  } catch (error) {
    console.error('createSousTraitant error:', error)
    return { success: false, error: 'Erreur lors de la creation du sous-traitant' }
  }
}

export async function updateSousTraitant(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateSousTraitantSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { id, ...updateData } = parsed.data
    await checkSousTraitant(projetId, id)

    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    )

    await prisma.sousTraitant.update({ where: { id }, data: cleanData })

    revalidatePath(`/projets/${projetId}/sous-traitants`)
    revalidatePath(`/projets/${projetId}/suivi/sous-traitants`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateSousTraitant error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteSousTraitant(
  projetId: string,
  sousTraitantId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)
    await checkSousTraitant(projetId, sousTraitantId)

    await prisma.sousTraitant.delete({ where: { id: sousTraitantId } })

    revalidatePath(`/projets/${projetId}/sous-traitants`)
    revalidatePath(`/projets/${projetId}/suivi/sous-traitants`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteSousTraitant error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

// ---------------------------------------------------------------------------
// Avenants
// ---------------------------------------------------------------------------

export async function createAvenant(
  projetId: string,
  sousTraitantId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)
    await checkSousTraitant(projetId, sousTraitantId)

    const parsed = AvenantSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const maxNumero = await prisma.avenantSousTraitant.aggregate({
      where: { sousTraitantId },
      _max: { numero: true },
    })

    const avenant = await prisma.avenantSousTraitant.create({
      data: {
        sousTraitantId,
        numero: (maxNumero._max.numero ?? 0) + 1,
        libelle: parsed.data.libelle ?? null,
        montant: parsed.data.montant,
        date: parsed.data.date ? new Date(parsed.data.date) : null,
      },
    })

    revalidatePath(`/projets/${projetId}/sous-traitants`)
    revalidatePath(`/projets/${projetId}/suivi/sous-traitants`)
    return { success: true, data: { id: avenant.id } }
  } catch (error) {
    console.error('createAvenant error:', error)
    return { success: false, error: "Erreur lors de l'ajout de l'avenant" }
  }
}

export async function updateAvenant(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateAvenantSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { id, ...updateData } = parsed.data
    const avenant = await prisma.avenantSousTraitant.findUnique({
      where: { id },
      include: { sousTraitant: true },
    })
    if (!avenant || avenant.sousTraitant.projetId !== projetId) {
      return { success: false, error: 'Avenant introuvable' }
    }

    await prisma.avenantSousTraitant.update({
      where: { id },
      data: {
        ...(updateData.libelle !== undefined ? { libelle: updateData.libelle } : {}),
        ...(updateData.montant !== undefined ? { montant: updateData.montant } : {}),
        ...(updateData.date !== undefined
          ? { date: updateData.date ? new Date(updateData.date) : null }
          : {}),
      },
    })

    revalidatePath(`/projets/${projetId}/sous-traitants`)
    revalidatePath(`/projets/${projetId}/suivi/sous-traitants`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateAvenant error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteAvenant(
  projetId: string,
  avenantId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const avenant = await prisma.avenantSousTraitant.findUnique({
      where: { id: avenantId },
      include: { sousTraitant: true },
    })
    if (!avenant || avenant.sousTraitant.projetId !== projetId) {
      return { success: false, error: 'Avenant introuvable' }
    }

    await prisma.avenantSousTraitant.delete({ where: { id: avenantId } })

    revalidatePath(`/projets/${projetId}/sous-traitants`)
    revalidatePath(`/projets/${projetId}/suivi/sous-traitants`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteAvenant error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

// ---------------------------------------------------------------------------
// Facturations mensuelles (poste financier)
// ---------------------------------------------------------------------------

export async function upsertFacturation(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = FacturationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { sousTraitantId, annee, mois, montant } = parsed.data
    await checkSousTraitant(projetId, sousTraitantId)

    await prisma.facturationSousTraitant.upsert({
      where: {
        sousTraitantId_annee_mois: { sousTraitantId, annee, mois },
      },
      create: { sousTraitantId, annee, mois, montant },
      update: { montant },
    })

    // Pas de revalidatePath pour l'auto-save (performance)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('upsertFacturation error:', error)
    return { success: false, error: "Erreur lors de l'enregistrement de la facturation" }
  }
}
