import { getProjet } from '@/actions/projets'
import { getSousTraitants } from '@/actions/sous-traitants'
import { SousTraitantsContent } from '@/components/modules/sous-traitants/SousTraitantsContent'

interface Props {
  params: { id: string }
}

export default async function SousTraitantsPage({ params }: Props) {
  const [projet, data] = await Promise.all([
    getProjet(params.id),
    getSousTraitants(params.id),
  ])

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#004489]">
          Gestion des Sous-traitants
        </h2>
        <p className="text-sm text-gray-500">
          Marchés, actes spéciaux et avenants des sous-traitants du projet
        </p>
      </div>
      <SousTraitantsContent
        projetId={params.id}
        projetName={projet?.name || 'Projet'}
        initialData={data}
      />
    </div>
  )
}
