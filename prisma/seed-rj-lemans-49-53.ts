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

  // 3. Données des RJ 49 à 53
  const rapports = [
    {
      titre: 'RJ N°49',
      date: new Date('2026-03-23'),
      posteNuit: false,
      heureDebut: '09:00',
      heureFin: '15:30',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "Reprise d'écartement Voie 6\navec passage de traverses neuves (U, qté: 6)",
      commentaire: null,
    },
    {
      titre: 'RJ N°50',
      date: new Date('2026-03-24'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '15:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "Reprise d'écartement sur 10 mètres avec passage de 4 traverses Voie 6",
      commentaire: 'Panne pelle RR : agent LAM utilisé à 50%',
    },
    {
      titre: 'RJ N°51',
      date: new Date('2026-03-25'),
      posteNuit: true,
      heureDebut: '08:00',
      heureFin: '15:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "Reprise de gauches dans ADV :\n90b, 98, 112, 114, 108\nReprise de gauches dans voie courante :\nV2 et V0 devant la base avant passe-pied\nV10 km 328,854",
      commentaire: 'Agent LAM absent : remplacé quelques heures par agent SNCF',
    },
    {
      titre: 'RJ N°52',
      date: new Date('2026-03-26'),
      posteNuit: false,
      heureDebut: '08:00',
      heureFin: '15:00',
      heureDebutPrevue: null,
      heureFinPrevue: null,
      heureRestituee: null,
      production: "Reprise de gauches dans voie courante :\nV10 km 328,945 et km 328,961\nV2 km 329,439",
      commentaire: '4 agents sont partis à 14h00',
    },
    {
      titre: 'RJ N°53',
      date: new Date('2026-03-27'),
      posteNuit: false,
      heureDebut: '08:00',
      heureFin: '12:00',
      heureDebutPrevue: null,
      heureFinPrevue: '12:00',
      heureRestituee: '12:00',
      production: 'Tournée',
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
