import { redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

// Ancienne route conservée pour compatibilité — le module Situations a été refondu
export default function AncienneSituationPage({ params }: Props) {
  redirect(`/projets/${params.id}/suivi/situations`)
}
