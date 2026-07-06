// Structure de la grille "Bid Comp" (matrice décisionnelle fournisseurs),
// calquée sur le fichier Excel « Matrice Décisionnelle » (feuille Bid Comp).
// Les valeurs des cellules sont indexées par l'id du FournisseurCandidat.

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
  conclusions: string
  pourquoiPasTroisFournisseurs: string
  signatureSourcing: string
  signatureProjet: string
}

function ligne(id: string, libelle: string): LigneBidComp {
  return { id, libelle, besoin: '', valeurs: {} }
}

/** Gabarit par défaut, fidèle à la feuille Excel « Bid Comp » */
export function bidCompParDefaut(): BidCompData {
  return {
    sections: [
      {
        id: 'fournisseur',
        titre: 'Fournisseur',
        type: 'texte',
        lignes: [
          ligne('offre-ref', 'Offre : référence / date'),
          ligne('offre-validite', "Validité de l'offre"),
          ligne('pays-fab', 'Pays de fabrication'),
          ligne('pct-low-cost', '% fabriqué en pays à bas coût'),
        ],
      },
      {
        id: 'financier',
        titre: 'Conditions financières',
        type: 'texte',
        lignes: [
          ligne('etat-financier', 'État financier du fournisseur'),
          ligne('monnaie', "Monnaie de l'offre"),
          ligne('incoterm', 'Incoterm (2020)'),
          ligne('paiement', 'Conditions de paiement'),
          ligne('cautions', 'Cautions'),
          ligne('duree-contrat', 'Durée du contrat'),
          ligne('revision', 'Formule de révision'),
        ],
      },
      {
        id: 'achats-responsables',
        titre: 'Achats responsables',
        type: 'texte',
        lignes: [
          ligne('iso-9001', 'ISO 9001'),
          ligne('iso-14001', 'ISO 14001'),
          ligne('iso-45001', 'ISO 45001'),
          ligne('fin-de-vie', 'Fin de vie du produit / recyclage'),
          ligne('anti-corruption', 'Charte anti-corruption'),
          ligne('ethique', "Charte d'éthique"),
          ligne('dependance', 'Dépendance ETF du fournisseur'),
          ligne('capacite', 'Capacité de production'),
          ligne('rex-qualite', 'REX Qualité'),
          ligne('rex-delais', 'REX Délais'),
        ],
      },
      {
        id: 'technique',
        titre: 'Évaluation technique',
        type: 'texte',
        lignes: [
          ligne('tolerance', 'Tolérance +/- %'),
          ligne('rails-courts', '% rails courts'),
          ligne('normes', 'Conformité aux normes et agréments'),
        ],
      },
      {
        id: 'jalons',
        titre: 'Jalons',
        type: 'texte',
        lignes: [
          ligne('design-acceptance', 'Acceptation du design'),
          ligne('fai', 'FAI — Inspection premier article'),
          ligne('fat', 'FAT — Réception en usine'),
          ligne('sat', 'SAT — Réception sur site'),
          ligne('lead-time', 'Délai de production'),
          ligne('premier-besoin', 'Date du premier besoin'),
        ],
      },
      {
        id: 'couts-fixes',
        titre: 'Coûts fixes (non récurrents)',
        type: 'cout',
        lignes: [ligne('design', 'Design'), ligne('inspections', 'Inspections')],
      },
      {
        id: 'couts-variables',
        titre: 'Coûts variables (récurrents)',
        type: 'cout',
        lignes: [ligne('prestations', 'Prestations selon cahier des charges ETF')],
      },
      {
        id: 'options',
        titre: 'Options',
        type: 'cout',
        lignes: [ligne('option-1', 'Option 1')],
      },
    ],
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
