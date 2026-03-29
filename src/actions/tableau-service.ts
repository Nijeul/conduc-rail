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

function revalidateTableau(projetId: string) {
  revalidatePath(`/projets/${projetId}/tableau-service`)
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const CreateTableauSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  entreprise: z.string().max(200).optional(),
  semaine: z.number().int().min(1).max(53),
  annee: z.number().int().min(2020).max(2100),
})

const UpdateTableauSchema = z.object({
  id: z.string().min(1),
  titre: z.string().min(1).max(200).optional(),
  entreprise: z.string().max(200).optional(),
  semaine: z.number().int().min(1).max(53).optional(),
  annee: z.number().int().min(2020).max(2100).optional(),
  colonnes: z.any().optional(),
  lignes: z.any().optional(),
  cellules: z.any().optional(),
})

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getTableauxByProjet(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.tableauService.findMany({
    where: { projetId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getTableau(id: string) {
  const user = await getAuthUser()
  const tableau = await prisma.tableauService.findUnique({ where: { id } })
  if (!tableau) return null
  await checkMembership(tableau.projetId, user.id)
  return tableau
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createTableau(
  projetId: string,
  data: {
    titre: string
    entreprise?: string
    semaine: number
    annee: number
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = CreateTableauSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const tableau = await prisma.tableauService.create({
      data: {
        projetId,
        titre: parsed.data.titre,
        entreprise: parsed.data.entreprise || null,
        semaine: parsed.data.semaine,
        annee: parsed.data.annee,
        colonnes: [],
        lignes: [],
        cellules: {},
      },
    })

    revalidateTableau(projetId)
    return { success: true, data: { id: tableau.id } }
  } catch (error) {
    console.error('createTableau error:', error)
    return { success: false, error: 'Erreur lors de la creation du tableau' }
  }
}

// ---------------------------------------------------------------------------
// Update (auto-save)
// ---------------------------------------------------------------------------

export async function updateTableau(
  projetId: string,
  data: {
    id: string
    titre?: string
    entreprise?: string
    semaine?: number
    annee?: number
    colonnes?: unknown
    lignes?: unknown
    cellules?: unknown
  }
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateTableauSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.titre !== undefined) updateData.titre = parsed.data.titre
    if (parsed.data.entreprise !== undefined) updateData.entreprise = parsed.data.entreprise
    if (parsed.data.semaine !== undefined) updateData.semaine = parsed.data.semaine
    if (parsed.data.annee !== undefined) updateData.annee = parsed.data.annee
    if (parsed.data.colonnes !== undefined) updateData.colonnes = parsed.data.colonnes
    if (parsed.data.lignes !== undefined) updateData.lignes = parsed.data.lignes
    if (parsed.data.cellules !== undefined) updateData.cellules = parsed.data.cellules

    await prisma.tableauService.update({
      where: { id: parsed.data.id },
      data: updateData,
    })

    revalidateTableau(projetId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateTableau error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour du tableau' }
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteTableau(
  projetId: string,
  tableauId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.tableauService.delete({ where: { id: tableauId } })

    revalidateTableau(projetId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteTableau error:', error)
    return { success: false, error: 'Erreur lors de la suppression du tableau' }
  }
}

// ---------------------------------------------------------------------------
// Personnel - fetch all (for phone map)
// ---------------------------------------------------------------------------

export async function getAllPersonnelForMap() {
  await getAuthUser()

  return prisma.personnel.findMany({
    select: {
      id: true,
      prenom: true,
      nom: true,
      poste: true,
      telephone: true,
      entreprise: true,
    },
    orderBy: { nom: 'asc' },
  })
}

// ---------------------------------------------------------------------------
// Personnel search (for cell assignment)
// ---------------------------------------------------------------------------

export async function searchPersonnel(query: string) {
  const user = await getAuthUser()
  if (!user) throw new Error('Non authentifie')

  if (!query || query.length < 1) {
    return prisma.personnel.findMany({
      orderBy: { nom: 'asc' },
      take: 50,
    })
  }

  return prisma.personnel.findMany({
    where: {
      OR: [
        { nom: { contains: query, mode: 'insensitive' } },
        { prenom: { contains: query, mode: 'insensitive' } },
        { poste: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { nom: 'asc' },
    take: 50,
  })
}
