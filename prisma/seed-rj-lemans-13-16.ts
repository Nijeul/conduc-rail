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

  // 3. Données des RJ 13 à 16
  const rapports = [
    {
      titre: 'RJ N°13',
      date: new Date('2026-01-27'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "Reprise d'écartement dans adv 108, et dans l'enrobé béton talon adv 98 (qté: 1)\nReprise des cotes de sécurité ADV 90,72,80,76,82,96 (qté: 1)\nBourrage adv 90 (qté: 1)\nRT V10 28Tba + 5 bois JO (qté: 33)\nRT V11 8 Tba (qté: 8)",
      commentaire: null,
    },
    {
      titre: 'RJ N°14',
      date: new Date('2026-01-28'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "Débroussaillage 1064 m2 de V0 à V1 (qté: 1064)\nV9 RT 4bois, 14 Tba (qté: 18)\nReprise des cotes de sécurité des appareils 545,583,581,527,541,571,573 (qté: 1)\nHydrocurage de la buse V0 (qté: 1)\nV12 RT 2 BOIS 9 Tba (qté: 11)\nV13 RT 4 Bois 3 Tba (qté: 7)\nV14 RT 3 BOIS 11Tba (qté: 14)",
      commentaire: 'Panne système 7',
    },
    {
      titre: 'RJ N°15',
      date: new Date('2026-01-29'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '17:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "RT ADV 575 Bois 33 (qté: 1)\nDébroussaillage avant curage + Curage du fossé sur 115 ml (qté: 115)\nV0 RT 1 Bois + V6 3 Bois 6 Tba (qté: 10)\nV8 RT 3 Bois 15 Tba + V7 3 Bois 2 Tba (qté: 23)\nReprise écartement dans passe pieds en enrobé V16 (qté: 1)\nVoie 5 RT 1 Bois + V4 RT 2 bois + V3 RT 1 Tba + V2 RT 2Tba (qté: 6)\nADV 90 B RT Bois 34 et 47 (qté: 2)\n4 Bois VC après ADV 98 (qté: 4)\nVC entre ADV96 et ADV 82 1 Bois et 2 Tba (qté: 3)",
      commentaire: 'Pelle en panne',
    },
    {
      titre: 'RJ N°16',
      date: new Date('2026-01-30'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '12:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "Régalage ADV 575, 577, 543 (qté: 1)\nBourrage du RT V14 à V11 (qté: 1)\nRégalage V14 (qté: 1)\nRamassage nettoyage (qté: 1)",
      commentaire: null,
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
