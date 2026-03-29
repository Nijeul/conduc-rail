'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'
import type { SoudureAluminothermique } from '@prisma/client'

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

// ─── Fetch all soudures for a project ───────────────────────────────────────

export async function getSoudures(
  projetId: string
): Promise<SoudureAluminothermique[]> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.soudureAluminothermique.findMany({
    where: { projetId },
    orderBy: { ordre: 'asc' },
  })
}

// ─── Create a new soudure ───────────────────────────────────────────────────

export async function createSoudure(
  projetId: string,
  insertAtOrdre?: number
): Promise<ActionResult<SoudureAluminothermique>> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  try {
    if (insertAtOrdre !== undefined) {
      // Shift existing rows down
      await prisma.soudureAluminothermique.updateMany({
        where: { projetId, ordre: { gte: insertAtOrdre } },
        data: { ordre: { increment: 1 } },
      })
    }

    const ordre =
      insertAtOrdre ??
      ((
        await prisma.soudureAluminothermique.aggregate({
          where: { projetId },
          _max: { ordre: true },
        })
      )._max.ordre ?? -1) + 1

    const soudure = await prisma.soudureAluminothermique.create({
      data: { projetId, ordre },
    })

    revalidatePath(`/projets/${projetId}/suivi/sa`)
    return { success: true, data: soudure }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

// ─── Update a soudure field ─────────────────────────────────────────────────

const UpdateSoudureSchema = z.object({
  id: z.string().min(1),
  field: z.string().min(1),
  value: z.union([z.string(), z.null()]),
})

export async function updateSoudureField(
  projetId: string,
  data: { id: string; field: string; value: string | null }
): Promise<ActionResult> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const parsed = UpdateSoudureSchema.parse(data)

  const allowedFields = [
    'zoneTravaux',
    'date',
    'poincon',
    'pk',
    'voie',
    'fileGD',
    'lacune',
    'profilRail',
    'nuanceAcier',
    'e1',
    'e2',
    'meulageProfil',
    'creuxZone',
    'tracePointu',
    'traceCreux',
    'traceMeulage',
    'observations',
    'reception',
    'raisonHS',
    'couleurLigne',
  ]

  if (!allowedFields.includes(parsed.field)) {
    return { success: false, error: 'Champ non autorise' }
  }

  try {
    let updateValue: string | Date | null = parsed.value

    // Handle date field specially
    if (parsed.field === 'date') {
      updateValue = parsed.value ? new Date(parsed.value) : null
    }

    await prisma.soudureAluminothermique.update({
      where: { id: parsed.id },
      data: { [parsed.field]: updateValue },
    })

    revalidatePath(`/projets/${projetId}/suivi/sa`)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

// ─── Delete a soudure ───────────────────────────────────────────────────────

export async function deleteSoudure(
  projetId: string,
  soudureId: string
): Promise<ActionResult> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  try {
    await prisma.soudureAluminothermique.delete({
      where: { id: soudureId },
    })

    revalidatePath(`/projets/${projetId}/suivi/sa`)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

// ─── Update couleur ligne ───────────────────────────────────────────────────

export async function updateCouleurLigne(
  projetId: string,
  soudureId: string,
  couleur: string
): Promise<ActionResult> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  try {
    await prisma.soudureAluminothermique.update({
      where: { id: soudureId },
      data: { couleurLigne: couleur || null },
    })

    revalidatePath(`/projets/${projetId}/suivi/sa`)
    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
