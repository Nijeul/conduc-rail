import { getProjet } from '@/actions/projets'
import { getRapport, getUsers } from '@/actions/rapports'
import { getLignesDE } from '@/actions/detail-estimatif'
import { RapportForm } from '@/components/modules/rapports/RapportForm'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string; rapportId: string }
}

export default async function EditRapportPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  const [rapport, lignesDE, users] = await Promise.all([
    getRapport(params.rapportId, params.id),
    getLignesDE(params.id),
    getUsers(),
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

  return (
    <RapportForm
      projetId={params.id}
      projetName={projet.name}
      rapport={rapportData}
      lignesDE={lignesDE}
      users={users}
      isNew={false}
    />
  )
}
