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

const RapportSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  nomChantier: z.string().optional(),
  titre: z.string().optional(),
  posteNuit: z.boolean().default(true),
  heureDebutPrevue: z.string().optional(),
  heureFinPrevue: z.string().optional(),
  heureDebut: z.string().optional(),
  heureFin: z.string().optional(),
  heureRestituee: z.string().optional(),
  production: z.string().optional(),
  commentaire: z.string().optional(),
  redacteurId: z.string().optional(),
  dateRedaction: z.string().optional(),
  valide: z.boolean().default(false),
  travaux: z.array(z.object({
    ligneDeId: z.string(),
    code: z.string(),
    designation: z.string(),
    unite: z.string(),
    quantiteMarche: z.number(),
    quantiteRealisee: z.number(),
  })).default([]),
})

export async function getRapports(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.rapportJournalier.findMany({
    where: { projetId },
    include: {
      redacteur: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: 'desc' },
  })
}

export async function getRapport(rapportId: string, projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.rapportJournalier.findUnique({
    where: { id: rapportId },
    include: {
      redacteur: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function createRapport(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = RapportSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const d = parsed.data
    const travauxFiltered = d.travaux.filter(t => t.quantiteRealisee > 0)

    const rapport = await prisma.rapportJournalier.create({
      data: {
        projetId,
        date: new Date(d.date),
        nomChantier: d.nomChantier || null,
        titre: d.titre || null,
        posteNuit: d.posteNuit,
        heureDebutPrevue: d.heureDebutPrevue || null,
        heureFinPrevue: d.heureFinPrevue || null,
        heureDebut: d.heureDebut || null,
        heureFin: d.heureFin || null,
        heureRestituee: d.heureRestituee || null,
        production: d.production || null,
        commentaire: d.commentaire || null,
        redacteurId: d.redacteurId || null,
        dateRedaction: d.dateRedaction ? new Date(d.dateRedaction) : null,
        valide: d.valide,
        travaux: travauxFiltered,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/rapports`)
    return { success: true, data: { id: rapport.id } }
  } catch (error) {
    console.error('createRapport error:', error)
    return { success: false, error: 'Erreur lors de la creation du rapport' }
  }
}

export async function updateRapport(
  rapportId: string,
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = RapportSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const d = parsed.data
    const travauxFiltered = d.travaux.filter(t => t.quantiteRealisee > 0)

    await prisma.rapportJournalier.update({
      where: { id: rapportId },
      data: {
        date: new Date(d.date),
        nomChantier: d.nomChantier || null,
        titre: d.titre || null,
        posteNuit: d.posteNuit,
        heureDebutPrevue: d.heureDebutPrevue || null,
        heureFinPrevue: d.heureFinPrevue || null,
        heureDebut: d.heureDebut || null,
        heureFin: d.heureFin || null,
        heureRestituee: d.heureRestituee || null,
        production: d.production || null,
        commentaire: d.commentaire || null,
        redacteurId: d.redacteurId || null,
        dateRedaction: d.dateRedaction ? new Date(d.dateRedaction) : null,
        valide: d.valide,
        travaux: travauxFiltered,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/rapports`)
    revalidatePath(`/projets/${projetId}/suivi/rapports/${rapportId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateRapport error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour du rapport' }
  }
}

export async function deleteRapport(
  rapportId: string,
  projetId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.rapportJournalier.delete({ where: { id: rapportId } })

    revalidatePath(`/projets/${projetId}/suivi/rapports`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteRapport error:', error)
    return { success: false, error: 'Erreur lors de la suppression du rapport' }
  }
}

export async function searchPersonnel(query: string) {
  await getAuthUser()

  return prisma.personnel.findMany({
    where: {
      OR: [
        { nom: { contains: query, mode: 'insensitive' } },
        { prenom: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 20,
    orderBy: { nom: 'asc' },
  })
}

export async function getUsers() {
  await getAuthUser()

  return prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })
}
