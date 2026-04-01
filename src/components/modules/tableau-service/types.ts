export const TYPES_LIGNES = [
  { type: "Conducteur de travaux",        bg: "#004489", fg: "#FFFFFF" },
  { type: "Conducteur de travaux princ.", bg: "#0D1B6B", fg: "#FFFFFF" },
  { type: "Responsable chantier / RCE",  bg: "#E20025", fg: "#FFFFFF" },
  { type: "Chef d'\u00e9quipe",               bg: "#E65100", fg: "#FFFFFF" },
  { type: "Responsable qualit\u00e9",         bg: "#E20025", fg: "#000000" },
  { type: "Contr\u00f4leur qualit\u00e9",          bg: "#00695C", fg: "#FFFFFF" },
  { type: "Poseur",                       bg: "#FFFFFF", fg: "#000000" },
  { type: "Soudeur",                      bg: "#01579B", fg: "#FFFFFF" },
  { type: "Aide Soudeur",               bg: "#B3E5FC", fg: "#000000" },
  { type: "Engin / Mat\u00e9riel",           bg: "#E8F5E9", fg: "#1B5E20" },
  { type: "Chef de machine BML",         bg: "#FCE4EC", fg: "#880E4F" },
  { type: "\u00c9quipe BML",                  bg: "#FCE4EC", fg: "#880E4F" },
] as const

export type TypeLigne = typeof TYPES_LIGNES[number]

export interface ColonneTS {
  id: string
  nom: string
  couleur: string
}

export interface LigneTS {
  id: string
  libelle: string
  type: string
  bg: string
  fg: string
}

export type CellulesTS = Record<string, CelluleTS>

export interface CelluleTS {
  texte: string
  personnelId?: string
  personnelNom?: string
  personnelTelephone?: string
}

export interface PersonnelInfo {
  id: string
  prenom: string
  nom: string
  poste: string
  telephone: string | null
  entreprise: string | null
}

export type PersonnelMap = Record<string, PersonnelInfo>

export interface TableauServiceData {
  id: string
  projetId: string
  titre: string
  entreprise: string | null
  semaine: number
  annee: number
  colonnes: ColonneTS[]
  lignes: LigneTS[]
  cellules: CellulesTS
  createdAt: Date
  updatedAt: Date
}

export const COULEURS_COLONNES = [
  "#004489", "#003370", "#0D1B6B",
  "#004489", "#003370", "#1B5E20",
  "#E65100", "#E20025", "#4A148C",
  "#00695C",
] as const

export const DEFAULT_COL_COULEUR = "#004489"
