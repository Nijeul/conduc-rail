// Structure de la grille de la matrice décisionnelle fournisseurs,
// calquée sur le fichier Excel « Matrice Décisionnelle d'Offres Fournisseurs »
// (feuille « Matrice »). Les valeurs des cellules sont indexées par l'id
// du FournisseurCandidat.

export interface LigneBidComp {
  id: string
  libelle: string
  besoin: string
  valeurs: Record<string, string>
}

export interface SectionBidComp {
  id: string
  titre: string
  type: 'texte' | 'cout'
  lignes: LigneBidComp[]
}

export interface BidCompData {
  sections: SectionBidComp[]
  // Typologie d'achat de l'en-tête (FOURNITURE / PRESTATION / SOUS-TRAITANCE)
  typologieAchat?: string
  // Blocs de synthèse du bas de la feuille Excel
  opportunites?: string
  risques?: string
  recommandation?: string
  // Champs hérités des anciennes matrices (conservés pour compatibilité)
  conclusions: string
  pourquoiPasTroisFournisseurs: string
  signatureSourcing: string
  signatureProjet: string
}

function ligne(id: string, libelle: string, besoin = ''): LigneBidComp {
  return { id, libelle, besoin, valeurs: {} }
}

/** Gabarit par défaut, fidèle à la feuille Excel « Matrice » */
export function bidCompParDefaut(): BidCompData {
  return {
    sections: [
      {
        id: 'offre',
        titre: 'Offre fournisseur',
        type: 'texte',
        lignes: [
          ligne('offre-ref', 'N° offre fournisseur et date', 'N° OFFRE ET DATE'),
          ligne('offre-validite', "Validité de l'offre", 'DATE'),
        ],
      },
      {
        id: 'financier',
        titre: 'Conditions financières',
        type: 'texte',
        lignes: [
          ligne('paiement', 'Terme de paiement', 'DÉLAI DE PAIEMENT CHOISI'),
          ligne('acomptes', 'Acomptes ?', 'OUI / NON et %'),
          ligne('caution', 'Caution bancaire fournisseur ?', 'OUI / NON et %'),
          ligne('revision', 'Formule de révision ?', 'OUI / NON'),
        ],
      },
      {
        id: 'delais',
        titre: 'Évaluation délais',
        type: 'texte',
        lignes: [
          ligne('incoterm', 'Incoterm fournisseur', 'INCOTERM DU CHANTIER CHOISI'),
          ligne('premier-besoin', 'Date du premier besoin', 'DATE'),
          ligne('dernier-besoin', 'Date du dernier besoin', 'DATE'),
        ],
      },
      {
        id: 'juridique',
        titre: 'Évaluation juridique',
        type: 'texte',
        lignes: [
          ligne('penalites', 'Pénalités', 'OUI / NON'),
          ligne('responsabilite', 'Responsabilité', '% DU MONTANT / ILLIMITÉE'),
          ligne('garantie', 'Garantie', 'DURÉE'),
          ligne('attestation-legale', 'Plateforme Attestation Légale acceptée ?', 'OUI / NON'),
        ],
      },
      {
        id: 'qualite',
        titre: 'Qualité et prévention',
        type: 'texte',
        lignes: [
          ligne('normes', 'Normes et standards à respecter', 'NORMES APPLICABLES'),
          ligne('secufer', 'SECUFER accepté ?', 'OUI / NON / NON APPLICABLE'),
        ],
      },
      {
        id: 'technique',
        titre: 'Évaluation technique',
        type: 'texte',
        lignes: [
          ligne('capacite', 'Capacité de production'),
          ligne('tolerances', 'Tolérances techniques'),
        ],
      },
      {
        id: 'csrd',
        titre: 'Évaluation CSRD — business > 200 k€',
        type: 'texte',
        lignes: [
          ligne('adit', 'Enquête de compliance ADIT ?', 'OUI / NON'),
          ligne('defaillance', 'Risque de défaillance financière', 'TRÈS FAIBLE / FAIBLE / MOYEN / FORT'),
          ligne('rse', 'Questionnaire auto-évaluation RSE ?', 'OUI / NON'),
          ligne('rex', 'A-t-on un REX fournisseur ?', 'OUI / NON'),
          ligne('carbone', "Fourniture de l'empreinte carbone ?", 'OUI / NON'),
        ],
      },
      {
        id: 'couts',
        titre: 'Détail des coûts',
        type: 'cout',
        lignes: [
          ligne('couts-fixes', 'Coûts fixes'),
          ligne('couts-variables', 'Coûts variables'),
        ],
      },
      {
        id: 'options',
        titre: 'Options',
        type: 'cout',
        lignes: [
          ligne('livrables', 'Livrables', 'INCLUS / NON INCLUS'),
          ligne('transport', 'Transport', 'INCLUS / NON INCLUS'),
          ligne('taxes', 'Impôts et taxes', 'OUI / NON'),
          ligne('change', 'Risques de change', 'OUI / NON'),
          ligne('autres-risques', 'Autres risques', 'À PRÉCISER'),
        ],
      },
    ],
    typologieAchat: '',
    opportunites: '',
    risques: '',
    recommandation: '',
    conclusions: '',
    pourquoiPasTroisFournisseurs: '',
    signatureSourcing: '',
    signatureProjet: '',
  }
}

/** Valide grossièrement la forme d'un Json bidComp venu de la base */
export function estBidCompValide(data: unknown): data is BidCompData {
  if (!data || typeof data !== 'object') return false
  const d = data as BidCompData
  return Array.isArray(d.sections) && d.sections.length > 0
}

/**
 * Complète un bidComp existant avec les champs ajoutés depuis (typologie,
 * opportunités, risques, recommandation) — les anciennes conclusions
 * deviennent la recommandation si elle est vide.
 */
export function normaliserBidComp(data: BidCompData): BidCompData {
  return {
    ...data,
    typologieAchat: data.typologieAchat ?? '',
    opportunites: data.opportunites ?? '',
    risques: data.risques ?? '',
    recommandation: data.recommandation ?? data.conclusions ?? '',
    conclusions: data.conclusions ?? '',
    pourquoiPasTroisFournisseurs: data.pourquoiPasTroisFournisseurs ?? '',
    signatureSourcing: data.signatureSourcing ?? '',
    signatureProjet: data.signatureProjet ?? '',
  }
}

/** "12 345,67 €", "inclus", "12345.5" → nombre (0 si non numérique) */
export function parseMontantCellule(valeur: string | undefined): number {
  if (!valeur) return 0
  const nettoye = valeur
    .replace(/[€\s]/g, '')
    .replace(',', '.')
  const n = parseFloat(nettoye)
  return isNaN(n) ? 0 : n
}

/** Total (€) par fournisseur = somme des lignes des sections de type "cout" */
export function totauxBidComp(
  data: BidCompData,
  fournisseurIds: string[]
): Record<string, number> {
  const totaux: Record<string, number> = {}
  for (const fid of fournisseurIds) totaux[fid] = 0
  for (const section of data.sections) {
    if (section.type !== 'cout') continue
    for (const l of section.lignes) {
      for (const fid of fournisseurIds) {
        totaux[fid] += parseMontantCellule(l.valeurs[fid])
      }
    }
  }
  return totaux
}
