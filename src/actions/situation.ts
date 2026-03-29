'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

export interface SituationLigne {
  id: string
  code: string
  designation: string
  unite: string
  quantiteMarche: number
  quantiteRealisee: number
  avancement: number
  montantRealise: number
  prixUnitaire: number
}

export interface SituationResult {
  lignes: SituationLigne[]
  totalMontantRealise: number
  dateDebut: string
  dateFin: string
}

export async function calculerSituation(
  projetId: string,
  dateDebut: string,
  dateFin: string
): Promise<ActionResult<SituationResult>> {
  try {
    const user = await getAuthUser()
    await checkMembership(projetId, user.id)

    // Get all LigneDE for this project
    const lignesDE = await prisma.ligneDE.findMany({
      where: { projetId },
      orderBy: { ordre: 'asc' },
    })

    // Get rapports in the date range
    const rapports = await prisma.rapportJournalier.findMany({
      where: {
        projetId,
        date: {
          gte: new Date(dateDebut),
          lte: new Date(dateFin + 'T23:59:59.999Z'),
        },
      },
    })

    // Aggregate quantities per ligneDE
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

    // Build situation lines
    let totalMontantRealise = 0
    const lignes: SituationLigne[] = lignesDE.map((l) => {
      const qteRealisee = qtesParLigne.get(l.id) || 0
      const avancement = l.quantite > 0 ? (qteRealisee / l.quantite) * 100 : 0
      const montantRealise = qteRealisee * l.prixUnitaire
      totalMontantRealise += montantRealise

      return {
        id: l.id,
        code: l.code,
        designation: l.designation,
        unite: l.unite,
        quantiteMarche: l.quantite,
        quantiteRealisee: qteRealisee,
        avancement,
        montantRealise,
        prixUnitaire: l.prixUnitaire,
      }
    })

    return {
      success: true,
      data: {
        lignes,
        totalMontantRealise,
        dateDebut,
        dateFin,
      },
    }
  } catch (error) {
    console.error('calculerSituation error:', error)
    return {
      success: false,
      error: 'Erreur lors du calcul de la situation',
    }
  }
}
