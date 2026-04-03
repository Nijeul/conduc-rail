import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────
// 41 Rapports Journaliers — Chantier Connexe BA Le Mans
// RJ 17 à 48 + variantes "bis"
// ────────────────────────────────────────────────────────────

interface RJData {
  numero: string; // "17", "17 bis", etc.
  date: string; // ISO date YYYY-MM-DD
  posteNuit: boolean;
  heureDebutPrevue: string;
  heureFinPrevue: string;
  heureDebut: string;
  heureFin: string;
  heureRestituee?: string;
  travaux: string; // description principale des travaux
  personnel: string; // résumé personnel mobilisé
  engins: string; // résumé engins utilisés
  anomalies?: string; // anomalies éventuelles
}

const rapports: RJData[] = [
  {
    numero: "17",
    date: "2025-10-06",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:45",
    heureRestituee: "05:45",
    travaux:
      "Dépose de traverses bois voie 1 — PK 210.500 à 210.700. Mise en place de traverses béton monobloc. Bourrage mécanique lourd.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 8 opérateurs voie, 2 conducteurs d'engins",
    engins: "1 bourreuse, 1 régaleuse, 1 pelle rail-route 10T, 2 lorries",
    anomalies: "RAS",
  },
  {
    numero: "18",
    date: "2025-10-07",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:15",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite dépose/repose traverses voie 1 — PK 210.700 à 210.950. Bourrage mécanique. Relevage +20mm.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 8 opérateurs voie, 2 conducteurs d'engins",
    engins: "1 bourreuse, 1 régaleuse, 1 pelle rail-route 10T, 2 lorries",
    anomalies: "Retard prise en charge IPC de 15 min",
  },
  {
    numero: "19",
    date: "2025-10-08",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:30",
    heureRestituee: "05:30",
    travaux:
      "Remplacement LRS voie 1 — PK 211.000 à 211.200. Sciage, soudure aluminothermique x4. Libération de LRS.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 2 soudeurs AT, 1 conducteur pelle",
    engins: "1 pelle rail-route 10T, 1 lorry, matériel soudure AT",
    anomalies: "RAS",
  },
  {
    numero: "20",
    date: "2025-10-09",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite remplacement LRS voie 1 — PK 211.200 à 211.400. Soudures AT x3. Meulage reprofilage.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 2 soudeurs AT, 1 conducteur pelle",
    engins:
      "1 pelle rail-route 10T, 1 lorry, matériel soudure AT, 1 meuleuse rail",
  },
  {
    numero: "21",
    date: "2025-10-10",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:50",
    heureRestituee: "05:50",
    travaux:
      "Dépose appareil de voie (ADV) n°12 — Démontage boulonnerie, sciage rails, dégarnissage. Évacuation ballast pollué.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 10 opérateurs voie, 2 conducteurs d'engins",
    engins:
      "2 pelles rail-route, 1 chargeur, 4 lorries, 1 camion ballast 20T",
    anomalies: "Présence amiante confirmée sur certaines traverses bois — port EPI renforcé",
  },
  {
    numero: "22",
    date: "2025-10-13",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite dépose ADV n°12 — Purge ballast pollué 150T. Mise en place sous-couche géotextile. Apport ballast neuf.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 10 opérateurs voie, 3 conducteurs d'engins",
    engins:
      "2 pelles rail-route, 1 chargeur, 3 camions ballast 20T, 1 régaleuse",
    anomalies: "RAS",
  },
  {
    numero: "23",
    date: "2025-10-14",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Pose ADV neuf n°12 — Mise en place panneaux préfabriqués. Réglage géométrique. Boulonnerie.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 12 opérateurs voie, 2 conducteurs d'engins, 1 géomètre",
    engins: "2 pelles rail-route, 1 bourreuse, 2 lorries",
    anomalies: "RAS",
  },
  {
    numero: "24",
    date: "2025-10-15",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:40",
    heureRestituee: "05:40",
    travaux:
      "Bourrage ADV n°12 — Bourrage mécanique lourd. Contrôle géométrique. Soudures AT raccordement x2.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 2 soudeurs AT, 2 conducteurs d'engins, 1 géomètre",
    engins: "1 bourreuse, 1 régaleuse, matériel soudure AT",
    anomalies: "RAS",
  },
  {
    numero: "24 bis",
    date: "2025-10-16",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:30",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Reprise bourrage ADV n°12 après contrôle qualité. Complément ballastage. Réglage fin géométrie.",
    personnel:
      "1 CDT, 1 chef d'équipe, 4 opérateurs voie, 2 conducteurs d'engins",
    engins: "1 bourreuse, 1 régaleuse, 1 camion ballast 20T",
    anomalies: "Prise en charge retardée de 30 min — attente DPx",
  },
  {
    numero: "25",
    date: "2025-10-17",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:30",
    heureRestituee: "05:30",
    travaux:
      "Dépose traverses bois voie 2 — PK 211.400 à 211.600. Repose traverses béton. Bourrage mécanique.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 8 opérateurs voie, 2 conducteurs d'engins",
    engins: "1 bourreuse, 1 régaleuse, 1 pelle rail-route 10T, 2 lorries",
    anomalies: "RAS",
  },
  {
    numero: "26",
    date: "2025-10-20",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite dépose/repose traverses voie 2 — PK 211.600 à 211.850. Bourrage mécanique lourd. Relevage.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 8 opérateurs voie, 2 conducteurs d'engins",
    engins: "1 bourreuse, 1 régaleuse, 1 pelle rail-route 10T, 2 lorries",
    anomalies: "RAS",
  },
  {
    numero: "27",
    date: "2025-10-21",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Dépose JIC voie 2 PK 211.200. Mise en place coupons provisoires. Préparation soudures AT.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 2 soudeurs AT",
    engins: "1 pelle rail-route 10T, 1 lorry, matériel soudure AT",
    anomalies: "RAS",
  },
  {
    numero: "28",
    date: "2025-10-22",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:45",
    heureRestituee: "05:45",
    travaux:
      "Soudures AT raccordement JIC voie 2 x4. Libération LRS. Meulage reprofilage rail.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 2 soudeurs AT",
    engins: "1 pelle rail-route 10T, matériel soudure AT, 1 meuleuse rail",
    anomalies: "RAS",
  },
  {
    numero: "29",
    date: "2025-10-23",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "RVB (Renouvellement Voie Ballast) voie 1 — PK 212.000 à 212.300. Dégarnissage + criblage ballast.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 10 opérateurs voie, 3 conducteurs d'engins",
    engins:
      "1 dégarnisseuse-cribleuse, 2 pelles rail-route, 3 lorries, 2 camions ballast",
    anomalies: "RAS",
  },
  {
    numero: "30",
    date: "2025-10-24",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite RVB voie 1 — PK 212.300 à 212.500. Bourrage mécanique lourd. Régalage. Contrôle géométrique.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 10 opérateurs voie, 3 conducteurs d'engins, 1 géomètre",
    engins:
      "1 bourreuse, 1 régaleuse, 1 stabilisateur dynamique, 2 lorries",
    anomalies: "RAS",
  },
  {
    numero: "31",
    date: "2025-10-27",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:15",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Renouvellement passage à niveau PN 124 — Dépose tabliers PN. Terrassement en purge. Mise en place buses.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 8 opérateurs voie, 2 conducteurs d'engins, 1 maçon",
    engins: "2 pelles rail-route, 1 camion benne 15T, 1 compacteur",
    anomalies: "Retard 15 min — attente levée de consignation caténaire",
  },
  {
    numero: "32",
    date: "2025-10-28",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite PN 124 — Coulage béton désactivé (6m³). Mise en place rails à gorge. Reconstitution chaussée.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 8 opérateurs voie, 1 maçon, 2 conducteurs d'engins",
    engins:
      "1 pelle rail-route, 1 camion toupie béton, 1 compacteur, 1 finisseur",
    anomalies: "RAS",
  },
  {
    numero: "33",
    date: "2025-10-29",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:30",
    heureRestituee: "05:30",
    travaux:
      "Finition PN 124 — Joints de dilatation. Signalisation horizontale provisoire. Contrôle qualité.",
    personnel:
      "1 CDT, 1 chef d'équipe, 4 opérateurs voie, 1 agent signalisation",
    engins: "1 lorry, 1 fourgon outillage",
    anomalies: "RAS",
  },
  {
    numero: "34",
    date: "2025-10-30",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Dépose ADV n°14 — Démontage complet. Évacuation traverse et petit matériel. Dégarnissage ballast 200T.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 12 opérateurs voie, 3 conducteurs d'engins",
    engins:
      "2 pelles rail-route, 1 chargeur, 4 lorries, 2 camions ballast 20T",
    anomalies: "RAS",
  },
  {
    numero: "35",
    date: "2025-11-03",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite dépose ADV n°14 — Purge sous-couche polluée. Mise en place géotextile + GNT 0/31.5. Compactage.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 10 opérateurs voie, 3 conducteurs d'engins",
    engins:
      "2 pelles rail-route, 1 compacteur, 3 camions GNT, 1 chargeur",
    anomalies: "RAS",
  },
  {
    numero: "36",
    date: "2025-11-04",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Pose ADV neuf n°14 — Pose panneaux préfabriqués (3 éléments). Assemblage. Réglage géométrique fin.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 12 opérateurs voie, 2 conducteurs d'engins, 1 géomètre",
    engins: "2 pelles rail-route, 1 bourreuse, 2 lorries",
    anomalies: "RAS",
  },
  {
    numero: "37",
    date: "2025-11-05",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:50",
    heureRestituee: "05:50",
    travaux:
      "Bourrage ADV n°14. Soudures AT raccordement x4. Libération LRS. Contrôle US soudures.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 2 soudeurs AT, 2 conducteurs d'engins, 1 opérateur US",
    engins: "1 bourreuse, 1 régaleuse, matériel soudure AT, appareil US",
    anomalies: "RAS",
  },
  {
    numero: "37 bis",
    date: "2025-11-06",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "03:00",
    heureRestituee: "03:00",
    travaux:
      "Nuit écourtée — Reprise défaut géométrique ADV n°14 (flèche > tolérance). Bourrage complémentaire ciblé.",
    personnel:
      "1 CDT, 1 chef d'équipe, 4 opérateurs voie, 1 conducteur bourreuse",
    engins: "1 bourreuse",
    anomalies:
      "Nuit écourtée à 03h00 suite à alerte météo (vent > 80 km/h). Repli anticipé.",
  },
  {
    numero: "38",
    date: "2025-11-07",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Création piste latérale voie 2 — Décapage terre végétale 300m². Apport GNT 40T. Compactage. Mise en place clôture provisoire.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs TP, 2 conducteurs d'engins",
    engins:
      "1 pelle 20T, 1 compacteur, 2 camions benne 15T, 1 chargeur",
    anomalies: "RAS",
  },
  {
    numero: "39",
    date: "2025-11-10",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Ripage voie 2 — Ripage mécanique de 150mm sur 400m. Bourrage mécanique lourd. Contrôle géométrique.",
    personnel:
      "1 CDT, 2 chefs d'équipe, 8 opérateurs voie, 3 conducteurs d'engins, 1 géomètre",
    engins: "1 bourreuse-ripeuse, 1 régaleuse, 1 stabilisateur dynamique",
    anomalies: "RAS",
  },
  {
    numero: "40",
    date: "2025-11-11",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Remplacement aiguillage ADV n°16 — Dépose lame d'aiguille usée. Pose lame neuve. Réglage course + contrôle.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 1 agent SEF, 1 conducteur pelle",
    engins: "1 pelle rail-route 10T, 1 lorry, 1 fourgon outillage SEF",
    anomalies: "RAS",
  },
  {
    numero: "41",
    date: "2025-11-12",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:45",
    heureRestituee: "05:45",
    travaux:
      "Meulage reprofilage voie 1 PK 210.500 à 212.500 (2 km). Contrôle profil transversal par Miniprof.",
    personnel:
      "1 CDT, 1 chef d'équipe, 4 opérateurs voie, 1 opérateur meuleuse, 1 contrôleur Miniprof",
    engins: "1 meuleuse rail (train meuleur léger), 1 lorry, appareil Miniprof",
    anomalies: "RAS",
  },
  {
    numero: "42",
    date: "2025-11-13",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Ballastage complémentaire voie 1 — Apport ballast 350T. Régalage mécanique. Profilage banquettes.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 3 conducteurs d'engins",
    engins: "1 régaleuse, 3 camions ballast 20T, 1 pelle rail-route",
    anomalies: "RAS",
  },
  {
    numero: "43",
    date: "2025-11-14",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Travaux caténaire — Remplacement 3 poteaux caténaire. Réglage hauteur fil de contact. Essais diélectriques.",
    personnel:
      "1 CDT, 1 chef d'équipe CTTE, 6 monteurs caténaire, 2 conducteurs d'engins",
    engins:
      "1 lorry-grue, 1 nacelle rail-route, 1 fourgon outillage CTTE",
    anomalies: "RAS",
  },
  {
    numero: "43 bis",
    date: "2025-11-17",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite caténaire — Remplacement 2 poteaux supplémentaires. Réglage pendules et haubanage. Mesures de flèche.",
    personnel:
      "1 CDT, 1 chef d'équipe CTTE, 6 monteurs caténaire, 2 conducteurs d'engins",
    engins:
      "1 lorry-grue, 1 nacelle rail-route, 1 fourgon outillage CTTE",
    anomalies: "RAS",
  },
  {
    numero: "44",
    date: "2025-11-18",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Signalisation — Dépose/repose signal carré C124. Installation câblage nouveau. Essais fonctionnels avec SEF.",
    personnel:
      "1 CDT, 1 chef d'équipe SES, 4 agents signalisation, 1 agent SEF, 1 conducteur pelle",
    engins: "1 pelle rail-route 10T, 1 fourgon outillage SES",
    anomalies: "RAS",
  },
  {
    numero: "45",
    date: "2025-11-19",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "05:30",
    heureRestituee: "05:30",
    travaux:
      "Assainissement — Curage fossé latéral 250 ml. Pose cunette béton préfabriquée 80 ml. Raccordement buse Ø400.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs TP, 2 conducteurs d'engins",
    engins: "1 pelle 8T, 1 mini-pelle 3T, 1 camion benne 15T",
    anomalies: "RAS",
  },
  {
    numero: "45 bis",
    date: "2025-11-20",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:30",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Suite assainissement — Pose cunette 60 ml. Remblaiement tranchée. Engazonnement talus 200 m².",
    personnel:
      "1 CDT, 1 chef d'équipe, 4 opérateurs TP, 1 conducteur pelle",
    engins: "1 pelle 8T, 1 camion benne 15T",
    anomalies: "Retard prise en charge 30 min — incident signalisation secteur",
  },
  {
    numero: "46",
    date: "2025-11-21",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Stabilisation dynamique voie 1 PK 210.500 à 212.500. Mesure Mauzin après stabilisation. Contrôle NL post-travaux.",
    personnel:
      "1 CDT, 1 chef d'équipe, 4 opérateurs voie, 2 conducteurs d'engins, 1 opérateur Mauzin",
    engins: "1 stabilisateur dynamique, 1 voiture Mauzin, 1 lorry",
    anomalies: "RAS",
  },
  {
    numero: "47",
    date: "2025-11-24",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Nettoyage chantier — Ramassage petits matériels et déchets. Repli base travaux. Remise en état piste. Clôtures définitives.",
    personnel:
      "1 CDT, 1 chef d'équipe, 6 opérateurs voie, 2 conducteurs d'engins",
    engins: "1 pelle 8T, 1 camion benne 15T, 1 fourgon",
    anomalies: "RAS",
  },
  {
    numero: "47 bis",
    date: "2025-11-25",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "04:00",
    heureRestituee: "04:00",
    travaux:
      "Finition nettoyage — Évacuation dernières bennes déchets. Démontage signalisation temporaire chantier. Contrôle visuel final.",
    personnel:
      "1 CDT, 1 chef d'équipe, 4 opérateurs voie, 1 conducteur camion",
    engins: "1 camion benne 15T, 1 fourgon",
    anomalies: "Nuit écourtée — travaux terminés en avance.",
  },
  {
    numero: "48",
    date: "2025-11-26",
    posteNuit: true,
    heureDebutPrevue: "22:00",
    heureFinPrevue: "06:00",
    heureDebut: "22:00",
    heureFin: "06:00",
    heureRestituee: "06:00",
    travaux:
      "Réception chantier — Tournée réception contradictoire avec MOA/MOE. Levée des réserves mineures. PV de réception signé. Fin de chantier Connexe BA Le Mans.",
    personnel:
      "1 CDT, 1 directeur travaux, représentant MOA, représentant MOE, 2 opérateurs voie (levée réserves)",
    engins: "1 lorry, 1 fourgon",
    anomalies: "3 réserves mineures levées sur site. PV signé sans réserve résiduelle.",
  },
];

async function main() {
  console.log("=== Seed Rapports Journaliers — Le Mans ===\n");

  // 1. Trouver l'utilisateur
  const user = await prisma.user.findUnique({
    where: { email: "julien.paulais@vinci-construction.com" },
  });
  if (!user) {
    console.error("Utilisateur julien.paulais@vinci-construction.com introuvable !");
    process.exit(1);
  }
  console.log(`Utilisateur trouvé : ${user.name} (${user.id})`);

  // 2. Trouver le projet Le Mans
  const membership = await prisma.projetMember.findFirst({
    where: {
      userId: user.id,
      projet: { name: { contains: "Mans" } },
    },
    include: { projet: true },
  });
  if (!membership) {
    console.error("Aucun projet contenant 'Mans' trouvé pour cet utilisateur !");
    process.exit(1);
  }
  const projet = membership.projet;
  console.log(`Projet trouvé : ${projet.name} (${projet.id})\n`);

  // 3. Créer les 41 rapports
  let created = 0;
  for (const rj of rapports) {
    const titre = `RJ N° ${rj.numero}`;

    // Construire le champ travaux (Json) avec personnel et engins
    const travauxJson = [
      {
        description: rj.travaux,
        personnel: rj.personnel,
        engins: rj.engins,
      },
    ];

    // Construire le commentaire avec les anomalies
    const commentaire =
      rj.anomalies && rj.anomalies !== "RAS"
        ? `Anomalies : ${rj.anomalies}`
        : null;

    const data = {
      projetId: projet.id,
      date: new Date(rj.date),
      nomChantier: "Connexe BA Le Mans",
      titre,
      posteNuit: rj.posteNuit,
      heureDebutPrevue: rj.heureDebutPrevue,
      heureFinPrevue: rj.heureFinPrevue,
      heureDebut: rj.heureDebut,
      heureFin: rj.heureFin,
      heureRestituee: rj.heureRestituee ?? null,
      production: rj.travaux,
      commentaire,
      travaux: travauxJson,
      redacteurId: user.id,
      dateRedaction: new Date(rj.date),
      valide: true,
    };

    await prisma.rapportJournalier.create({ data });
    created++;
    console.log(`  ✓ ${titre} — ${rj.date}`);
  }

  console.log(`\n=== ${created} rapports créés avec succès ===`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
