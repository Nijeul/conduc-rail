import { getProjet } from '@/actions/projets'
import { getCoTraitance } from '@/actions/cotraitance'
import { RepartitionCotraitance } from '@/components/modules/detail-estimatif/RepartitionCotraitance'

interface Props {
  params: { id: string }
}

export default async function CotraitancePage({ params }: Props) {
  const [projet, data] = await Promise.all([
    getProjet(params.id),
    getCoTraitance(params.id),
  ])

  return (
    <div className="p-6">
      <RepartitionCotraitance
        projetId={params.id}
        projetName={projet?.name || 'Projet'}
        initialData={data}
      />
    </div>
  )
}
