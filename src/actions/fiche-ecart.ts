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

// Creer un chapitre
export async function createChapitreFicheEcart(
  projetId: string,
  nom: string = 'Nouveau chapitre'
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
        chapitre: nom,
        estChapitre: true,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: { id: ligne.id } }
  } catch (error) {
    console.error('createChapitreFicheEcart error:', error)
    return { success: false, error: 'Erreur lors de la creation du chapitre' }
  }
}

// Renommer un chapitre
export async function renommerChapitre(
  projetId: string,
  ligneId: string,
  nom: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    // Trouver le chapitre actuel pour connaitre l'ancien nom
    const chapitreLigne = await prisma.ligneFicheEcart.findUnique({
      where: { id: ligneId },
    })
    if (!chapitreLigne || !chapitreLigne.estChapitre) {
      return { success: false, error: 'Chapitre introuvable' }
    }

    const ancienNom = chapitreLigne.chapitre

    // Mettre a jour le chapitre lui-meme
    await prisma.ligneFicheEcart.update({
      where: { id: ligneId },
      data: { chapitre: nom },
    })

    // Mettre a jour toutes les lignes enfants qui ont l'ancien nom
    await prisma.ligneFicheEcart.updateMany({
      where: {
        projetId,
        chapitre: ancienNom,
        estChapitre: false,
      },
      data: { chapitre: nom },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('renommerChapitre error:', error)
    return { success: false, error: 'Erreur lors du renommage' }
  }
}

// Supprimer un chapitre et ses lignes
export async function deleteChapitreFicheEcart(
  projetId: string,
  ligneId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const chapitreLigne = await prisma.ligneFicheEcart.findUnique({
      where: { id: ligneId },
    })
    if (!chapitreLigne || !chapitreLigne.estChapitre) {
      return { success: false, error: 'Chapitre introuvable' }
    }

    // Supprimer toutes les lignes de ce chapitre (enfants + en-tete)
    await prisma.ligneFicheEcart.deleteMany({
      where: {
        projetId,
        chapitre: chapitreLigne.chapitre,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteChapitreFicheEcart error:', error)
    return { success: false, error: 'Erreur lors de la suppression du chapitre' }
  }
}

// Creer une ligne sous un chapitre
export async function createLigneSousChapitre(
  projetId: string,
  chapitreNom: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    // Trouver toutes les lignes de ce chapitre pour determiner l'ordre
    const lignesChapitre = await prisma.ligneFicheEcart.findMany({
      where: { projetId, chapitre: chapitreNom },
      orderBy: { ordre: 'asc' },
    })

    // L'ordre de la nouvelle ligne = max ordre du chapitre + 1
    // Mais il faut aussi decaler les lignes qui suivent
    const maxOrdreChapitre = lignesChapitre.length > 0
      ? Math.max(...lignesChapitre.map((l) => l.ordre))
      : 0

    const nouvelOrdre = maxOrdreChapitre + 1

    // Decaler toutes les lignes avec ordre >= nouvelOrdre qui ne sont pas dans ce chapitre
    await prisma.ligneFicheEcart.updateMany({
      where: {
        projetId,
        ordre: { gte: nouvelOrdre },
        NOT: { chapitre: chapitreNom },
      },
      data: { ordre: { increment: 1 } },
    })

    // Aussi decaler les lignes du meme chapitre qui sont apres (ne devrait pas arriver mais securite)
    const ligne = await prisma.ligneFicheEcart.create({
      data: {
        projetId,
        ordre: nouvelOrdre,
        chapitre: chapitreNom,
        estChapitre: false,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: { id: ligne.id } }
  } catch (error) {
    console.error('createLigneSousChapitre error:', error)
    return { success: false, error: 'Erreur lors de la creation de la ligne' }
  }
}

// Ancien createLigne - cree sous le dernier chapitre ou "Sans chapitre"
export async function createLigneFicheEcart(
  projetId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    // Trouver le dernier chapitre
    const dernierChapitre = await prisma.ligneFicheEcart.findFirst({
      where: { projetId, estChapitre: true },
      orderBy: { ordre: 'desc' },
    })

    const chapitreNom = dernierChapitre ? dernierChapitre.chapitre : 'Sans chapitre'

    // Si pas de chapitre, en creer un "Sans chapitre"
    if (!dernierChapitre) {
      const maxOrdre = await prisma.ligneFicheEcart.aggregate({
        where: { projetId },
        _max: { ordre: true },
      })
      await prisma.ligneFicheEcart.create({
        data: {
          projetId,
          ordre: (maxOrdre._max.ordre ?? -1) + 1,
          chapitre: 'Sans chapitre',
          estChapitre: true,
        },
      })
    }

    return createLigneSousChapitre(projetId, chapitreNom)
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

    // Trouver le dernier chapitre ou en creer un
    let dernierChapitre = await prisma.ligneFicheEcart.findFirst({
      where: { projetId, estChapitre: true },
      orderBy: { ordre: 'desc' },
    })

    if (!dernierChapitre) {
      const maxOrdre = await prisma.ligneFicheEcart.aggregate({
        where: { projetId },
        _max: { ordre: true },
      })
      dernierChapitre = await prisma.ligneFicheEcart.create({
        data: {
          projetId,
          ordre: (maxOrdre._max.ordre ?? -1) + 1,
          chapitre: 'Import Journal',
          estChapitre: true,
        },
      })
    }

    // Trouver la fin du chapitre
    const lignesChapitre = await prisma.ligneFicheEcart.findMany({
      where: { projetId, chapitre: dernierChapitre.chapitre },
      orderBy: { ordre: 'asc' },
    })
    let nextOrdre = lignesChapitre.length > 0
      ? Math.max(...lignesChapitre.map((l) => l.ordre)) + 1
      : dernierChapitre.ordre + 1

    // Decaler les lignes qui suivent
    await prisma.ligneFicheEcart.updateMany({
      where: {
        projetId,
        ordre: { gte: nextOrdre },
        NOT: { chapitre: dernierChapitre.chapitre },
      },
      data: { ordre: { increment: evenements.length } },
    })

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
          chapitre: dernierChapitre.chapitre,
          estChapitre: false,
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
