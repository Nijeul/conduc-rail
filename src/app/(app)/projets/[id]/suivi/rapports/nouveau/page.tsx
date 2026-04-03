import { getProjet } from '@/actions/projets'
import { getLignesDE } from '@/actions/detail-estimatif'
import { getUsers } from '@/actions/rapports'
import { RapportForm } from '@/components/modules/rapports/RapportForm'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function NouveauRapportPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  const [lignesDE, users] = await Promise.all([
    getLignesDE(params.id),
    getUsers(),
  ])

  return (
    <RapportForm
      projetId={params.id}
      projetName={projet.name}
      lignesDE={lignesDE}
      users={users}
      isNew={true}
    />
  )
}
