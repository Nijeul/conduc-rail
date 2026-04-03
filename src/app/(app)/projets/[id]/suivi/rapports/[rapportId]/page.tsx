import { getProjet } from '@/actions/projets'
import { getRapport, getUsers, getAvancements, getAllAvancements } from '@/actions/rapports'
import { getLignesDE } from '@/actions/detail-estimatif'
import { RapportForm } from '@/components/modules/rapports/RapportForm'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string; rapportId: string }
}

export default async function EditRapportPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  const [rapport, lignesDE, users, avancementsCeRapport, tousAvancements] = await Promise.all([
    getRapport(params.rapportId, params.id),
    getLignesDE(params.id),
    getUsers(),
    getAvancements(params.rapportId, params.id),
    getAllAvancements(params.id),
  ])

  if (!rapport) notFound()

  const rapportData = {
    ...rapport,
    travaux: (rapport.travaux as Array<{
      ligneDeId: string
      code: string
      designation: string
      unite: string
      quantiteMarche: number
      quantiteRealisee: number
    }>) || [],
  }

  // Build total deja realise (excluding current rapport)
  const totalDejaRealise: Record<string, number> = {}
  for (const av of tousAvancements) {
    if (av.rapportId === params.rapportId) continue
    totalDejaRealise[av.ligneDEId] = (totalDejaRealise[av.ligneDEId] || 0) + av.quantiteRealisee
  }

  return (
    <RapportForm
      projetId={params.id}
      projetName={projet.name}
      rapport={rapportData}
      lignesDE={lignesDE}
      users={users}
      isNew={false}
      avancementsExistants={avancementsCeRapport.map(a => ({
        ligneDEId: a.ligneDEId,
        quantiteRealisee: a.quantiteRealisee,
      }))}
      totalDejaRealise={totalDejaRealise}
    />
  )
}
