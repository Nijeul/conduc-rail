import { getMaterielList } from '@/actions/materiel'
import { MaterielTable } from '@/components/modules/materiel'
import { Topbar } from '@/components/layout'

export default async function MaterielPage() {
  const materiels = await getMaterielList()

  return (
    <div className="flex flex-col h-[calc(100vh)]">
      <Topbar title="Gestion du Materiel TTx" />
      <div className="flex-1 bg-white overflow-hidden">
        <MaterielTable initialData={materiels} />
      </div>
    </div>
  )
}
