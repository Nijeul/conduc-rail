import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DetailEstimatifContent } from './DetailEstimatifContent'

interface Props {
  params: { id: string }
}

export default async function DetailEstimatifPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const projet = await prisma.projet.findUnique({ where: { id: params.id } })
  if (!projet) redirect('/projets')

  return <DetailEstimatifContent projetId={params.id} projetName={projet.name} />
}
