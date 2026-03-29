import { getInfosProjet } from '@/actions/infos-projet'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditeurCourrier } from '@/components/modules/courriers/EditeurCourrier'
import { notFound } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function NouveauCourrierPage({ params }: Props) {
  const infos = await getInfosProjet(params.id)
  if (!infos) notFound()

  // Get user's societe info for the header
  const session = await auth()
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          nomSociete: true,
          logoSociete: true,
          adresseSociete: true,
          telSociete: true,
          faxSociete: true,
          certifications: true,
        },
      })
    : null

  return (
    <div className="p-6">
      <EditeurCourrier
        projetId={params.id}
        projetInfos={{
          name: infos.name,
          moaNom: infos.moaNom,
          moaPrenom: infos.moaPrenom,
          moaAdresse: infos.moaAdresse,
          numeroAffaire: infos.numeroAffaire,
          numeroOTP: infos.numeroOTP,
          dateDebut: infos.dateDebut,
          nomSociete: user?.nomSociete,
        }}
        userInfos={{
          name: user?.name ?? null,
          nomSociete: user?.nomSociete ?? null,
          logoSociete: user?.logoSociete ?? null,
          adresseSociete: user?.adresseSociete ?? null,
          telSociete: user?.telSociete ?? null,
          faxSociete: user?.faxSociete ?? null,
          certifications: user?.certifications ?? null,
        }}
      />
    </div>
  )
}
