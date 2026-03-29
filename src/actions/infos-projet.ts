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

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const InfosProjetSchema = z.object({
  moaNom: z.string().max(200).optional(),
  moaPrenom: z.string().max(200).optional(),
  moaAdresse: z.string().max(500).optional(),
  numeroAffaire: z.string().max(100).optional(),
  numeroCommande: z.string().max(100).optional(),
  numeroOTP: z.string().max(100).optional(),
  adresseChantier: z.string().max(500).optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function getInfosProjet(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const projet = await prisma.projet.findUnique({
    where: { id: projetId },
    select: {
      id: true,
      name: true,
      moaNom: true,
      moaPrenom: true,
      moaAdresse: true,
      numeroAffaire: true,
      numeroCommande: true,
      numeroOTP: true,
      adresseChantier: true,
      dateDebut: true,
      dateFin: true,
    },
  })

  return projet
}

export async function updateInfosProjet(
  projetId: string,
  data: z.infer<typeof InfosProjetSchema>
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = InfosProjetSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { dateDebut, dateFin, ...rest } = parsed.data

    await prisma.projet.update({
      where: { id: projetId },
      data: {
        ...rest,
        moaNom: rest.moaNom || null,
        moaPrenom: rest.moaPrenom || null,
        moaAdresse: rest.moaAdresse || null,
        numeroAffaire: rest.numeroAffaire || null,
        numeroCommande: rest.numeroCommande || null,
        numeroOTP: rest.numeroOTP || null,
        adresseChantier: rest.adresseChantier || null,
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
      },
    })

    revalidatePath(`/projets/${projetId}/infos`)
    revalidatePath(`/projets/${projetId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateInfosProjet error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour des infos projet' }
  }
}
