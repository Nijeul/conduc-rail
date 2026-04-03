import { getProjet } from '@/actions/projets'
import { getLignesDE } from '@/actions/detail-estimatif'
import { getUsers, getAllAvancements } from '@/actions/rapports'
import { RapportForm } from '@/components/modules/rapports/RapportForm'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function NouveauRapportPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  const [lignesDE, users, tousAvancements] = await Promise.all([
    getLignesDE(params.id),
    getUsers(),
    getAllAvancements(params.id),
  ])

  // Build total deja realise
  const totalDejaRealise: Record<string, number> = {}
  for (const av of tousAvancements) {
    totalDejaRealise[av.ligneDEId] = (totalDejaRealise[av.ligneDEId] || 0) + av.quantiteRealisee
  }

  return (
    <RapportForm
      projetId={params.id}
      projetName={projet.name}
      lignesDE={lignesDE}
      users={users}
      isNew={true}
      totalDejaRealise={totalDejaRealise}
    />
  )
}
