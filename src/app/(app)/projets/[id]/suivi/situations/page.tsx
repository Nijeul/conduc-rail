import { getSituations } from '@/actions/situations'
import { SituationsList } from '@/components/modules/situations/SituationsList'

interface Props {
  params: { id: string }
}

export default async function SituationsPage({ params }: Props) {
  const situations = await getSituations(params.id)

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#004489]">Situations de Travaux</h2>
        <p className="text-sm text-gray-500">
          Créez une situation mensuelle, modifiez-la puis validez-la — chaque situation
          reste consultable
        </p>
      </div>
      <SituationsList projetId={params.id} situations={situations} />
    </div>
  )
}
