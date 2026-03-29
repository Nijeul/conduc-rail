import { getProjet } from '@/actions/projets'
import { getComposition } from '@/actions/composition'
import { CompositionForm } from '@/components/modules/composition/CompositionForm'
import { notFound } from 'next/navigation'
import type { Vehicule } from '@/actions/composition'

interface Props {
  params: { id: string; compositionId: string }
}

export default async function EditCompositionPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  const composition = await getComposition(params.compositionId, params.id)
  if (!composition) notFound()

  const compositionData = {
    ...composition,
    vehicules: (composition.vehicules as Vehicule[]) || [],
  }

  return (
    <CompositionForm
      projetId={params.id}
      projetName={projet.name}
      composition={compositionData}
      isNew={false}
    />
  )
}
