import { getProjet } from '@/actions/projets'
import { getPrixNouveaux } from '@/actions/prix-nouveaux'
import { PrixNouveauxContent } from '@/components/modules/prix-nouveaux/PrixNouveauxContent'

interface Props {
  params: { id: string }
}

export default async function PrixNouveauxPage({ params }: Props) {
  const [projet, prixNouveaux] = await Promise.all([
    getProjet(params.id),
    getPrixNouveaux(params.id),
  ])

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#004489]">
          Suivi des Prix Nouveaux
        </h2>
        <p className="text-sm text-gray-500">
          Travaux et délais supplémentaires : devis, ordres de service et potentiel
          d&apos;acceptation
        </p>
      </div>
      <PrixNouveauxContent
        projetId={params.id}
        projetName={projet?.name || 'Projet'}
        prixNouveaux={prixNouveaux}
      />
    </div>
  )
}
