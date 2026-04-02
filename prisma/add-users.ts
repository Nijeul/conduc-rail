import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Ajout des nouveaux utilisateurs...')

  const motDePasseDefaut = 'ChangeMe2025!'
  const hash = await bcrypt.hash(motDePasseDefaut, 12)

  const utilisateurs = [
    { name: 'Alexandre Paulais', email: 'alexandre.paulais@vinci-construction.com' },
    { name: 'Marie Lefevre', email: 'marie.lefevre@vinci-construction.com' },
    { name: 'Julien Paulais', email: 'julien.paulais@vinci-construction.com' },
    { name: 'Jeremy Roger', email: 'jeremy.roger@vinci-construction.com' },
  ]

  for (const u of utilisateurs) {
    const existant = await prisma.user.findUnique({ where: { email: u.email } })
    if (existant) {
      console.log(`Already exists: ${u.email}`)
      continue
    }
    await prisma.user.create({
      data: { name: u.name, email: u.email, password: hash, role: 'user' }
    })
    console.log(`Created: ${u.email}`)
  }

  console.log('\nDone. Default password: ChangeMe2025!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
