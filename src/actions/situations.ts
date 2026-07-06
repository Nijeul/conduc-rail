'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const CreateSituationSchema = z.object({
  libelle: z.string().max(200).optional().nullable(),
  annee: z.number().int().min(2000).max(2100),
  mois: z.number().int().min(1).max(12),
})

const UpdateSituationSchema = z.object({
  id: z.string().min(1),
  libelle: z.string().max(200).optional().nullable(),
  annee: z.number().int().min(2000).max(2100).optional(),
  mois: z.number().int().min(1).max(12).optional(),
  commentaire: z.string().max(2000).optional().nullable(),
  statut: z.enum(['brouillon', 'validee']).optional(),
})

const SaveLignesSchema = z.object({
  situationId: z.string().min(1),
  lignes: z.array(
    z.object({
      ligneDEId: z.string().min(1),
      quantite: z.number(),
    })
  ),
})

export interface SituationResume {
  id: string
  numero: number
  libelle: string | null
  annee: number
  mois: number
  statut: string
  montantSituation: number
  montantCumule: number
  updatedAt: string
}

export interface SituationLigneDetail {
  ligneDEId: string
  code: string
  designation: string
  unite: string
  prixUnitaire: number
  quantiteMarche: number
  quantiteAnterieure: number
  montantAnterieur: number
  quantite: number
}

export interface SituationDetail {
  id: string
  numero: number
  libelle: string | null
  annee: number
  mois: number
  statut: string
  commentaire: string | null
  lignes: SituationLigneDetail[]
}

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

async function checkSituation(projetId: string, situationId: string) {
  const situation = await prisma.situation.findUnique({ where: { id: situationId } })
  if (!situation || situation.projetId !== projetId) {
    throw new Error('Situation introuvable')
  }
  return situation
}

// ---------------------------------------------------------------------------
// Liste des situations avec montants
// ---------------------------------------------------------------------------

export async function getSituations(projetId: string): Promise<SituationResume[]> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const situations = await prisma.situation.findMany({
    where: { projetId },
    orderBy: { numero: 'asc' },
    include: { lignes: true },
  })

  let cumul = 0
  return situations.map((s) => {
    const montantSituation = s.lignes.reduce(
      (sum, l) => sum + l.quantite * l.prixUnitaire,
      0
    )
    cumul += montantSituation
    return {
      id: s.id,
      numero: s.numero,
      libelle: s.libelle,
      annee: s.annee,
      mois: s.mois,
      statut: s.statut,
      montantSituation,
      montantCumule: cumul,
      updatedAt: s.updatedAt.toISOString(),
    }
  })
}

// ---------------------------------------------------------------------------
// Détail d'une situation (lignes DE + cumuls antérieurs)
// ---------------------------------------------------------------------------

export async function getSituationDetail(
  projetId: string,
  situationId: string
): Promise<SituationDetail | null> {
  const user = await getAuthUser()
  await checkMembership(projetId, user.id)

  const situation = await prisma.situation.findUnique({
    where: { id: situationId },
    include: { lignes: true },
  })
  if (!situation || situation.projetId !== projetId) return null

  const [lignesDE, lignesAnterieures] = await Promise.all([
    prisma.ligneDE.findMany({ where: { projetId }, orderBy: { ordre: 'asc' } }),
    prisma.ligneSituation.findMany({
      where: {
        situation: { projetId, numero: { lt: situation.numero } },
      },
    }),
  ])

  const anterieurParLigne = new Map<string, { qte: number; montant: number }>()
  for (const l of lignesAnterieures) {
    const prev = anterieurParLigne.get(l.ligneDEId) || { qte: 0, montant: 0 }
    prev.qte += l.quantite
    prev.montant += l.quantite * l.prixUnitaire
    anterieurParLigne.set(l.ligneDEId, prev)
  }

  const quantiteParLigne = new Map<string, number>()
  for (const l of situation.lignes) {
    quantiteParLigne.set(l.ligneDEId, l.quantite)
  }

  return {
    id: situation.id,
    numero: situation.numero,
    libelle: situation.libelle,
    annee: situation.annee,
    mois: situation.mois,
    statut: situation.statut,
    commentaire: situation.commentaire,
    lignes: lignesDE.map((l) => {
      const ant = anterieurParLigne.get(l.id) || { qte: 0, montant: 0 }
      return {
        ligneDEId: l.id,
        code: l.code,
        designation: l.designation,
        unite: l.unite,
        prixUnitaire: l.prixUnitaire,
        quantiteMarche: l.quantite,
        quantiteAnterieure: ant.qte,
        montantAnterieur: ant.montant,
        quantite: quantiteParLigne.get(l.id) ?? 0,
      }
    }),
  }
}

// ---------------------------------------------------------------------------
// Création / mise à jour / suppression
// ---------------------------------------------------------------------------

export async function createSituation(
  projetId: string,
  data: unknown
): Promise<ActionResult<{ id: string; numero: number }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = CreateSituationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const maxNumero = await prisma.situation.aggregate({
      where: { projetId },
      _max: { numero: true },
    })
    const numero = (maxNumero._max.numero ?? 0) + 1

    const situation = await prisma.situation.create({
      data: {
        projetId,
        numero,
        libelle: parsed.data.libelle ?? null,
        annee: parsed.data.annee,
        mois: parsed.data.mois,
      },
    })

    revalidatePath(`/projets/${projetId}/suivi/situations`)
    return { success: true, data: { id: situation.id, numero } }
  } catch (error) {
    console.error('createSituation error:', error)
    return { success: false, error: 'Erreur lors de la creation de la situation' }
  }
}

export async function updateSituation(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = UpdateSituationSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const { id, ...updateData } = parsed.data
    await checkSituation(projetId, id)

    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== undefined)
    )

    await prisma.situation.update({ where: { id }, data: cleanData })

    revalidatePath(`/projets/${projetId}/suivi/situations`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateSituation error:', error)
    return { success: false, error: 'Erreur lors de la mise a jour' }
  }
}

export async function saveLignesSituation(
  projetId: string,
  data: unknown
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    const parsed = SaveLignesSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message }
    }

    const situation = await checkSituation(projetId, parsed.data.situationId)
    if (situation.statut === 'validee') {
      return { success: false, error: 'Situation validee : repassez-la en brouillon pour la modifier' }
    }

    // Snapshot des PU actuels du Détail Estimatif
    const lignesDE = await prisma.ligneDE.findMany({ where: { projetId } })
    const puParLigne = new Map(lignesDE.map((l) => [l.id, l.prixUnitaire]))

    await prisma.$transaction(
      parsed.data.lignes
        .filter((l) => puParLigne.has(l.ligneDEId))
        .map((l) =>
          prisma.ligneSituation.upsert({
            where: {
              situationId_ligneDEId: {
                situationId: situation.id,
                ligneDEId: l.ligneDEId,
              },
            },
            create: {
              situationId: situation.id,
              ligneDEId: l.ligneDEId,
              quantite: l.quantite,
              prixUnitaire: puParLigne.get(l.ligneDEId) ?? 0,
            },
            update: {
              quantite: l.quantite,
              prixUnitaire: puParLigne.get(l.ligneDEId) ?? 0,
            },
          })
        )
    )

    // Marquer la situation comme modifiée
    await prisma.situation.update({
      where: { id: situation.id },
      data: { updatedAt: new Date() },
    })

    return { success: true, data: undefined }
  } catch (error) {
    console.error('saveLignesSituation error:', error)
    return { success: false, error: "Erreur lors de l'enregistrement des lignes" }
  }
}

export async function deleteSituation(
  projetId: string,
  situationId: string
): Promise<ActionResult> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)
    await checkSituation(projetId, situationId)

    await prisma.situation.delete({ where: { id: situationId } })

    revalidatePath(`/projets/${projetId}/suivi/situations`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteSituation error:', error)
    return { success: false, error: 'Erreur lors de la suppression' }
  }
}

// ---------------------------------------------------------------------------
// Pré-remplissage depuis les rapports journaliers du mois
// ---------------------------------------------------------------------------

export async function prefillDepuisRapports(
  projetId: string,
  situationId: string
): Promise<ActionResult<{ lignes: Array<{ ligneDEId: string; quantite: number }> }>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)
    const situation = await checkSituation(projetId, situationId)

    const debut = new Date(Date.UTC(situation.annee, situation.mois - 1, 1))
    const fin = new Date(Date.UTC(situation.annee, situation.mois, 1))

    const rapports = await prisma.rapportJournalier.findMany({
      where: {
        projetId,
        date: { gte: debut, lt: fin },
      },
    })

    const qtesParLigne = new Map<string, number>()
    for (const rapport of rapports) {
      const travaux = rapport.travaux as Array<{
        ligneDeId: string
        quantiteRealisee: number
      }>
      if (!Array.isArray(travaux)) continue
      for (const t of travaux) {
        if (t.ligneDeId && typeof t.quantiteRealisee === 'number') {
          qtesParLigne.set(
            t.ligneDeId,
            (qtesParLigne.get(t.ligneDeId) || 0) + t.quantiteRealisee
          )
        }
      }
    }

    return {
      success: true,
      data: {
        lignes: Array.from(qtesParLigne.entries()).map(([ligneDEId, quantite]) => ({
          ligneDEId,
          quantite,
        })),
      },
    }
  } catch (error) {
    console.error('prefillDepuisRapports error:', error)
    return { success: false, error: 'Erreur lors du pre-remplissage depuis les rapports' }
  }
}
