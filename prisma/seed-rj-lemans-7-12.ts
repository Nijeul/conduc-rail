import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Trouver l'utilisateur Julien Paulais
  const user = await prisma.user.findUnique({
    where: { email: 'julien.paulais@vinci-construction.com' }
  })
  if (!user) throw new Error('Utilisateur julien.paulais@vinci-construction.com introuvable')
  console.log(`Utilisateur trouvé : ${user.name} (${user.id})`)

  // 2. Trouver le projet contenant "Mans"
  const projet = await prisma.projet.findFirst({
    where: {
      members: { some: { userId: user.id } },
      name: { contains: 'Mans', mode: 'insensitive' }
    }
  })
  if (!projet) throw new Error('Projet contenant "Mans" introuvable pour cet utilisateur')
  console.log(`Projet trouvé : ${projet.name} (${projet.id})`)

  // 3. Données des RJ 7 à 12
  const rapports = [
    {
      titre: 'RJ N°7',
      date: new Date('2026-01-19'),
      posteNuit: false,
      heureDebut: '09:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: 'ADV 114 RT Bois 2,16,35,45,46,59 + 2R6 (qté: 7)\nRT ADV 92 / Bois 19,23,37,38,50,52 + 4R6 (qté: 10)\n12 tables réentaillées (qté: 12)\nReprise des écartements 114 et 92\nDébroussaillage sur 454 m² voie I',
      commentaire: null,
    },
    {
      titre: 'RJ N°8',
      date: new Date('2026-01-20'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: 'RT ADV 72 Bois 1,2,20,21,23,38,40,43,45,49 + reprise écartement (qté: 10)\nPrépa ADV 90',
      commentaire: null,
    },
    {
      titre: 'RJ N°9',
      date: new Date('2026-01-21'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: 'RT adv 90 Bois 4,6,8,13,18,20,23,35,41,44 + 1R6 (qté: 11)\nRT adv 78/80 Bois 1,2,8,9,10,12,15,16,22,23,27,29,34,39,42,45 + 9R6 + reprise (qté: 27)\nRT 8 Tb courbe 511 à 519 (qté: 8)\nReprise écartement et 14 sabotages de table adv 90 (qté: 14)',
      commentaire: null,
    },
    {
      titre: 'RJ N°10',
      date: new Date('2026-01-22'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: 'ADV 591 RT Bois 23,29,42 + reprise d\'écartement (qté: 3)\nADV 166 RT Bois 1 (qté: 1)\nADV 167 RT Bois 1,2,3,33,47 + 6R6 + 7 sabotages (qté: 11)\nADV 167 Reprise d\'écartement\nDébroussaillage et fossé',
      commentaire: null,
    },
    {
      titre: 'RJ N°11',
      date: new Date('2026-01-23'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '12:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: 'Ballastage des adv poste E + nettoyage\nRT ADV 573 Bois 9,27,28 + 3R6\nRT ADV 571 Bois 13\nRT ADV 527 Bois 2,13,17,19,21,27,28\nRT ADV 545 Bois 21',
      commentaire: null,
    },
    {
      titre: 'RJ N°12',
      date: new Date('2026-01-26'),
      posteNuit: false,
      heureDebut: '09:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: 'Reprise des écartements adv 90B (qté: 1)\nReprise écartement entre 122 et 130 avec injection de 32 Tba et 6 Tb JO (qté: 38)\nReprise des cotes ADV 130, 122, 118, 98, 90B, 88, 108, 92 (qté: 1)',
      commentaire: 'Pelle en panne le matin',
    },
  ]

  // 4. Vérifier doublons et créer
  console.log(`\nVérification des doublons et création de ${rapports.length} rapports...`)

  let created = 0
  let skipped = 0
  for (const rj of rapports) {
    // Vérifier si un rapport avec le même titre existe déjà pour ce projet
    const existing = await prisma.rapportJournalier.findFirst({
      where: {
        projetId: projet.id,
        titre: rj.titre,
      }
    })

    if (existing) {
      console.log(`  DOUBLON ignoré : ${rj.titre} (déjà existant, id: ${existing.id})`)
      skipped++
      continue
    }

    await prisma.rapportJournalier.create({
      data: {
        projetId: projet.id,
        date: rj.date,
        nomChantier: 'Connexe BA Le Mans',
        titre: rj.titre,
        posteNuit: rj.posteNuit,
        heureDebut: rj.heureDebut,
        heureFin: rj.heureFin,
        heureDebutPrevue: rj.heureDebutPrevue,
        heureFinPrevue: rj.heureFinPrevue,
        heureRestituee: rj.heureRestituee,
        production: rj.production,
        commentaire: rj.commentaire,
        travaux: [],
        redacteurId: user.id,
        valide: true,
      }
    })
    created++
    console.log(`  ${rj.titre} - ${rj.date.toISOString().slice(0, 10)} - ${rj.posteNuit ? 'NUIT' : 'JOUR'} ${rj.heureDebut}-${rj.heureFin}`)
  }

  console.log(`\n${created} rapports créés, ${skipped} doublons ignorés pour "${projet.name}"`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
