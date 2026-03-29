'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const MaterielSchema = z.object({
  type: z.string().min(1, 'Le type est requis'),
  designation: z.string().min(1, 'La designation est requise'),
  imageUrl: z.string().optional().nullable(),
  nbEssieux: z.number().optional().nullable(),
  poidsEntrant: z.number().optional().nullable(),
  poidsSortant: z.number().optional().nullable(),
  longueur: z.number().optional().nullable(),
  capTraction: z.number().optional().nullable(),
  capEssieuxFreines: z.number().optional().nullable(),
  commentaires: z.string().optional().nullable(),
  estSysteme: z.boolean().default(false),
})

async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Non authentifie')
  }
  return session.user
}

export async function getMaterielList() {
  await getAuthUser()

  return prisma.materielTTx.findMany({
    orderBy: [{ type: 'asc' }, { designation: 'asc' }],
  })
}

export async function getMaterielByType(type: string) {
  await getAuthUser()

  return prisma.materielTTx.findMany({
    where: { type },
    orderBy: { designation: 'asc' },
  })
}

export async function createMateriel(data: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await getAuthUser()

    const parsed = MaterielSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const materiel = await prisma.materielTTx.create({
      data: {
        type: parsed.data.type,
        designation: parsed.data.designation,
        imageUrl: parsed.data.imageUrl || null,
        nbEssieux: parsed.data.nbEssieux ?? null,
        poidsEntrant: parsed.data.poidsEntrant ?? null,
        poidsSortant: parsed.data.poidsSortant ?? null,
        longueur: parsed.data.longueur ?? null,
        capTraction: parsed.data.capTraction ?? null,
        capEssieuxFreines: parsed.data.capEssieuxFreines ?? null,
        commentaires: parsed.data.commentaires || null,
        estSysteme: parsed.data.estSysteme,
      },
    })

    revalidatePath('/materiel')
    return { success: true, data: { id: materiel.id } }
  } catch (error) {
    console.error('createMateriel error:', error)
    return { success: false, error: 'Erreur lors de la creation du materiel' }
  }
}

export async function updateMateriel(
  id: string,
  data: unknown
): Promise<ActionResult> {
  try {
    await getAuthUser()

    const parsed = MaterielSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    await prisma.materielTTx.update({
      where: { id },
      data: {
        type: parsed.data.type,
        designation: parsed.data.designation,
        imageUrl: parsed.data.imageUrl || null,
        nbEssieux: parsed.data.nbEssieux ?? null,
        poidsEntrant: parsed.data.poidsEntrant ?? null,
        poidsSortant: parsed.data.poidsSortant ?? null,
        longueur: parsed.data.longueur ?? null,
        capTraction: parsed.data.capTraction ?? null,
        capEssieuxFreines: parsed.data.capEssieuxFreines ?? null,
        commentaires: parsed.data.commentaires || null,
        estSysteme: parsed.data.estSysteme,
      },
    })

    revalidatePath('/materiel')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateMateriel error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteMateriel(id: string): Promise<ActionResult> {
  try {
    await getAuthUser()

    // Verifier que ce n'est pas un materiel systeme
    const materiel = await prisma.materielTTx.findUnique({ where: { id } })
    if (!materiel) {
      return { success: false, error: 'Materiel introuvable' }
    }
    if (materiel.estSysteme) {
      return { success: false, error: 'Impossible de supprimer un materiel systeme' }
    }

    await prisma.materielTTx.delete({ where: { id } })

    revalidatePath('/materiel')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteMateriel error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
