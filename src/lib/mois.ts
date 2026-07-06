// Libellés français des mois (1 = Janvier)
export const MOIS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
] as const

export function labelMois(mois: number, annee: number): string {
  return `${MOIS_FR[mois - 1] ?? '?'} ${annee}`
}

export function labelMoisCourt(mois: number, annee: number): string {
  const court = (MOIS_FR[mois - 1] ?? '?').slice(0, 4)
  return `${court}. ${String(annee).slice(2)}`
}
