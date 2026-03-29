import { getSoudures } from '@/actions/soudures'
import { getProjet } from '@/actions/projets'
import { notFound } from 'next/navigation'
import { SouduresTable } from '@/components/modules/soudures'

interface SAPageProps {
  params: { id: string }
}

export default async function SAPage({ params }: SAPageProps) {
  const [projet, soudures] = await Promise.all([
    getProjet(params.id),
    getSoudures(params.id),
  ])

  if (!projet) {
    notFound()
  }

  return (
    <div className="p-4 h-[calc(100vh-64px)] flex flex-col">
      <h2 className="text-lg font-bold text-slate-800 mb-3">
        Soudures Aluminothermiques (SA)
      </h2>
      <SouduresTable
        projetId={params.id}
        projetName={projet.name}
        initialData={soudures}
      />
    </div>
  )
}
