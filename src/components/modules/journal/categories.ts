export const CAT = {
  contrat:          { bg: "#FCE4EC", border: "#C2185B", text: "#880E4F", point: "#E91E63", label: "Contrat" },
  groupement:       { bg: "#E8EAF6", border: "#3949AB", text: "#1A237E", point: "#3F51B5", label: "Groupement" },
  alerte:           { bg: "#FFEBEE", border: "#C62828", text: "#B71C1C", point: "#F44336", label: "Alerte" },
  ebgc:             { bg: "#E8F5E9", border: "#2E7D32", text: "#1B5E20", point: "#4CAF50", label: "EBGC" },
  sos_terrain:      { bg: "#FFF9C4", border: "#F9A825", text: "#F57F17", point: "#FFC107", label: "SOS Terrain" },
  etude_diffusion:  { bg: "#E1F5FE", border: "#0277BD", text: "#01579B", point: "#03A9F4", label: "Etude diffusion" },
  visa_etude:       { bg: "#F3E5F5", border: "#6A1B9A", text: "#4A148C", point: "#9C27B0", label: "VISA Etude" },
  suivi_impact:     { bg: "#E0F7FA", border: "#00695C", text: "#004D40", point: "#009688", label: "Suivi/Impact etude" },
  autre:            { bg: "#ECEFF1", border: "#546E7A", text: "#37474F", point: "#607D8B", label: "Autre" },
} as const

export type CategorieKey = keyof typeof CAT
