export type SourceARF = 'rapport' | 'manuelle'

export interface LigneARF {
  id: string
  source: SourceARF
  rapportId?: string
  date: Date
  posteNuit: boolean
  heureDebutPrevue: string | null
  heureFinPrevue: string | null
  heureDebut: string | null
  heureFin: string | null
  heureRestituee: string | null
  commentaire?: string | null
  dureeReelleMin?: number | null
  dureePrevueMin?: number | null
  pourcentage?: number | null
}
