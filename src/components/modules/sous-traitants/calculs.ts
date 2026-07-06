import type { SousTraitantComplet } from '@/actions/sous-traitants'

export function montantAvenants(st: SousTraitantComplet): number {
  return st.avenants.reduce((sum, a) => sum + a.montant, 0)
}

export function nouveauMontantMarche(st: SousTraitantComplet): number {
  return st.montantMarche + montantAvenants(st)
}

export function cumulFacture(st: SousTraitantComplet): number {
  return st.facturations.reduce((sum, f) => sum + f.montant, 0)
}

export function avancementPct(st: SousTraitantComplet): number {
  const nouveau = nouveauMontantMarche(st)
  return nouveau > 0 ? (cumulFacture(st) / nouveau) * 100 : 0
}

export function resteAFacturer(st: SousTraitantComplet): number {
  return nouveauMontantMarche(st) - cumulFacture(st)
}

/** Liste triée des mois (annee, mois) présents dans les facturations de tous les ST */
export function moisPresents(
  sousTraitants: SousTraitantComplet[]
): Array<{ annee: number; mois: number }> {
  const set = new Set<string>()
  for (const st of sousTraitants) {
    for (const f of st.facturations) {
      set.add(`${f.annee}-${f.mois}`)
    }
  }
  return Array.from(set)
    .map((k) => {
      const [annee, mois] = k.split('-').map(Number)
      return { annee, mois }
    })
    .sort((a, b) => a.annee - b.annee || a.mois - b.mois)
}
