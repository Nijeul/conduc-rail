import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.fichierEvenement.deleteMany();
  await prisma.evenementChantier.deleteMany();
  await prisma.courrierChantier.deleteMany();
  await prisma.materielTTx.deleteMany();
  await prisma.compositionTTx.deleteMany();
  await prisma.soudureAluminothermique.deleteMany();
  await prisma.rapportJournalier.deleteMany();
  await prisma.ligneDE.deleteMany();
  await prisma.tableauService.deleteMany();
  await prisma.personnel.deleteMany();
  await prisma.projetMember.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const hashedPassword = await bcrypt.hash("demo1234", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@conducrail.fr",
      name: "Jean Dupont",
      password: hashedPassword,
      role: "admin",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@conducrail.fr",
      name: "Marie Lambert",
      password: hashedPassword,
      role: "user",
    },
  });

  console.log("Users created:", admin.email, user.email);

  // --- Projets ---
  const projet1 = await prisma.projet.create({
    data: {
      name: "Chantier LGV Sud",
      description:
        "Renouvellement voie et appareil sur la LGV Sud-Est, secteur Valence - Avignon. Travaux de nuit, fenêtres de 4h30.",
    },
  });

  const projet2 = await prisma.projet.create({
    data: {
      name: "Maintenance Ligne 7",
      description:
        "Maintenance préventive et corrective sur la ligne 7, secteur Juvisy - Corbeil. Remplacement de traverses et soudures.",
    },
  });

  // --- ProjetMembers ---
  await prisma.projetMember.createMany({
    data: [
      { userId: admin.id, projetId: projet1.id, role: "owner" },
      { userId: user.id, projetId: projet1.id, role: "member" },
      { userId: admin.id, projetId: projet2.id, role: "owner" },
    ],
  });

  console.log("Projets created with members");

  // --- Personnel ---
  const personnelData = [
    { nom: "Dupont", prenom: "Jean", poste: "Conducteur travaux principal", telephone: "06 12 34 56 78", entreprise: "SNCF Réseau" },
    { nom: "Lambert", prenom: "Marie", poste: "Conducteur travaux", telephone: "06 23 45 67 89", entreprise: "SNCF Réseau" },
    { nom: "Martin", prenom: "Pierre", poste: "Responsable qualité", telephone: "06 34 56 78 90", entreprise: "SNCF Réseau" },
    { nom: "Bernard", prenom: "Luc", poste: "RCE / Chef de chantier", telephone: "06 45 67 89 01", entreprise: "ETF" },
    { nom: "Petit", prenom: "Sophie", poste: "Contrôleur qualité", telephone: "06 56 78 90 12", entreprise: "SNCF Réseau" },
    { nom: "Garcia", prenom: "Antonio", poste: "Chef d'équipe", telephone: "06 67 89 01 23", entreprise: "ETF" },
    { nom: "Moreau", prenom: "Thierry", poste: "Poseur", telephone: "06 78 90 12 34", entreprise: "ETF" },
    { nom: "Roux", prenom: "Fabien", poste: "Soudeur", telephone: "06 89 01 23 45", entreprise: "Railtech" },
    { nom: "Leroy", prenom: "Karim", poste: "Aide Soudeur", telephone: "06 90 12 34 56", entreprise: "Railtech" },
    { nom: "Fournier", prenom: "David", poste: "Conducteur d'engin", telephone: "06 01 23 45 67", entreprise: "Colas Rail" },
  ];

  await prisma.personnel.createMany({ data: personnelData });
  console.log("Personnel created:", personnelData.length);

  // --- TableauService ---
  await prisma.tableauService.create({
    data: {
      projetId: projet1.id,
      titre: "Tableau de service S12-2026",
      entreprise: "ETF",
      semaine: 12,
      annee: 2026,
      colonnes: [
        { id: "col1", label: "Lundi 16/03", date: "2026-03-16" },
        { id: "col2", label: "Mardi 17/03", date: "2026-03-17" },
        { id: "col3", label: "Mercredi 18/03", date: "2026-03-18" },
        { id: "col4", label: "Jeudi 19/03", date: "2026-03-19" },
        { id: "col5", label: "Vendredi 20/03", date: "2026-03-20" },
      ],
      lignes: [
        { id: "l1", label: "Bernard Luc", poste: "RCE" },
        { id: "l2", label: "Garcia Antonio", poste: "Chef d'équipe" },
        { id: "l3", label: "Moreau Thierry", poste: "Poseur" },
        { id: "l4", label: "Roux Fabien", poste: "Soudeur" },
        { id: "l5", label: "Leroy Karim", poste: "Aide Soudeur" },
        { id: "l6", label: "Fournier David", poste: "Conducteur d'engin" },
        { id: "l7", label: "Agent 7", poste: "Poseur" },
        { id: "l8", label: "Agent 8", poste: "Poseur" },
      ],
      cellules: {
        "l1-col1": { statut: "P", commentaire: "" },
        "l1-col2": { statut: "P", commentaire: "" },
        "l1-col3": { statut: "P", commentaire: "" },
        "l1-col4": { statut: "P", commentaire: "" },
        "l1-col5": { statut: "R", commentaire: "Repos" },
        "l2-col1": { statut: "P", commentaire: "" },
        "l2-col2": { statut: "P", commentaire: "" },
        "l2-col3": { statut: "P", commentaire: "" },
        "l2-col4": { statut: "P", commentaire: "" },
        "l2-col5": { statut: "P", commentaire: "" },
        "l3-col1": { statut: "P", commentaire: "" },
        "l3-col2": { statut: "P", commentaire: "" },
        "l3-col3": { statut: "A", commentaire: "Absence maladie" },
        "l3-col4": { statut: "P", commentaire: "" },
        "l3-col5": { statut: "P", commentaire: "" },
        "l4-col1": { statut: "P", commentaire: "" },
        "l4-col2": { statut: "P", commentaire: "" },
        "l4-col3": { statut: "P", commentaire: "" },
        "l4-col4": { statut: "P", commentaire: "" },
        "l4-col5": { statut: "P", commentaire: "" },
      },
    },
  });
  console.log("TableauService created");

  // --- LigneDE ---
  await prisma.ligneDE.createMany({
    data: [
      { projetId: projet1.id, code: "RVB-001", designation: "Dépose de voie courante (rail + traverses)", unite: "ml", quantite: 2400, prixUnitaire: 185.50, ordre: 1 },
      { projetId: projet1.id, code: "RVB-002", designation: "Pose de voie courante LRS 60E1", unite: "ml", quantite: 2400, prixUnitaire: 245.00, ordre: 2 },
      { projetId: projet1.id, code: "SA-001", designation: "Soudure aluminothermique en voie", unite: "u", quantite: 96, prixUnitaire: 320.00, ordre: 3 },
      { projetId: projet1.id, code: "TRAV-001", designation: "Fourniture et pose traverse béton M450", unite: "u", quantite: 4000, prixUnitaire: 92.30, ordre: 4 },
      { projetId: projet1.id, code: "BALL-001", designation: "Ballast neuf 31.5/50 en complément", unite: "t", quantite: 1800, prixUnitaire: 42.75, ordre: 5 },
    ],
  });
  console.log("LigneDE created");

  // --- RapportJournalier ---
  const now = new Date();
  const rapportDates: Date[] = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    rapportDates.push(d);
  }

  const travauxExemples = [
    [
      { description: "Dépose rail file haute V1 du PK 123.400 au PK 123.800", quantite: "400 ml", observations: "Rail coupé en barres de 18m" },
      { description: "Chargement traverses déposées sur wagon", quantite: "280 u", observations: "" },
    ],
    [
      { description: "Pose LRS 60E1 file basse V1 du PK 123.000 au PK 123.400", quantite: "400 ml", observations: "Soudures provisoires réalisées" },
      { description: "Réglage d'écartement", quantite: "400 ml", observations: "Ecartement conforme" },
    ],
    [
      { description: "Bourrage mécanisé V1 PK 122.600 - 123.200", quantite: "600 ml", observations: "Bourreuse B66" },
    ],
    [
      { description: "Soudures aluminothermiques V1", quantite: "8 u", observations: "Toutes conformes, poinçon FR-425" },
      { description: "Meulage des soudures", quantite: "8 u", observations: "" },
    ],
    [
      { description: "Libération LRS V1 PK 122.400 - 123.400", quantite: "1000 ml", observations: "Température rail : 23°C" },
    ],
  ];

  const rapportsData = [];
  for (let i = 0; i < 10; i++) {
    const date = rapportDates[i * 2];
    rapportsData.push({
      projetId: projet1.id,
      date,
      nomChantier: "LGV Sud - Secteur Valence",
      titre: `Rapport nuit N${i + 1} - S${Math.ceil((now.getDate() - i * 2) / 7)}`,
      posteNuit: true,
      heureDebutPrevue: "21:30",
      heureFinPrevue: "02:00",
      heureDebut: i === 3 ? "21:45" : "21:30",
      heureFin: i === 5 ? "01:30" : "02:00",
      heureRestituee: i === 5 ? "01:45" : "02:00",
      production: `Zone PK ${(122.4 + i * 0.2).toFixed(1)} - ${(122.6 + i * 0.2).toFixed(1)}`,
      commentaire: i === 3 ? "Retard prise en charge DPx de 15 min" : i === 7 ? "Pluie forte entre 23h et 00h, arrêt travaux 30 min" : null,
      redacteurId: admin.id,
      dateRedaction: date,
      valide: i < 7,
      travaux: travauxExemples[i % travauxExemples.length],
    });
  }

  await prisma.rapportJournalier.createMany({ data: rapportsData });
  console.log("RapportJournalier created:", rapportsData.length);

  // --- SoudureAluminothermique ---
  await prisma.soudureAluminothermique.createMany({
    data: [
      {
        projetId: projet1.id, ordre: 1, zoneTravaux: "V1 PK 123.200",
        date: rapportDates[0], poincon: "FR-425", pk: "123.200", voie: "V1",
        fileGD: "G", lacune: "24", profilRail: "60E1", nuanceAcier: "260",
        e1: "0.2", e2: "0.3", meulageProfil: "OK", creuxZone: "0.1",
        tracePointu: "OK", traceCreux: "OK", traceMeulage: "OK",
        observations: "", reception: "OK", raisonHS: null, couleurLigne: null,
      },
      {
        projetId: projet1.id, ordre: 2, zoneTravaux: "V1 PK 123.218",
        date: rapportDates[0], poincon: "FR-425", pk: "123.218", voie: "V1",
        fileGD: "D", lacune: "25", profilRail: "60E1", nuanceAcier: "260",
        e1: "0.3", e2: "0.2", meulageProfil: "OK", creuxZone: "0.2",
        tracePointu: "OK", traceCreux: "OK", traceMeulage: "OK",
        observations: "", reception: "OK", raisonHS: null, couleurLigne: null,
      },
      {
        projetId: projet1.id, ordre: 3, zoneTravaux: "V1 PK 123.236",
        date: rapportDates[2], poincon: "FR-425", pk: "123.236", voie: "V1",
        fileGD: "G", lacune: "23", profilRail: "60E1", nuanceAcier: "260",
        e1: "0.5", e2: "0.6", meulageProfil: "NOK", creuxZone: "0.8",
        tracePointu: "NOK", traceCreux: "NOK", traceMeulage: "NOK",
        observations: "Coulée défectueuse, excès de métal", reception: "HS", raisonHS: "Défaut de coulée - meulage impossible", couleurLigne: "#FFCDD2",
      },
      {
        projetId: projet1.id, ordre: 4, zoneTravaux: "V1 PK 123.254",
        date: rapportDates[4], poincon: "FR-425", pk: "123.254", voie: "V1",
        fileGD: "D", lacune: "24", profilRail: "60E1", nuanceAcier: "260",
        e1: "0.3", e2: "0.4", meulageProfil: "OK", creuxZone: "0.3",
        tracePointu: "OK", traceCreux: "Dir", traceMeulage: "OK",
        observations: "Léger creux champignon file D - surveillance", reception: "Dir", raisonHS: null, couleurLigne: "#FFF9C4",
      },
      {
        projetId: projet1.id, ordre: 5, zoneTravaux: "V1 PK 123.272",
        date: rapportDates[6], poincon: "FR-425", pk: "123.272", voie: "V1",
        fileGD: "G", lacune: "25", profilRail: "60E1", nuanceAcier: "260",
        e1: null, e2: null, meulageProfil: null, creuxZone: null,
        tracePointu: null, traceCreux: null, traceMeulage: null,
        observations: "Soudure réalisée, contrôle en attente", reception: null, raisonHS: null, couleurLigne: null,
      },
    ],
  });
  console.log("SoudureAluminothermique created");

  // --- CompositionTTx ---
  await prisma.compositionTTx.create({
    data: {
      projetId: projet1.id,
      titre: "Train travaux TT 816234",
      date: rapportDates[0],
      sens: "Paris → Province",
      vehicules: [
        { id: "v1", type: "Loco", numero: "BB 75105", position: 1, longueur: 17.8, observations: "Traction" },
        { id: "v2", type: "Wagon", numero: "Plat Ks 33 87 3929 001-4", position: 2, longueur: 19.9, observations: "Rails 60E1 barres de 108m" },
        { id: "v3", type: "Wagon", numero: "Plat Ks 33 87 3929 002-2", position: 3, longueur: 19.9, observations: "Rails 60E1 barres de 108m" },
        { id: "v4", type: "Locotracteur", numero: "Y 8437", position: 4, longueur: 10.8, observations: "Manoeuvre sur chantier" },
      ],
    },
  });
  console.log("CompositionTTx created");

  // MaterielTTx pré-chargé (estSysteme: true) — 43 entrées
  await prisma.materielTTx.createMany({
    data: [
      // === LOCOS (3) ===
      { type: "Loco", designation: "BB 61000 (PV)", estSysteme: true, capTraction: 1300, capEssieuxFreines: 210, longueur: 14.5 },
      { type: "Loco", designation: "MAK V211 (PV)", estSysteme: true, capTraction: 896, capEssieuxFreines: 136, longueur: 12.3 },
      { type: "Loco", designation: "Y8000 PV", estSysteme: true, capTraction: 132, capEssieuxFreines: 60, longueur: 11.0 },
      // === BALLASTIERES (3) ===
      { type: "Ballastiere", designation: "D12", estSysteme: true, poidsEntrant: 79, poidsSortant: 24, longueur: 14.0, nbEssieux: 4 },
      { type: "Ballastiere", designation: "Ex 100 Automatique", estSysteme: true, poidsEntrant: 90, poidsSortant: 25, longueur: 15.64, nbEssieux: 4 },
      { type: "Ballastiere", designation: "C12", estSysteme: true, poidsEntrant: 39.8, poidsSortant: 12.3, longueur: 9.64, nbEssieux: 2 },
      // === BIGRUE (1) ===
      { type: "Bigrue", designation: "Type DGS82BG", estSysteme: true, poidsEntrant: 158, poidsSortant: 158, longueur: 32.6, nbEssieux: 8 },
      // === BML (2) ===
      { type: "BML", designation: "Type 108-32 U", estSysteme: true, poidsEntrant: 76.6, poidsSortant: 76.6, longueur: 32.8, nbEssieux: 6 },
      { type: "BML", designation: "Type 108-475", estSysteme: true, poidsEntrant: 104, poidsSortant: 104, longueur: 33.22, nbEssieux: 6 },
      // === REGALEUSES (2) ===
      { type: "Regaleuse", designation: "Type SSP203", estSysteme: true, poidsEntrant: 28, poidsSortant: 28, longueur: 13.26, nbEssieux: 2 },
      { type: "Regaleuse", designation: "Type R24 E", estSysteme: true, poidsEntrant: 55, poidsSortant: 55, longueur: 19.33, nbEssieux: 4 },
      // === STABILISATEURS (2) ===
      { type: "Stabilisateur", designation: "Type DGS42N", estSysteme: true, poidsEntrant: 36.5, poidsSortant: 36.5, longueur: 32.98, nbEssieux: 6 },
      { type: "Stabilisateur", designation: "Type DGS72N", estSysteme: true, poidsEntrant: 75, poidsSortant: 75, longueur: 29.6, nbEssieux: 6 },
      // === WAGONS (26) ===
      { type: "Wagon", designation: "Wagon Pupitre", estSysteme: true, poidsEntrant: 80, poidsSortant: 40, longueur: 25.26, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 3 Panneaux Beton 12m", estSysteme: true, poidsEntrant: 48.7, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 4 Panneaux Bois 18m", estSysteme: true, poidsEntrant: 42.04, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 + Mini-Pelle", estSysteme: true, poidsEntrant: 30.8, poidsSortant: 30.8, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "S39", estSysteme: true, poidsEntrant: 79.5, poidsSortant: 20, longueur: 14.04, nbEssieux: 4 },
      { type: "Wagon", designation: "R39", estSysteme: true, poidsEntrant: 78.8, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "K 39", estSysteme: true, poidsEntrant: 39.2, poidsSortant: 12.2, longueur: 13.86, nbEssieux: 2 },
      { type: "Wagon", designation: "R39 Appro (180 Tba M240)", estSysteme: true, poidsEntrant: 75.1, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "K50 Vide / Refoulement", estSysteme: true, poidsEntrant: 12.7, poidsSortant: 12.7, longueur: 13.86, nbEssieux: 2 },
      { type: "Wagon", designation: "R39 Vide / Refoulement", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Appro (180 Tba M240 NTA)", estSysteme: true, poidsEntrant: 75.1, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Appro Ballast (30T)", estSysteme: true, poidsEntrant: 58.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Appro Sable Piste (30T)", estSysteme: true, poidsEntrant: 58.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Appro divers (30T)", estSysteme: true, poidsEntrant: 58.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Ramassage / Finition", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 58.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Terres de degarnissage", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 58.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Produits de depose", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 58.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Rails Mixtes + JIC", estSysteme: true, poidsEntrant: 52, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Plancher Appareil", estSysteme: true, poidsEntrant: 75, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Rails 60kg", estSysteme: true, poidsEntrant: 52, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Menu materiel Appareil", estSysteme: true, poidsEntrant: 50, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Rails 50kg", estSysteme: true, poidsEntrant: 52, poidsSortant: 38, longueur: 19.9, nbEssieux: 4 },
      { type: "Wagon", designation: "R39 Materiel divers", estSysteme: true, poidsEntrant: 30, poidsSortant: 30, longueur: 19.9, nbEssieux: 4 },
      // === WAGONS LRS (4) ===
      { type: "WagonLRS", designation: "Pousseur LRS", estSysteme: true, poidsEntrant: 50, poidsSortant: 50, longueur: 19.9, nbEssieux: 4 },
      { type: "WagonLRS", designation: "Goulottes LRS", estSysteme: true, poidsEntrant: 30, poidsSortant: 30, longueur: 19.9, nbEssieux: 4 },
      { type: "WagonLRS", designation: "S03 42 barres 46E2", estSysteme: true, poidsEntrant: 60, poidsSortant: 22, longueur: 19.9, nbEssieux: 4 },
      { type: "WagonLRS", designation: "S03 42 barres UIC60", estSysteme: true, poidsEntrant: 52, poidsSortant: 18, longueur: 14.04, nbEssieux: 4 },
    ]
  })
  console.log('MaterielTTx created: 43 entries')

  // Mise à jour infos projet LGV Sud
  await prisma.projet.update({
    where: { id: projet1.id },
    data: {
      moaNom: "DUPONT", moaPrenom: "Jean",
      moaAdresse: "12 rue de la Paix, 75001 Paris",
      numeroAffaire: "2025-LGV-001",
      numeroCommande: "CMD-2025-0042",
      numeroOTP: "OTP-7890",
      adresseChantier: "LGV Sud — Section Bordeaux–Toulouse",
      dateDebut: new Date("2025-03-01"),
      dateFin: new Date("2025-12-31"),
    }
  })
  console.log('Projet LGV Sud infos updated')

  // Événements de démo
  await prisma.evenementChantier.createMany({
    data: [
      { projetId: projet1.id, date: new Date("2025-06-03"), titre: "Notification marché", categorie: "contrat" },
      { projetId: projet1.id, date: new Date("2025-06-12"), titre: "Offre AIA", categorie: "groupement" },
      { projetId: projet1.id, date: new Date("2025-07-10"), titre: "Contractualisation avec AIA", categorie: "contrat" },
      { projetId: projet1.id, date: new Date("2025-08-05"), titre: "Mail alerte risque voisinage", categorie: "alerte", description: "Fort risque vis-à-vis des environnants + terrassements énormes" },
    ]
  })
  console.log('Evenements created')

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
