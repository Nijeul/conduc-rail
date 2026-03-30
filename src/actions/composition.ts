'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { ActionResult } from '@/types'

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

const VehiculeSchema = z.object({
  id: z.string(),
  materielId: z.string().default(''),
  type: z.enum(['Loco', 'Ballastiere', 'Bigrue', 'BML', 'Regaleuse', 'Stabilisateur', 'Wagon', 'WagonLRS']),
  designation: z.string().default(''),
  nombre: z.number().min(1).default(1),
  capEssieuxFreines: z.number().default(0),
  nbEssieux: z.number().default(0),
  poidsEntrant: z.number().default(0),
  poidsSortant: z.number().default(0),
  longueur: z.number().default(0),
  capTraction: z.number().default(0),
  commentaires: z.string().default(''),
})

const CompositionSchema = z.object({
  titre: z.string().optional(),
  date: z.string().optional(),
  sens: z.string().default('Paris → Province'),
  vehicules: z.array(VehiculeSchema).default([]),
})

export type Vehicule = z.infer<typeof VehiculeSchema>

export async function getCompositions(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.compositionTTx.findMany({
    where: { projetId },
    orderBy: { date: 'desc' },
  })
}

export async function getComposition(compositionId: string, projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.compositionTTx.findUnique({
    where: { id: compositionId },
  })
}

export async function createComposition(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = CompositionSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const d = parsed.data

    const composition = await prisma.compositionTTx.create({
      data: {
        projetId,
        titre: d.titre || null,
        date: d.date ? new Date(d.date) : null,
        sens: d.sens,
        vehicules: d.vehicules,
      },
    })

    revalidatePath(`/projets/${projetId}/composition`)
    return { success: true, data: { id: composition.id } }
  } catch (error) {
    console.error('createComposition error:', error)
    return { success: false, error: 'Erreur lors de la creation de la composition' }
  }
}

export async function updateComposition(
  compositionId: string,
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = CompositionSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const d = parsed.data

    await prisma.compositionTTx.update({
      where: { id: compositionId },
      data: {
        titre: d.titre || null,
        date: d.date ? new Date(d.date) : null,
        sens: d.sens,
        vehicules: d.vehicules,
      },
    })

    revalidatePath(`/projets/${projetId}/composition`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateComposition error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteComposition(
  compositionId: string,
  projetId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.compositionTTx.delete({ where: { id: compositionId } })

    revalidatePath(`/projets/${projetId}/composition`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteComposition error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
