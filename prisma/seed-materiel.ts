import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding materiel TTx...");

  // Supprimer les anciens materiels systeme
  const deleted = await prisma.materielTTx.deleteMany({
    where: { estSysteme: true },
  });
  console.log(`Deleted ${deleted.count} ancien(s) materiel(s) systeme`);

  // Creer les 43 nouvelles entrees
  await prisma.materielTTx.createMany({
    data: [
      // === LOCOS (3) ===
      { type: "Loco", designation: "BB 61000 (PV)", estSysteme: true, capTraction: 1300, capEssieuxFreines: 210, longueur: 14.5, poidsEntrant: null, poidsSortant: null, nbEssieux: null },
      { type: "Loco", designation: "MAK V211 (PV)", estSysteme: true, capTraction: 896, capEssieuxFreines: 136, longueur: 12.3, poidsEntrant: null, poidsSortant: null, nbEssieux: null },
      { type: "Loco", designation: "Y8000 PV", estSysteme: true, capTraction: 132, capEssieuxFreines: 60, longueur: 11.0, poidsEntrant: null, poidsSortant: null, nbEssieux: null },

      // === BALLASTIERES (3) ===
      { type: "Ballastiere", designation: "D12", estSysteme: true, poidsEntrant: 79, poidsSortant: 24, longueur: 14.0, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Ballastiere", designation: "Ex 100 Automatique", estSysteme: true, poidsEntrant: 90, poidsSortant: 25, longueur: 15.64, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Ballastiere", designation: "C12", estSysteme: true, poidsEntrant: 39.8, poidsSortant: 12.3, longueur: 9.64, nbEssieux: 2, capTraction: null, capEssieuxFreines: null },

      // === BIGRUE (1) ===
      { type: "Bigrue", designation: "Type DGS82BG", estSysteme: true, poidsEntrant: 158, poidsSortant: 158, longueur: 32.6, nbEssieux: 8, capTraction: null, capEssieuxFreines: null },

      // === BML (2) ===
      { type: "BML", designation: "Type 108-32 U", estSysteme: true, poidsEntrant: 76.6, poidsSortant: 76.6, longueur: 32.8, nbEssieux: 6, capTraction: null, capEssieuxFreines: null },
      { type: "BML", designation: "Type 108-475", estSysteme: true, poidsEntrant: 104, poidsSortant: 104, longueur: 33.22, nbEssieux: 6, capTraction: null, capEssieuxFreines: null },

      // === REGALEUSES (2) ===
      { type: "Regaleuse", designation: "Type SSP203", estSysteme: true, poidsEntrant: 28, poidsSortant: 28, longueur: 13.26, nbEssieux: 2, capTraction: null, capEssieuxFreines: null },
      { type: "Regaleuse", designation: "Type R24 E", estSysteme: true, poidsEntrant: 55, poidsSortant: 55, longueur: 19.33, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },

      // === STABILISATEURS (2) ===
      { type: "Stabilisateur", designation: "Type DGS42N", estSysteme: true, poidsEntrant: 36.5, poidsSortant: 36.5, longueur: 32.98, nbEssieux: 6, capTraction: null, capEssieuxFreines: null },
      { type: "Stabilisateur", designation: "Type DGS72N", estSysteme: true, poidsEntrant: 75, poidsSortant: 75, longueur: 29.6, nbEssieux: 6, capTraction: null, capEssieuxFreines: null },

      // === WAGONS (26) ===
      { type: "Wagon", designation: "Wagon Pupitre", estSysteme: true, poidsEntrant: 80, poidsSortant: 40, longueur: 25.26, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 3 Panneaux Beton 12m", estSysteme: true, poidsEntrant: 48.7, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 4 Panneaux Bois 18m", estSysteme: true, poidsEntrant: 42.04, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 + Mini-Pelle", estSysteme: true, poidsEntrant: 30.8, poidsSortant: 30.8, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "S39", estSysteme: true, poidsEntrant: 79.5, poidsSortant: 20, longueur: 14.04, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39", estSysteme: true, poidsEntrant: 78.8, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "K 39", estSysteme: true, poidsEntrant: 39.2, poidsSortant: 12.2, longueur: 13.86, nbEssieux: 2, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Appro (180 Tba M240)", estSysteme: true, poidsEntrant: 75.1, poidsSortant: 23.8, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "K50 Vide / Refoulement", estSysteme: true, poidsEntrant: 12.7, poidsSortant: 12.7, longueur: 13.86, nbEssieux: 2, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Vide / Refoulement", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Appro (180 Tba M240 NTA)", estSysteme: true, poidsEntrant: 75.1, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Appro Ballast (30T)", estSysteme: true, poidsEntrant: 58.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Appro Sable Piste (30T)", estSysteme: true, poidsEntrant: 58.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Appro divers (30T)", estSysteme: true, poidsEntrant: 58.4, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Ramassage / Finition", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 58.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Terres de degarnissage", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 58.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Produits de depose", estSysteme: true, poidsEntrant: 23.4, poidsSortant: 58.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Rails Mixtes + JIC", estSysteme: true, poidsEntrant: 52, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Plancher Appareil", estSysteme: true, poidsEntrant: 75, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Rails 60kg", estSysteme: true, poidsEntrant: 52, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Menu materiel Appareil", estSysteme: true, poidsEntrant: 50, poidsSortant: 23.4, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Rails 50kg", estSysteme: true, poidsEntrant: 52, poidsSortant: 38, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "Wagon", designation: "R39 Materiel divers", estSysteme: true, poidsEntrant: 30, poidsSortant: 30, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },

      // === WAGONS LRS (4) ===
      { type: "WagonLRS", designation: "Pousseur LRS", estSysteme: true, poidsEntrant: 50, poidsSortant: 50, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "WagonLRS", designation: "Goulottes LRS", estSysteme: true, poidsEntrant: 30, poidsSortant: 30, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "WagonLRS", designation: "S03 42 barres 46E2", estSysteme: true, poidsEntrant: 60, poidsSortant: 22, longueur: 19.9, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
      { type: "WagonLRS", designation: "S03 42 barres UIC60", estSysteme: true, poidsEntrant: 52, poidsSortant: 18, longueur: 14.04, nbEssieux: 4, capTraction: null, capEssieuxFreines: null },
    ],
  });

  console.log("43 materiels systeme crees avec succes!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
