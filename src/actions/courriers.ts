'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { ActionResult } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function revalidateCourriers(projetId: string) {
  revalidatePath(`/projets/${projetId}/courriers`)
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const CreateCourrierSchema = z.object({
  reference: z.string().min(1, 'La reference est requise').max(100),
  objet: z.string().min(1, "L'objet est requis").max(500),
  type: z.enum(['lettre', 'compte-rendu', 'note', 'demande', 'autre']),
  destinataire: z.string().max(300).optional(),
  corps: z.string().optional(),
})

const UpdateCourrierSchema = CreateCourrierSchema.extend({
  id: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getCourriers(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.courrierChantier.findMany({
    where: { projetId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCourrier(projetId: string, courrierId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.courrierChantier.findFirst({
    where: { id: courrierId, projetId },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createCourrier(
  projetId: string,
  data: z.infer<typeof CreateCourrierSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = CreateCourrierSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const courrier = await prisma.courrierChantier.create({
      data: {
        projetId,
        reference: parsed.data.reference,
        objet: parsed.data.objet,
        type: parsed.data.type,
        destinataire: parsed.data.destinataire || null,
        corps: parsed.data.corps || '',
        statut: 'brouillon',
      },
    })

    revalidateCourriers(projetId)
    return { success: true, data: { id: courrier.id } }
  } catch (error) {
    console.error('createCourrier error:', error)
    return { success: false, error: 'Erreur lors de la creation du courrier' }
  }
}

export async function updateCourrier(
  projetId: string,
  data: z.infer<typeof UpdateCourrierSchema>
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateCourrierSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    // Verify courrier belongs to projet
    const existing = await prisma.courrierChantier.findFirst({
      where: { id: parsed.data.id, projetId },
    })
    if (!existing) {
      return { success: false, error: 'Courrier introuvable' }
    }

    await prisma.courrierChantier.update({
      where: { id: parsed.data.id },
      data: {
        reference: parsed.data.reference,
        objet: parsed.data.objet,
        type: parsed.data.type,
        destinataire: parsed.data.destinataire || null,
        corps: parsed.data.corps || '',
      },
    })

    revalidateCourriers(projetId)
    revalidatePath(`/projets/${projetId}/courriers/${parsed.data.id}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateCourrier error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour du courrier' }
  }
}

export async function deleteCourrier(
  projetId: string,
  courrierId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const existing = await prisma.courrierChantier.findFirst({
      where: { id: courrierId, projetId },
    })
    if (!existing) {
      return { success: false, error: 'Courrier introuvable' }
    }

    await prisma.courrierChantier.delete({ where: { id: courrierId } })

    revalidateCourriers(projetId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteCourrier error:', error)
    return { success: false, error: 'Erreur lors de la suppression du courrier' }
  }
}

export async function duplicateCourrier(
  projetId: string,
  courrierId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const original = await prisma.courrierChantier.findFirst({
      where: { id: courrierId, projetId },
    })
    if (!original) {
      return { success: false, error: 'Courrier introuvable' }
    }

    const copie = await prisma.courrierChantier.create({
      data: {
        projetId,
        reference: `${original.reference}-COPIE`,
        objet: original.objet,
        type: original.type,
        destinataire: original.destinataire,
        corps: original.corps,
        statut: 'brouillon',
      },
    })

    revalidateCourriers(projetId)
    return { success: true, data: { id: copie.id } }
  } catch (error) {
    console.error('duplicateCourrier error:', error)
    return { success: false, error: 'Erreur lors de la duplication du courrier' }
  }
}

export async function marquerCourrierEnvoye(
  projetId: string,
  courrierId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const courrier = await prisma.courrierChantier.findFirst({
      where: { id: courrierId, projetId },
    })
    if (!courrier) {
      return { success: false, error: 'Courrier introuvable' }
    }

    await prisma.$transaction([
      prisma.courrierChantier.update({
        where: { id: courrierId },
        data: { statut: 'envoye', dateEnvoi: new Date() },
      }),
      prisma.evenementChantier.create({
        data: {
          projetId,
          date: new Date(),
          titre: `Courrier envoye : ${courrier.objet}`,
          categorie: 'contrat',
          source: `Ref. ${courrier.reference}`,
          courrierId,
        },
      }),
    ])

    revalidateCourriers(projetId)
    revalidatePath(`/projets/${projetId}/courriers/${courrierId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('marquerCourrierEnvoye error:', error)
    return { success: false, error: "Erreur lors du marquage comme envoye" }
  }
}
