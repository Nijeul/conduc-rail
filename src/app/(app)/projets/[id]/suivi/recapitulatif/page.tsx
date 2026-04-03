import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RecapitulatifTravaux } from '@/components/modules/recapitulatif/RecapitulatifTravaux'

interface PageProps {
  params: { id: string }
}

export default async function RecapitulatifPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const member = await prisma.projetMember.findUnique({
    where: { userId_projetId: { userId: session.user.id, projetId: params.id } },
  })
  if (!member) redirect('/projets')

  const [lignesDE, rapports, projet] = await Promise.all([
    prisma.ligneDE.findMany({
      where: { projetId: params.id },
      orderBy: { ordre: 'asc' },
    }),
    prisma.rapportJournalier.findMany({
      where: { projetId: params.id },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, titre: true, posteNuit: true, travaux: true },
    }),
    prisma.projet.findUnique({
      where: { id: params.id },
      select: { name: true },
    }),
  ])

  // Build matrix from travaux JSON: ligneDEId -> rapportId -> quantite
  const matrice: Record<string, Record<string, number>> = {}
  for (const rapport of rapports) {
    const travauxArray = Array.isArray(rapport.travaux) ? rapport.travaux : []
    for (const item of travauxArray as Array<{ ligneDeId?: string; quantiteRealisee?: number }>) {
      if (item.ligneDeId && item.quantiteRealisee && item.quantiteRealisee > 0) {
        if (!matrice[item.ligneDeId]) matrice[item.ligneDeId] = {}
        matrice[item.ligneDeId][rapport.id] = item.quantiteRealisee
      }
    }
  }

  // Only include rapports that have at least one travail entry
  const rapportIdsAvecTravaux = new Set<string>()
  for (const rapportMap of Object.values(matrice)) {
    for (const rapportId of Object.keys(rapportMap)) {
      rapportIdsAvecTravaux.add(rapportId)
    }
  }
  const rapportsFiltres = rapports.filter(r => rapportIdsAvecTravaux.has(r.id))

  return (
    <RecapitulatifTravaux
      projetId={params.id}
      projetName={projet?.name || ''}
      lignesDE={lignesDE.map(l => ({
        id: l.id,
        code: l.code,
        designation: l.designation,
        unite: l.unite,
        quantite: l.quantite,
      }))}
      rapports={rapportsFiltres.map(r => ({
        id: r.id,
        date: r.date.toISOString(),
        titre: r.titre,
      }))}
      matrice={matrice}
    />
  )
}
