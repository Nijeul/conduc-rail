import { getEvenements } from '@/actions/journal'
import { getProjet } from '@/actions/projets'
import { notFound } from 'next/navigation'
import { JournalPageClient } from './JournalPageClient'

interface Props {
  params: { id: string }
}

export default async function JournalPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  const evenements = await getEvenements(params.id)

  return (
    <div className="p-6">
      <JournalPageClient
        evenements={JSON.parse(JSON.stringify(evenements))}
        projetId={params.id}
        projetName={projet.name}
      />
    </div>
  )
}
