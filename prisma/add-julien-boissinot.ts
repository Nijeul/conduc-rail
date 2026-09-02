// Crée le compte de Julien Boissinot avec le profil chef de chantier
// (accès uniquement à l'onglet Gestion de Chantier).
// Usage : npx tsx prisma/add-julien-boissinot.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL = 'julien.boissinot@etf.fr'
const NOM = 'Julien Boissinot'
const MOT_DE_PASSE_DEFAUT = 'ChangeMe2026!'

async function main() {
  const existant = await prisma.user.findUnique({ where: { email: EMAIL } })

  if (existant) {
    await prisma.user.update({
      where: { id: existant.id },
      data: { role: 'chef_chantier' },
    })
    console.log(`Compte déjà existant : ${EMAIL} → profil mis à jour en chef de chantier.`)
    return
  }

  const hash = await bcrypt.hash(MOT_DE_PASSE_DEFAUT, 12)
  await prisma.user.create({
    data: {
      name: NOM,
      email: EMAIL,
      password: hash,
      role: 'chef_chantier',
    },
  })

  console.log(`Compte créé : ${NOM} <${EMAIL}> — profil chef de chantier`)
  console.log(`Mot de passe provisoire : ${MOT_DE_PASSE_DEFAUT} (à changer à la première connexion)`)
  console.log(
    'Pense à le rattacher à un projet : onglet Infos du projet → partage par e-mail.'
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
