import { redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default function ProjetIndexPage({ params }: Props) {
  redirect(`/projets/${params.id}/suivi/rapports`)
}
