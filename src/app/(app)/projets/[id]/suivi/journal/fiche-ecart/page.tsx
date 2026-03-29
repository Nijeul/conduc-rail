import { redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default function FicheEcartPage({ params }: Props) {
  redirect(`/projets/${params.id}/suivi/journal`)
}
