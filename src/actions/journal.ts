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

const EvenementSchema = z.object({
  date: z.string().min(1, 'La date est requise'),
  titre: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  categorie: z.string().min(1, 'La categorie est requise'),
  source: z.string().optional(),
  courrierId: z.string().optional(),
})

const FichierSchema = z.object({
  nom: z.string().min(1),
  type: z.string().min(1),
  contenu: z.string().min(1),
  taille: z.number().max(2 * 1024 * 1024, 'Fichier trop volumineux (max 2MB)'),
})

export async function getEvenements(projetId: string) {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  return prisma.evenementChantier.findMany({
    where: { projetId },
    include: { fichiers: true },
    orderBy: { date: 'asc' },
  })
}

export async function createEvenement(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = EvenementSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const d = parsed.data

    const evenement = await prisma.evenementChantier.create({
      data: {
        projetId,
        date: new Date(d.date),
        titre: d.titre,
        description: d.description || null,
        categorie: d.categorie,
        source: d.source || null,
        courrierId: d.courrierId || null,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: { id: evenement.id } }
  } catch (error) {
    console.error('createEvenement error:', error)
    return { success: false, error: 'Erreur lors de la creation de l\'evenement' }
  }
}

export async function updateEvenement(
  projetId: string,
  data: unknown & { id?: string }
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const schemaWithId = EvenementSchema.extend({ id: z.string().min(1) })
    const parsed = schemaWithId.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const d = parsed.data

    await prisma.evenementChantier.update({
      where: { id: d.id },
      data: {
        date: new Date(d.date),
        titre: d.titre,
        description: d.description || null,
        categorie: d.categorie,
        source: d.source || null,
        courrierId: d.courrierId || null,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateEvenement error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour de l\'evenement' }
  }
}

export async function deleteEvenement(
  projetId: string,
  evenementId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.evenementChantier.delete({ where: { id: evenementId } })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteEvenement error:', error)
    return { success: false, error: 'Erreur lors de la suppression de l\'evenement' }
  }
}

export async function addFichierEvenement(
  projetId: string,
  evenementId: string,
  fichierData: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = FichierSchema.safeParse(fichierData)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const d = parsed.data

    // Check max 10 fichiers
    const count = await prisma.fichierEvenement.count({
      where: { evenementId },
    })
    if (count >= 10) {
      return { success: false, error: 'Maximum 10 fichiers par evenement' }
    }

    const fichier = await prisma.fichierEvenement.create({
      data: {
        evenementId,
        nom: d.nom,
        type: d.type,
        contenu: d.contenu,
        taille: d.taille,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: { id: fichier.id } }
  } catch (error) {
    console.error('addFichierEvenement error:', error)
    return { success: false, error: 'Erreur lors de l\'ajout du fichier' }
  }
}

export async function deleteFichierEvenement(
  projetId: string,
  fichierId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    await prisma.fichierEvenement.delete({ where: { id: fichierId } })

    revalidatePath(`/projets/${projetId}/suivi/journal`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteFichierEvenement error:', error)
    return { success: false, error: 'Erreur lors de la suppression du fichier' }
  }
}
