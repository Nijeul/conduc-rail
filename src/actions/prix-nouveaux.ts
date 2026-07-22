'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const STATUTS = ['a_venir', 'en_cours', 'accepte', 'refuse'] as const

const PrixNouveauSchema = z.object({
  numero: z.string().max(50).optional().nullable(),
  intitule: z.string().min(1, "L'intitulé est obligatoire").max(500),
  dateDevis: z.string().optional().nullable(),
  montantPresente: z.number().min(0).default(0),
  montantAccepte: z.number().min(0).optional().nullable(),
  debourseReel: z.number().min(0).optional().nullable(),
  numeroOS: z.string().max(50).optional().nullable(),
  dateOS: z.string().optional().nullable(),
  delaiSupplementaire: z.string().max(200).optional().nullable(),
  potentielAcceptation: z.number().int().min(0).max(100).default(50),
  statut: z.enum(STATUTS).default('en_cours'),
  commentaire: z.string().max(1000).optional().nullable(),
})

const UpdatePrixNouveauSchema = PrixNouveauSchema.partial().extend({
  id: z.string().min(1),
})

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

async function checkPrixNouveau(projetId: string, id: string) {
  const pn = await prisma.prixNouveau.findUnique({ where: { id } })
  if (!pn || pn.projetId !== projetId) throw new Error('Prix nouveau introuvable')
  return pn
}

function toDates(data: {
  dateDevis?: string | null
  dateOS?: string | null
  [k: string]: unknown
}) {
  const out: Record<string, unknown> = { ...data }
  if ('dateDevis' in data)
    out.dateDevis = data.dateDevis ? new Date(data.dateDevis) : null
  if ('dateOS' in data) out.dateOS = data.dateOS ? new Date(data.dateOS) : null
  return out
}

export async function getPrixNouveaux(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.prixNouveau.findMany({
    where: { projetId },
    orderBy: [{ ordre: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function createPrixNouveau(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = PrixNouveauSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const maxOrdre = await prisma.prixNouveau.aggregate({
      where: { projetId },
      _max: { ordre: true },
    })

    const pn = await prisma.prixNouveau.create({
      data: {
        projetId,
        ...(toDates(parsed.data) as typeof parsed.data & {
          dateDevis: Date | null
          dateOS: Date | null
        }),
        ordre: (maxOrdre._max.ordre ?? -1) + 1,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/prix-nouveaux`)
    return { success: true, data: { id: pn.id } }
  } catch (error) {
    console.error('createPrixNouveau error:', error)
    return { success: false, error: 'Erreur lors de la creation du prix nouveau' }
  }
}

export async function updatePrixNouveau(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdatePrixNouveauSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { id, ...updateData } = parsed.data
    await checkPrixNouveau(projetId, id)

    const cleanData = Object.fromEntries(
      Object.entries(toDates(updateData)).filter(([, v]) => v !== undefined)
    )

    await prisma.prixNouveau.update({ where: { id }, data: cleanData })

    revalidatePath(`/projets/${projetId}/suivi/prix-nouveaux`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updatePrixNouveau error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function reorderPrixNouveaux(
  projetId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.prixNouveau.updateMany({
          where: { id, projetId },
          data: { ordre: index },
        })
      )
    )

    revalidatePath(`/projets/${projetId}/suivi/prix-nouveaux`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('reorderPrixNouveaux error:', error)
    return { success: false, error: 'Erreur lors du reordonnement' }
  }
}

export async function deletePrixNouveau(
  projetId: string,
  id: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)
    await checkPrixNouveau(projetId, id)

    await prisma.prixNouveau.delete({ where: { id } })

    revalidatePath(`/projets/${projetId}/suivi/prix-nouveaux`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deletePrixNouveau error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
