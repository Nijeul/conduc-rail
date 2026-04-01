import { getProjet } from '@/actions/projets'
import { SituationTable } from '@/components/modules/situation/SituationTable'

interface Props {
  params: { id: string }
}

export default async function SituationPage({ params }: Props) {
  const projet = await getProjet(params.id)

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#004489]">
          Situation de Travaux
        </h2>
        <p className="text-sm text-gray-500">
          Avancement des quantites par rapport au Detail Estimatif
        </p>
      </div>
      <SituationTable projetId={params.id} projetName={projet?.name || 'Projet'} />
    </div>
  )
}
