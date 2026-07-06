import type { PrixNouveau } from '@prisma/client'

export const STATUT_LABELS: Record<string, string> = {
  a_venir: 'À venir',
  en_cours: 'En cours',
  accepte: 'Accepté',
  refuse: 'Refusé',
}

// Couleurs palette VINCI (badges sémantiques)
export const STATUT_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  a_venir: { backgroundColor: '#E5F1F9', color: '#0041B7' },
  en_cours: { backgroundColor: '#FFF7D1', color: '#DD9412' },
  accepte: { backgroundColor: '#E8EFDA', color: '#5E8019' },
  refuse: { backgroundColor: '#FDEAED', color: '#E20025' },
}

export function potentielCouleurs(pct: number): { bg: string; text: string } {
  if (pct >= 75) return { bg: '#E8EFDA', text: '#5E8019' }
  if (pct >= 50) return { bg: '#FFF7D1', text: '#DD9412' }
  if (pct >= 25) return { bg: '#F9E9D9', text: '#B24E25' }
  return { bg: '#FDEAED', text: '#E20025' }
}

/** Badge de la colonne « Potentiel d'acceptation » : figé si accepté/refusé */
export function potentielStyle(pn: PrixNouveau): {
  label: string
  bg: string
  text: string
} {
  if (pn.statut === 'accepte') return { label: 'Accepté', bg: '#E8EFDA', text: '#5E8019' }
  if (pn.statut === 'refuse') return { label: 'Refusé', bg: '#FDEAED', text: '#E20025' }
  const c = potentielCouleurs(pn.potentielAcceptation)
  return { label: `${pn.potentielAcceptation} %`, ...c }
}

/**
 * Montant pondéré par le risque :
 * accepté → montant accepté ; refusé → 0 ;
 * sinon montant présenté × potentiel d'acceptation
 */
export function montantPondere(pn: PrixNouveau): number {
  if (pn.statut === 'accepte') return pn.montantAccepte ?? pn.montantPresente
  if (pn.statut === 'refuse') return 0
  return pn.montantPresente * (pn.potentielAcceptation / 100)
}
