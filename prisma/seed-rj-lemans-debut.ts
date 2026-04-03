import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: 'julien.paulais@vinci-construction.com' },
  })
  if (!user) throw new Error('Utilisateur julien.paulais@vinci-construction.com introuvable')
  console.log(`✓ Utilisateur trouvé : ${user.name} (${user.id})`)

  // 2. Trouver le projet contenant "Mans"
  const membership = await prisma.projetMember.findFirst({
    where: {
      userId: user.id,
      projet: { name: { contains: 'Mans', mode: 'insensitive' } },
    },
    include: { projet: true },
  })
  if (!membership) throw new Error('Aucun projet contenant "Mans" trouvé pour cet utilisateur')
  const projet = membership.projet
  console.log(`✓ Projet trouvé : ${projet.name} (${projet.id})`)

  // 3. Données des 6 RJ
  const rapports = [
    {
      titre: 'RJ N°1',
      date: new Date('2026-01-08'),
      posteNuit: false,
      heureDebut: '08:00',
      heureFin: '16:00',
      commentaire: 'Clair 9°C',
      production: 'Distribution Traverses ADV',
    },
    {
      titre: 'RJ N°2',
      date: new Date('2026-01-12'),
      posteNuit: false,
      heureDebut: '09:00',
      heureFin: '17:00',
      commentaire: 'Nuageux 12°C',
      production: 'ADV 130 Bois 19,30,31,35,37,38,39\nADV 122 Bois 6,7,47,49',
    },
    {
      titre: 'RJ N°3',
      date: new Date('2026-01-13'),
      posteNuit: false,
      heureDebut: '08:00',
      heureFin: '17:00',
      commentaire: 'Nuageux 14°C',
      production:
        'ADV 122 réentaillage et perçage des bois 17,18,19 + 3R6.1 et 1R6.3 (qté: 7)\nADV 130 régalage et bourrage (qté: 1)\nRT 7 Tba de la courbe en pointe du Brt 519 + 1 suite à casse entretoise pendant les travaux (qté: 7)\nADV 96 RT bois 4R6.1 et 2R6.2 (qté: 6)\nRT ADV82 Bois 14,17,23 (qté: 3)',
    },
    {
      titre: 'RJ N°4',
      date: new Date('2026-01-14'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      commentaire: 'Clair 13°C',
      production:
        'ADV 82 Bois 49, 51 + 1R6.1 + 1R6.3 (qté: 4)\nBourrage et régalage de l\'ADV 122, 96, 82, 98 (qté: 1)\nADV 98 Bois 2, 3, 18 (qté: 3)',
    },
    {
      titre: 'RJ N°5',
      date: new Date('2026-01-15'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      commentaire: 'Nuageux 12°C',
      production:
        'ADV 90 bis RT bois 3,10,20,26,28,29,30,42,43,45 + 4R6.1 + 3R6.3 (qté: 17)\nADV 90 Bis 16 tables sabotées (qté: 16)\nADV 90 bis régalage et bourrage (qté: 1)\nADV 88 RT 5,7,14,22,23 + 2R6.3 (qté: 7)',
    },
    {
      titre: 'RJ N°6',
      date: new Date('2026-01-16'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '12:00',
      commentaire: 'Nuageux 10°C',
      production:
        'ADV 108 RT bois 1,5,7,8,13,15,27,41,46 + 1R6 (qté: 10)\nNettoyage de la zone et évacuation des matières en zone de stockage (qté: 1)',
    },
  ]

  let created = 0
  let skipped = 0

  for (const rj of rapports) {
    // Vérifier doublon
    const existing = await prisma.rapportJournalier.findFirst({
      where: {
        projetId: projet.id,
        date: rj.date,
        titre: rj.titre,
      },
    })

    if (existing) {
      console.log(`⏭ ${rj.titre} (${rj.date.toISOString().slice(0, 10)}) existe déjà — ignoré`)
      skipped++
      continue
    }

    await prisma.rapportJournalier.create({
      data: {
        projetId: projet.id,
        date: rj.date,
        titre: rj.titre,
        nomChantier: 'Connexe BA Le Mans',
        posteNuit: rj.posteNuit,
        heureDebut: rj.heureDebut,
        heureFin: rj.heureFin,
        heureDebutPrevue: null,
        heureFinPrevue: null,
        heureRestituee: null,
        commentaire: rj.commentaire,
        production: rj.production,
        travaux: [],
        redacteurId: user.id,
        valide: true,
      },
    })
    console.log(`✓ ${rj.titre} créé (${rj.date.toISOString().slice(0, 10)})`)
    created++
  }

  console.log(`\nTerminé : ${created} créés, ${skipped} ignorés (doublons)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
