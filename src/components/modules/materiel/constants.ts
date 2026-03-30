export const TYPES_MATERIEL = [
  { value: "Loco",          label: "Loco",          couleur: "#F9A825" },
  { value: "Ballastiere",   label: "Ballastiere",   couleur: "#FF8F00" },
  { value: "Bigrue",        label: "Bigrue",        couleur: "#CE93D8" },
  { value: "BML",           label: "BML",           couleur: "#F48FB1" },
  { value: "Regaleuse",     label: "Regaleuse",     couleur: "#CCFF00" },
  { value: "Stabilisateur", label: "Stabilisateur", couleur: "#4FC3F7" },
  { value: "Wagon",         label: "Wagon",         couleur: "#1565C0" },
  { value: "WagonLRS",      label: "Wagon LRS",     couleur: "#FFA726" },
] as const

export type TypeMateriel = typeof TYPES_MATERIEL[number]['value']

export const COULEURS_TYPE_MATERIEL: Record<string, string> = {
  Loco: "#F9A825",
  Ballastiere: "#FF8F00",
  Bigrue: "#CE93D8",
  BML: "#F48FB1",
  Regaleuse: "#CCFF00",
  Stabilisateur: "#4FC3F7",
  Wagon: "#1565C0",
  WagonLRS: "#FFA726",
}
