import { getInfosProjet } from '@/actions/infos-projet'
import { getProjetMembers } from '@/actions/projets'
import { auth } from '@/lib/auth'
import { InfosProjetForm } from '@/components/modules/infos-projet/InfosProjetForm'
import { ProjetMembers } from '@/components/modules/infos-projet/ProjetMembers'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function InfosProjetPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [infos, members] = await Promise.all([
    getInfosProjet(params.id),
    getProjetMembers(params.id),
  ])

  if (!infos) {
    notFound()
  }

  const isOwner = members.some(
    (m) => m.user.id === session.user!.id && m.role === 'owner'
  )

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-[#263238] mb-6">
        Informations du projet
      </h1>
      <InfosProjetForm
        projetId={params.id}
        infos={{
          moaNom: infos.moaNom,
          moaPrenom: infos.moaPrenom,
          moaAdresse: infos.moaAdresse,
          numeroAffaire: infos.numeroAffaire,
          numeroCommande: infos.numeroCommande,
          numeroOTP: infos.numeroOTP,
          adresseChantier: infos.adresseChantier,
          dateDebut: infos.dateDebut,
          dateFin: infos.dateFin,
        }}
      />

      <div className="mt-10 max-w-2xl">
        <ProjetMembers
          projetId={params.id}
          members={members}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}
