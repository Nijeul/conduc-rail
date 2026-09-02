// Attribue un profil à un utilisateur.
// Usage : npx tsx prisma/set-role.ts <email> <conduc|chef_chantier>
//   - conduc        → accès à tous les onglets (rôle stocké : "user")
//   - chef_chantier → accès uniquement à l'onglet Gestion de Chantier

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [email, profil] = process.argv.slice(2)
  if (!email || !['conduc', 'chef_chantier'].includes(profil)) {
    console.error('Usage : npx tsx prisma/set-role.ts <email> <conduc|chef_chantier>')
    process.exit(1)
  }

  const role = profil === 'chef_chantier' ? 'chef_chantier' : 'user'

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`Utilisateur introuvable : ${email}`)
    const tous = await prisma.user.findMany({ select: { email: true, role: true } })
    tous.forEach((u) => console.error(` - ${u.email} (${u.role})`))
    process.exit(1)
  }

  await prisma.user.update({ where: { id: user.id }, data: { role } })
  console.log(
    `${user.name ?? email} → profil ${
      profil === 'chef_chantier'
        ? 'Chef de chantier (Gestion de Chantier uniquement)'
        : 'Conducteur de travaux (accès complet)'
    }`
  )
  console.log('La personne doit se déconnecter / reconnecter pour que le changement prenne effet.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
