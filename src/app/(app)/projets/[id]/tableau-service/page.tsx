import { getTableauxByProjet, getAllPersonnelForMap } from '@/actions/tableau-service'
import { getProjet } from '@/actions/projets'
import { notFound } from 'next/navigation'
import { TableauServiceModule } from '@/components/modules/tableau-service'
import type { TableauServiceData, PersonnelMap } from '@/components/modules/tableau-service'

interface PageProps {
  params: { id: string }
}

export default async function TableauServicePage({ params }: PageProps) {
  const projet = await getProjet(params.id)
  if (!projet) notFound()

  const [tableaux, personnelList] = await Promise.all([
    getTableauxByProjet(params.id),
    getAllPersonnelForMap(),
  ])

  // Build O(1) lookup map: personnelId -> info
  const personnelMap: PersonnelMap = {}
  for (const p of personnelList) {
    personnelMap[p.id] = {
      id: p.id,
      prenom: p.prenom,
      nom: p.nom,
      poste: p.poste,
      telephone: p.telephone,
      entreprise: p.entreprise,
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TableauServiceModule
        projetId={params.id}
        projetNom={projet.name}
        initialTableaux={tableaux as unknown as TableauServiceData[]}
        personnelMap={personnelMap}
      />
    </div>
  )
}
