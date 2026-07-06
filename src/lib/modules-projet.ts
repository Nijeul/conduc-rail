// Source de vérité des modules d'un projet : navigation + sélecteur de l'onglet Infos.
// `key` est la valeur stockée dans Projet.modulesMasques (liste des modules cachés).

export interface ModuleProjet {
  key: string
  label: string
  href: string
  toggleable: boolean
}

export interface OngletProjet {
  id: string
  label: string
  modules: ModuleProjet[]
}

export const ONGLETS_PROJET: OngletProjet[] = [
  {
    id: 'contractuelle',
    label: 'Gestion Contractuelle',
    modules: [
      { key: 'infos', label: 'Infos', href: 'infos', toggleable: false },
      { key: 'courriers', label: 'Courriers', href: 'courriers', toggleable: true },
      { key: 'sous-traitants', label: 'Sous-traitants', href: 'sous-traitants', toggleable: true },
      { key: 'journal', label: 'Journal', href: 'suivi/journal', toggleable: true },
    ],
  },
  {
    id: 'financiere',
    label: 'Gestion Financière',
    modules: [
      { key: 'detail-estimatif', label: 'Détail Estimatif', href: 'detail-estimatif', toggleable: true },
      { key: 'situations', label: 'Situations', href: 'suivi/situations', toggleable: true },
      { key: 'prix-nouveaux', label: 'Prix Nouveaux', href: 'suivi/prix-nouveaux', toggleable: true },
      { key: 'suivi-st', label: 'Suivi ST', href: 'suivi/sous-traitants', toggleable: true },
      { key: 'suivi-arf', label: 'Suivi ARF', href: 'suivi/arf', toggleable: true },
      { key: 'matrice', label: 'Matrice', href: 'matrice', toggleable: true },
    ],
  },
  {
    id: 'chantier',
    label: 'Gestion de Chantier',
    modules: [
      { key: 'tableau-service', label: 'Tableau de Service', href: 'tableau-service', toggleable: true },
      { key: 'rapports', label: 'Rapports', href: 'suivi/rapports', toggleable: true },
      { key: 'composition', label: 'Composition TTx', href: 'composition', toggleable: true },
      { key: 'sa', label: 'SA', href: 'suivi/sa', toggleable: true },
      { key: 'recapitulatif', label: 'Récapitulatif', href: 'suivi/recapitulatif', toggleable: true },
      { key: 'planning', label: 'Planning', href: 'planning', toggleable: true },
    ],
  },
]

/** Onglets avec uniquement les modules visibles ; les onglets vides sont retirés */
export function ongletsVisibles(modulesMasques: string[]): OngletProjet[] {
  return ONGLETS_PROJET.map((o) => ({
    ...o,
    modules: o.modules.filter(
      (m) => !m.toggleable || !modulesMasques.includes(m.key)
    ),
  })).filter((o) => o.modules.length > 0)
}
