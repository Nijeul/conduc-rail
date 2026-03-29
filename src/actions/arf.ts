'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
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

export interface ARFRow {
  id: string
  date: string
  posteNuit: boolean
  heureDebutPrevue: string | null
  heureFinPrevue: string | null
  heureDebut: string | null
  heureFin: string | null
  heureRestituee: string | null
}

export async function getARFData(projetId: string): Promise<ARFRow[]> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const rapports = await prisma.rapportJournalier.findMany({
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
  })

  return rapports.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    posteNuit: r.posteNuit,
    heureDebutPrevue: r.heureDebutPrevue,
    heureFinPrevue: r.heureFinPrevue,
    heureDebut: r.heureDebut,
    heureFin: r.heureFin,
    heureRestituee: r.heureRestituee,
  }))
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
