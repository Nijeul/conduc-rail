import { getCompositions } from '@/actions/composition'
import { CompositionTable } from '@/components/modules/composition/CompositionTable'

interface Props {
  params: { id: string }
}

export default async function CompositionPage({ params }: Props) {
  const compositions = await getCompositions(params.id)

  return (
    <div className="p-6">
      <CompositionTable compositions={compositions} projetId={params.id} />
    </div>
  )
}
