import { getEvenements, getCategories } from '@/actions/journal'
import { getProjet, ensureCategoriesSysteme } from '@/actions/projets'
import { notFound } from 'next/navigation'
import { JournalPageClient } from './JournalPageClient'

interface Props {
  params: { id: string }
}

export default async function JournalPage({ params }: Props) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  // Ensure categories exist for existing projects (migration progressive)
  await ensureCategoriesSysteme(params.id)

  const [evenements, categories] = await Promise.all([
    getEvenements(params.id),
    getCategories(params.id),
  ])

  // Build couleursCat map from BDD categories
  const couleursCat: Record<string, { bg: string; border: string; text: string; point: string; label: string; id: string; estSysteme: boolean }> = {}
  for (const cat of categories) {
    couleursCat[cat.id] = {
      bg: cat.couleurBg,
      border: cat.couleurBorder,
      text: cat.couleurText,
      point: cat.couleurPoint,
      label: cat.nom,
      id: cat.id,
      estSysteme: cat.estSysteme,
    }
  }

  return (
    <div className="p-6">
      <JournalPageClient
        evenements={JSON.parse(JSON.stringify(evenements))}
        categories={JSON.parse(JSON.stringify(categories))}
        couleursCat={couleursCat}
        projetId={params.id}
        projetName={projet.name}
      />
    </div>
  )
}
