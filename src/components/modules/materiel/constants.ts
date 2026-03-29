export const TYPES_MATERIEL = [
  'Loco',
  'Locotracteur',
  'Wagon',
  'Draisine',
  'Bourreuse',
  'Autre',
] as const

export const COULEURS_TYPE_MATERIEL: Record<string, string> = {
  'Loco': '#FF8F00',
  'Locotracteur': '#2E7D32',
  'Wagon': '#1565C0',
  'Draisine': '#6A1B9A',
  'Bourreuse': '#795548',
  'Autre': '#546E7A',
}
