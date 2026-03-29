import { getPersonnelList } from '@/actions/personnel'
import { PersonnelTable } from '@/components/modules/personnel'
import { Topbar } from '@/components/layout'

export default async function PersonnelPage() {
  const personnel = await getPersonnelList()

  return (
    <div className="flex flex-col h-[calc(100vh)]">
      <Topbar title="Gestion du Personnel" />
      <div className="flex-1 bg-white overflow-hidden">
        <PersonnelTable initialData={personnel} />
      </div>
    </div>
  )
}
