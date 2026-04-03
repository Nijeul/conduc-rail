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

  const [lignesDE, rapports, avancements, projet] = await Promise.all([
    prisma.ligneDE.findMany({
      where: { projetId: params.id },
      orderBy: { ordre: 'asc' },
    }),
    prisma.rapportJournalier.findMany({
      where: { projetId: params.id },
      orderBy: { date: 'asc' },
      select: { id: true, date: true, titre: true },
    }),
    prisma.ligneAvancement.findMany({
      where: { rapport: { projetId: params.id } },
    }),
    prisma.projet.findUnique({
      where: { id: params.id },
      select: { name: true },
    }),
  ])

  // Build matrix: ligneDEId -> rapportId -> quantite
  const matrice: Record<string, Record<string, number>> = {}
  for (const av of avancements) {
    if (!matrice[av.ligneDEId]) matrice[av.ligneDEId] = {}
    matrice[av.ligneDEId][av.rapportId] = av.quantiteRealisee
  }

  // Only include rapports that have at least one avancement
  const rapportIdsAvecAvancements = new Set(avancements.map(a => a.rapportId))
  const rapportsFiltres = rapports.filter(r => rapportIdsAvecAvancements.has(r.id))

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
