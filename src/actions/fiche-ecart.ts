'use server'

import { revalidatePath } from 'next/cache'
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

export async function getLignesFicheEcart(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.ligneFicheEcart.findMany({
    where: { projetId },
    orderBy: { ordre: 'asc' },
  })
}

export async function createLigneFicheEcart(
  projetId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const maxOrdre = await prisma.ligneFicheEcart.aggregate({
      where: { projetId },
      _max: { ordre: true },
    })

    const ligne = await prisma.ligneFicheEcart.create({
      data: {
        projetId,
        ordre: (maxOrdre._max.ordre ?? -1) + 1,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: { id: ligne.id } }
  } catch (error) {
    console.error('createLigneFicheEcart error:', error)
    return { success: false, error: 'Erreur lors de la creation de la ligne' }
  }
}

export async function updateLigneFicheEcart(
  projetId: string,
  ligneId: string,
  data: {
    etude?: string
    prevuDCE?: string
    phaseTransitoire?: string
    exe?: string
    impacts?: string
    delaisImpactes?: string
    coutImpactes?: string
  }
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.ligneFicheEcart.update({
      where: { id: ligneId },
      data,
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateLigneFicheEcart error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function deleteLigneFicheEcart(
  projetId: string,
  ligneId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.ligneFicheEcart.delete({ where: { id: ligneId } })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteLigneFicheEcart error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

export async function importerDepuisJournal(
  projetId: string,
  evenementIds: string[]
): Promise<ActionResult<{ count: number }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    // Fetch selected events
    const evenements = await prisma.evenementChantier.findMany({
      where: { id: { in: evenementIds }, projetId },
      orderBy: { date: 'asc' },
    })

    if (evenements.length === 0) {
      return { success: false, error: 'Aucun evenement selectionne' }
    }

    // Get current max ordre
    const maxOrdre = await prisma.ligneFicheEcart.aggregate({
      where: { projetId },
      _max: { ordre: true },
    })
    let nextOrdre = (maxOrdre._max.ordre ?? -1) + 1

    // Create lines for each event
    for (const ev of evenements) {
      const dateStr = new Date(ev.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      await prisma.ligneFicheEcart.create({
        data: {
          projetId,
          evenementId: ev.id,
          etude: `${ev.titre} (${dateStr})`,
          ordre: nextOrdre++,
        },
      })
    }

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: { count: evenements.length } }
  } catch (error) {
    console.error('importerDepuisJournal error:', error)
    return { success: false, error: 'Erreur lors de l\'import' }
  }
}
