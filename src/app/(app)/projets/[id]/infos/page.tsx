import { getInfosProjet } from '@/actions/infos-projet'
import { InfosProjetForm } from '@/components/modules/infos-projet/InfosProjetForm'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function InfosProjetPage({ params }: Props) {
  const infos = await getInfosProjet(params.id)

  if (!infos) {
    notFound()
  }

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
    </div>
  )
}
