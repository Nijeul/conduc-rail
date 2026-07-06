import { getProjet } from '@/actions/projets'
import { getSousTraitants } from '@/actions/sous-traitants'
import { SuiviSousTraitantsContent } from '@/components/modules/sous-traitants/SuiviSousTraitantsContent'

interface Props {
  params: { id: string }
}

export default async function SuiviSousTraitantsPage({ params }: Props) {
  const [projet, data] = await Promise.all([
    getProjet(params.id),
    getSousTraitants(params.id),
  ])

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#004489]">
          Suivi Financier des Sous-traitants
        </h2>
        <p className="text-sm text-gray-500">
          Facturation mensuelle, avancement et reste à facturer par sous-traitant
        </p>
      </div>
      <SuiviSousTraitantsContent
        projetId={params.id}
        projetName={projet?.name || 'Projet'}
        initialData={data}
      />
    </div>
  )
}
