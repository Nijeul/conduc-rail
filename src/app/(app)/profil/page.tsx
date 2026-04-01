import { getProfil } from '@/actions/profil'
import { ProfilForm } from './ProfilForm'

export default async function ProfilPage() {
  const profil = await getProfil()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-[#004489] mb-6">Mon profil</h1>
      <ProfilForm profil={profil} />
    </div>
  )
}
