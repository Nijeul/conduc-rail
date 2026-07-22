// Remplit les informations de chantier du projet "RAV Angoulême 2"
// à partir du CPS SNCF Réseau 2024DOS0660398 (RAV Angoulême Sud — Voie & Hydro).
// Usage : npx tsx prisma/seed-infos-rav-angouleme.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const projets = await prisma.projet.findMany({
    select: { id: true, name: true },
  })

  const normalise = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  const projet = projets.find(
    (p) => normalise(p.name).includes('rav') && normalise(p.name).includes('angouleme')
  )
  if (!projet) {
    console.error('Projet "RAV Angoulême 2" introuvable. Projets existants :')
    projets.forEach((p) => console.error(` - ${p.name}`))
    process.exit(1)
  }

  console.log(`Mise à jour du projet « ${projet.name} » (${projet.id})...`)

  await prisma.projet.update({
    where: { id: projet.id },
    data: {
      description:
        'Angoulême (16) — Travaux voie de RAV Angoulême Sud (Voie & Hydraulique). ' +
        'Marché SNCF Réseau 5 573 969,66 € HT (CE 18/04/2026). ' +
        'Groupement conjoint mandataire solidaire ETF (mandataire) / TERELIAN / BTPS / ETF Services / TVF. ' +
        'N° CTC e@si : 2026CTC0656851.',
      moaNom: 'FLOCH',
      moaPrenom: 'Vincent',
      moaAdresse:
        'SNCF Réseau — DR Nouvelle Aquitaine\n17 rue Cabanac\nCS 61926 — 33081 Bordeaux Cedex',
      numeroAffaire: '2024DOS0660398',
      numeroCommande: 'CTR00181900',
      adresseChantier: 'RAV Angoulême Sud (Voie & Hydraulique) — Angoulême (16)',
      dateDebut: new Date('2026-06-08'),
      dateFin: new Date('2026-12-07'),
    },
  })

  console.log('Informations de chantier enregistrées :')
  console.log(' - MOA : Vincent FLOCH (PRM), SNCF Réseau DR Nouvelle Aquitaine, Bordeaux')
  console.log(' - N° affaire : 2024DOS0660398 · N° commande (ERP) : CTR00181900')
  console.log(' - Chantier : RAV Angoulême Sud (Voie & Hydraulique) — Angoulême (16)')
  console.log(' - Dates prévisionnelles : 08/06/2026 → 07/12/2026')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
