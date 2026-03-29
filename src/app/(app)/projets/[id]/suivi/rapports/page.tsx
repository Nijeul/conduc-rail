import { getRapports } from '@/actions/rapports'
import { RapportsTable } from '@/components/modules/rapports/RapportsTable'

interface Props {
  params: { id: string }
}

export default async function RapportsPage({ params }: Props) {
  const rapports = await getRapports(params.id)

  return (
    <div className="p-6">
      <RapportsTable rapports={rapports} projetId={params.id} />
    </div>
  )
}
