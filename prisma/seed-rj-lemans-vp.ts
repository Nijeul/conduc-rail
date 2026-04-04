import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Trouver l'utilisateur Julien Paulais
  const user = await prisma.user.findUnique({
    where: { email: "julien.paulais@vinci-construction.com" },
  });
  if (!user) {
    console.error("❌ Utilisateur julien.paulais@vinci-construction.com introuvable.");
    process.exit(1);
  }
  console.log(`✅ Utilisateur trouvé : ${user.name} (${user.id})`);

  // 2. Trouver le projet Le Mans
  const membership = await prisma.projetMember.findFirst({
    where: {
      userId: user.id,
      projet: { name: { contains: "Mans" } },
    },
    include: { projet: true },
  });
  if (!membership) {
    console.error("❌ Aucun projet contenant 'Mans' trouvé pour cet utilisateur.");
    process.exit(1);
  }
  const projet = membership.projet;
  console.log(`✅ Projet trouvé : ${projet.name} (${projet.id})`);

  // 3. Trouver les lignes DE SYS_PDL_26 et SYS_PDL_29
  const lignePDL26 = await prisma.ligneDE.findFirst({
    where: { projetId: projet.id, code: { contains: "SYS_PDL_26" } },
  });
  const lignePDL29 = await prisma.ligneDE.findFirst({
    where: { projetId: projet.id, code: { contains: "SYS_PDL_29" } },
  });

  if (!lignePDL26 || !lignePDL29) {
    console.error("❌ Lignes DE introuvables dans le projet :");
    if (!lignePDL26) console.error("   - Aucune ligne DE avec code contenant 'SYS_PDL_26'");
    if (!lignePDL29) console.error("   - Aucune ligne DE avec code contenant 'SYS_PDL_29'");
    console.error("   Les RJ ne seront PAS créés car les quantités ne seraient pas liées.");
    process.exit(1);
  }
  console.log(`✅ Ligne DE SYS_PDL_26 : ${lignePDL26.code} — ${lignePDL26.designation} (${lignePDL26.id})`);
  console.log(`✅ Ligne DE SYS_PDL_29 : ${lignePDL29.code} — ${lignePDL29.designation} (${lignePDL29.id})`);

  // 4. Dates lundi-vendredi du 23/03/2026 au 02/04/2026
  const dates = [
    new Date("2026-03-23"), // lun
    new Date("2026-03-24"), // mar
    new Date("2026-03-25"), // mer
    new Date("2026-03-26"), // jeu
    new Date("2026-03-27"), // ven
    new Date("2026-03-30"), // lun
    new Date("2026-03-31"), // mar
    new Date("2026-04-01"), // mer
    new Date("2026-04-02"), // jeu
  ];

  const travaux = [
    { ligneDeId: lignePDL26.id, quantiteRealisee: 2 },
    { ligneDeId: lignePDL29.id, quantiteRealisee: 1 },
  ];

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < dates.length; i++) {
    const num = i + 1;
    const titre = `RJ N°${num} VP`;

    // Vérifier doublon par titre
    const existing = await prisma.rapportJournalier.findFirst({
      where: { projetId: projet.id, titre },
    });
    if (existing) {
      console.log(`⏭️  ${titre} existe déjà — ignoré`);
      skipped++;
      continue;
    }

    await prisma.rapportJournalier.create({
      data: {
        projetId: projet.id,
        titre,
        nomChantier: "Connexe BA Le Mans",
        date: dates[i],
        posteNuit: false,
        heureDebut: "08:00",
        heureFin: "17:00",
        production: "Visite de poste",
        commentaire: null,
        redacteurId: user.id,
        valide: true,
        travaux,
      },
    });
    console.log(`✅ Créé : ${titre} — ${dates[i].toISOString().slice(0, 10)}`);
    created++;
  }

  console.log(`\n🏁 Terminé : ${created} RJ créés, ${skipped} ignorés (doublons).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
