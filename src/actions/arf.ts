'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'
import type { LigneARF } from '@/types/arf'
import { calcDureeMinutes } from '@/lib/utils'

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

export interface ARFRow {
  id: string
  source: 'rapport' | 'manuelle'
  rapportId?: string
  date: string
  posteNuit: boolean
  heureDebutPrevue: string | null
  heureFinPrevue: string | null
  heureDebut: string | null
  heureFin: string | null
  heureRestituee: string | null
  commentaire?: string | null
  dureeReelleMin?: number | null
  dureePrevueMin?: number | null
  pourcentage?: number | null
}

function computeRowDurations(row: {
  heureDebut: string | null
  heureFin: string | null
  heureRestituee: string | null
  heureDebutPrevue: string | null
  heureFinPrevue: string | null
  posteNuit: boolean
}) {
  const finEffective = row.heureRestituee || row.heureFin
  let dureeReelleMin: number | null = null
  let dureePrevueMin: number | null = null
  let pourcentage: number | null = null

  if (row.heureDebut && finEffective) {
    dureeReelleMin = calcDureeMinutes(row.heureDebut, finEffective, row.posteNuit)
  }
  if (row.heureDebutPrevue && row.heureFinPrevue) {
    dureePrevueMin = calcDureeMinutes(row.heureDebutPrevue, row.heureFinPrevue, row.posteNuit)
  }
  if (dureeReelleMin !== null && dureePrevueMin !== null && dureePrevueMin > 0) {
    pourcentage = (dureeReelleMin / dureePrevueMin) * 100
  }

  return { dureeReelleMin, dureePrevueMin, pourcentage }
}

export async function getARFData(projetId: string): Promise<ARFRow[]> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const [rapports, lignesManuelles] = await Promise.all([
    prisma.rapportJournalier.findMany({
      where: { projetId },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        posteNuit: true,
        heureDebutPrevue: true,
        heureFinPrevue: true,
        heureDebut: true,
        heureFin: true,
        heureRestituee: true,
      },
    }),
    prisma.ligneARFManuelle.findMany({
      where: { projetId },
      orderBy: { date: 'asc' },
    }),
  ])

  const rapportRows: ARFRow[] = rapports.map((r) => {
    const durations = computeRowDurations(r)
    return {
      id: r.id,
      source: 'rapport' as const,
      rapportId: r.id,
      date: r.date.toISOString(),
      posteNuit: r.posteNuit,
      heureDebutPrevue: r.heureDebutPrevue,
      heureFinPrevue: r.heureFinPrevue,
      heureDebut: r.heureDebut,
      heureFin: r.heureFin,
      heureRestituee: r.heureRestituee,
      dureeReelleMin: durations.dureeReelleMin,
      dureePrevueMin: durations.dureePrevueMin,
      pourcentage: durations.pourcentage,
    }
  })

  const manuelleRows: ARFRow[] = lignesManuelles.map((l) => {
    const durations = computeRowDurations(l)
    return {
      id: l.id,
      source: 'manuelle' as const,
      date: l.date.toISOString(),
      posteNuit: l.posteNuit,
      heureDebutPrevue: l.heureDebutPrevue,
      heureFinPrevue: l.heureFinPrevue,
      heureDebut: l.heureDebut,
      heureFin: l.heureFin,
      heureRestituee: l.heureRestituee,
      commentaire: l.commentaire,
      dureeReelleMin: durations.dureeReelleMin,
      dureePrevueMin: durations.dureePrevueMin,
      pourcentage: durations.pourcentage,
    }
  })

  const allRows = [...rapportRows, ...manuelleRows]
  allRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return allRows
}

const UpdateHeuresPrevuesSchema = z.object({
  rapportId: z.string().min(1),
  heureDebutPrevue: z.string().nullable(),
  heureFinPrevue: z.string().nullable(),
})

export async function updateHeuresPrevues(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateHeuresPrevuesSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    await prisma.rapportJournalier.update({
      where: { id: parsed.data.rapportId },
      data: {
        heureDebutPrevue: parsed.data.heureDebutPrevue,
        heureFinPrevue: parsed.data.heureFinPrevue,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/arf`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateHeuresPrevues error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

// ---------------------------------------------------------------------------
// Lignes ARF Manuelles — CRUD
// ---------------------------------------------------------------------------

const CreateLigneARFManuelleSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  posteNuit: z.boolean(),
  heureDebutPrevue: z.string().nullable().optional(),
  heureFinPrevue: z.string().nullable().optional(),
  heureDebut: z.string().nullable().optional(),
  heureFin: z.string().nullable().optional(),
  heureRestituee: z.string().nullable().optional(),
  commentaire: z.string().nullable().optional(),
})

export async function createLigneARFManuelle(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = CreateLigneARFManuelleSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const ligne = await prisma.ligneARFManuelle.create({
      data: {
        projetId,
        date: new Date(parsed.data.date),
        posteNuit: parsed.data.posteNuit,
        heureDebutPrevue: parsed.data.heureDebutPrevue ?? null,
        heureFinPrevue: parsed.data.heureFinPrevue ?? null,
        heureDebut: parsed.data.heureDebut ?? null,
        heureFin: parsed.data.heureFin ?? null,
        heureRestituee: parsed.data.heureRestituee ?? null,
        commentaire: parsed.data.commentaire ?? null,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/arf`)
    return { success: true, data: { id: ligne.id } }
  } catch (error) {
    console.error('createLigneARFManuelle error:', error)
    return { success: false, error: 'Erreur lors de la creation' }
  }
}

const UpdateLigneARFManuelleSchema = z.object({
  heureDebutPrevue: z.string().nullable().optional(),
  heureFinPrevue: z.string().nullable().optional(),
  heureDebut: z.string().nullable().optional(),
  heureFin: z.string().nullable().optional(),
  heureRestituee: z.string().nullable().optional(),
  commentaire: z.string().nullable().optional(),
  posteNuit: z.boolean().optional(),
  date: z.string().optional(),
})

export async function updateLigneARFManuelle(
  ligneId: string,
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateLigneARFManuelleSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const updateData: Record<string, unknown> = {}
    if (parsed.data.heureDebutPrevue !== undefined) updateData.heureDebutPrevue = parsed.data.heureDebutPrevue
    if (parsed.data.heureFinPrevue !== undefined) updateData.heureFinPrevue = parsed.data.heureFinPrevue
    if (parsed.data.heureDebut !== undefined) updateData.heureDebut = parsed.data.heureDebut
    if (parsed.data.heureFin !== undefined) updateData.heureFin = parsed.data.heureFin
    if (parsed.data.heureRestituee !== undefined) updateData.heureRestituee = parsed.data.heureRestituee
    if (parsed.data.commentaire !== undefined) updateData.commentaire = parsed.data.commentaire
    if (parsed.data.posteNuit !== undefined) updateData.posteNuit = parsed.data.posteNuit
    if (parsed.data.date !== undefined) updateData.date = new Date(parsed.data.date)

    await prisma.ligneARFManuelle.update({
      where: { id: ligneId },
      data: updateData,
    })

    revalidatePath(`/projets/${projetId}/suivi/arf`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateLigneARFManuelle error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteLigneARFManuelle(
  ligneId: string,
  projetId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.ligneARFManuelle.delete({
      where: { id: ligneId },
    })

    revalidatePath(`/projets/${projetId}/suivi/arf`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteLigneARFManuelle error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}
