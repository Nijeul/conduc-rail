'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const LigneDESchema = z.object({
  code: z.string().max(50).default(''),
  designation: z.string().max(500).default(''),
  unite: z.string().max(20).default(''),
  quantite: z.number().min(0).default(0),
  prixUnitaire: z.number().min(0).default(0),
})

const UpdateLigneDESchema = z.object({
  id: z.string().min(1),
  code: z.string().max(50).optional(),
  designation: z.string().max(500).optional(),
  unite: z.string().max(20).optional(),
  quantite: z.number().min(0).optional(),
  prixUnitaire: z.number().min(0).optional(),
  ordre: z.number().int().min(0).optional(),
})

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Non authentifie')
  }
  return session.user
}

async function checkMembership(projetId: string, userId: string) {
  const member = await prisma.projetMember.findUnique({
    where: { userId_projetId: { userId, projetId } },
  })
  if (!member) {
    throw new Error('Acces refuse')
  }
  return member
}

/**
 * Retourne toutes les LigneDE du projet triees par ordre.
 * Utilise par les Agents 4 et 5.
 */
export async function getLignesDE(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.ligneDE.findMany({
    where: { projetId },
    orderBy: { ordre: 'asc' },
  })
}

export async function createLigneDE(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = LigneDESchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    // Get next ordre value
    const maxOrdre = await prisma.ligneDE.aggregate({
      where: { projetId },
      _max: { ordre: true },
    })
    const nextOrdre = (maxOrdre._max.ordre ?? -1) + 1

    const ligne = await prisma.ligneDE.create({
      data: {
        projetId,
        code: parsed.data.code,
        designation: parsed.data.designation,
        unite: parsed.data.unite,
        quantite: parsed.data.quantite,
        prixUnitaire: parsed.data.prixUnitaire,
        ordre: nextOrdre,
      },
    })

    revalidatePath(`/projets/${projetId}`)
    return { success: true, data: { id: ligne.id } }
  } catch (error) {
    console.error('createLigneDE error:', error)
    return { success: false, error: "Erreur lors de l'ajout de la ligne" }
  }
}

export async function updateLigneDE(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateLigneDESchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { id, ...updateData } = parsed.data
    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    )

    await prisma.ligneDE.update({
      where: { id },
      data: cleanData,
    })

    // No revalidatePath here for auto-save performance
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateLigneDE error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteLigneDE(
  projetId: string,
  ligneId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.ligneDE.delete({ where: { id: ligneId } })

    revalidatePath(`/projets/${projetId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteLigneDE error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

export async function reorderLignesDE(
  projetId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    // Update ordre for each ligne in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.ligneDE.update({
          where: { id },
          data: { ordre: index },
        })
      )
    )

    return { success: true, data: undefined }
  } catch (error) {
    console.error('reorderLignesDE error:', error)
    return { success: false, error: 'Erreur lors du reordonnement' }
  }
}
