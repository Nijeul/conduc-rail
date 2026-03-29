import { getProjet } from '@/actions/projets'
import { CompositionForm } from '@/components/modules/composition/CompositionForm'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function NouvelleCompositionPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  return (
    <CompositionForm
      projetId={params.id}
      projetName={projet.name}
      isNew={true}
    />
  )
}
