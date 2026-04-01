import { getProjet } from '@/actions/projets'
import { getARFData } from '@/actions/arf'
import { ARFTable } from '@/components/modules/arf/ARFTable'

interface Props {
  params: { id: string }
}

export default async function ARFPage({ params }: Props) {
  const [projet, arfData] = await Promise.all([
    getProjet(params.id),
    getARFData(params.id),
  ])

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#004489]">Suivi ARF</h2>
        <p className="text-sm text-gray-500">
          Suivi des horaires prevus et reels par rapport journalier
        </p>
      </div>
      <ARFTable
        projetId={params.id}
        projetName={projet?.name || 'Projet'}
        initialData={arfData}
      />
    </div>
  )
}
