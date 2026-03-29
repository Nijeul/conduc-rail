import { getCourriers } from '@/actions/courriers'
import { ListeCourriers } from '@/components/modules/courriers/ListeCourriers'

interface Props {
  params: { id: string }
}

export default async function CourriersPage({ params }: Props) {
  const courriers = await getCourriers(params.id)

  return (
    <div className="p-6">
      <ListeCourriers courriers={courriers} projetId={params.id} />
    </div>
  )
}
