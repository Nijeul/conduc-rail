// Column definitions for the SA table with double-header grouping

export interface ColumnDef {
  key: string
  label: string
  width: number
  type: 'text' | 'date' | 'select'
  options?: string[]
}

export interface ColumnGroup {
  label: string
  color: string
  textColor: string
  columns: ColumnDef[]
}

export const COLUMN_GROUPS: ColumnGroup[] = [
  {
    label: 'LOCALISATION',
    color: '#1565C0',
    textColor: '#FFFFFF',
    columns: [
      { key: 'ordre', label: 'N\u00B0', width: 40, type: 'text' },
      { key: 'zoneTravaux', label: 'Zone Travaux', width: 100, type: 'text' },
      { key: 'date', label: 'DATE', width: 90, type: 'date' },
      { key: 'poincon', label: 'Poin\u00E7on', width: 70, type: 'text' },
      { key: 'pk', label: 'PK', width: 70, type: 'text' },
      { key: 'voie', label: 'VOIE', width: 60, type: 'text' },
      { key: 'fileGD', label: 'FILE', width: 50, type: 'select', options: ['', 'G', 'D'] },
      { key: 'lacune', label: 'LACUNE', width: 65, type: 'text' },
    ],
  },
  {
    label: 'TYPE SA',
    color: '#4527A0',
    textColor: '#FFFFFF',
    columns: [
      { key: 'profilRail', label: 'PROFIL RAIL', width: 85, type: 'text' },
      { key: 'nuanceAcier', label: "NUANCE D'ACIER", width: 100, type: 'text' },
      { key: 'e1', label: 'e1', width: 45, type: 'text' },
      { key: 'e2', label: 'e2', width: 45, type: 'text' },
    ],
  },
  {
    label: 'PROFIL',
    color: '#1B5E20',
    textColor: '#FFFFFF',
    columns: [
      { key: 'meulageProfil', label: 'Meulage profil', width: 90, type: 'text' },
      { key: 'creuxZone', label: 'Creux zone', width: 80, type: 'text' },
    ],
  },
  {
    label: 'TRACE',
    color: '#BF360C',
    textColor: '#FFFFFF',
    columns: [
      { key: 'tracePointu', label: 'Pointu <1mm', width: 80, type: 'text' },
      { key: 'traceCreux', label: 'Creux <0,5mm', width: 85, type: 'text' },
      { key: 'traceMeulage', label: 'Meulage 300mm', width: 90, type: 'text' },
      { key: 'observations', label: 'OBSERVATIONS', width: 120, type: 'text' },
      {
        key: 'reception',
        label: 'R\u00E9ception',
        width: 75,
        type: 'select',
        options: ['', 'OK', 'HS', 'Dir', 'Dev'],
      },
      { key: 'raisonHS', label: 'RAISON HS', width: 100, type: 'text' },
    ],
  },
]

export const ALL_COLUMNS = COLUMN_GROUPS.flatMap((g) => g.columns)
export const TOTAL_WIDTH = ALL_COLUMNS.reduce((s, c) => s + c.width, 0)

export const RECEPTION_COLORS: Record<string, string> = {
  OK: '#E8F5E9',
  HS: '#FFEBEE',
  Dir: '#E3F2FD',
  Dev: '#FFF3E0',
}

export const ROW_COLORS: Record<string, string> = {
  yellow: '#FFFDE7',
  red: '#FFEBEE',
}
