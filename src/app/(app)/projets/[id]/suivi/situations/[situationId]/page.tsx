import { notFound } from 'next/navigation'
import { getProjet } from '@/actions/projets'
import { getSituationDetail } from '@/actions/situations'
import { SituationEditor } from '@/components/modules/situations/SituationEditor'

interface Props {
  params: { id: string; situationId: string }
}

export default async function SituationDetailPage({ params }: Props) {
  const [projet, detail] = await Promise.all([
    getProjet(params.id),
    getSituationDetail(params.id, params.situationId),
  ])

  if (!detail) notFound()

  return (
    <div className="p-6">
      <SituationEditor
        projetId={params.id}
        projetName={projet?.name || 'Projet'}
        initialDetail={detail}
      />
    </div>
  )
}
