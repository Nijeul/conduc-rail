export const CAT: Record<string, { bg: string; border: string; text: string; point: string; label: string }> = {
  contrat:         { bg: '#E8EFDA', border: '#7AA536', text: '#5E8019', point: '#7AA536', label: 'Contrat' },
  groupement:      { bg: '#E5F1F9', border: '#307BFF', text: '#0041B7', point: '#307BFF', label: 'Groupement' },
  alerte:          { bg: '#F9E9D9', border: '#C26A32', text: '#B24E25', point: '#C26A32', label: 'Alerte' },
  ebgc:            { bg: '#FCE8FF', border: '#A152E5', text: '#7D18D6', point: '#A152E5', label: 'EBGC' },
  sos_terrain:     { bg: '#FFF7D1', border: '#F2AB1B', text: '#DD9412', point: '#F2AB1B', label: 'SOS Terrain' },
  etude_diffusion: { bg: '#C9E39E', border: '#7AA536', text: '#5E8019', point: '#A9D461', label: 'Étude diffusion' },
  visa_etude:      { bg: '#FFE8E8', border: '#F25799', text: '#C4007D', point: '#F25799', label: 'VISA Étude' },
  suivi_impact:    { bg: '#B2D4FC', border: '#80B4FF', text: '#0041B7', point: '#307BFF', label: 'Suivi/Impact' },
  courrier:        { bg: '#F0F0F0', border: '#B5ABA1', text: '#5A5A5A', point: '#B5ABA1', label: 'Courrier' },
  autre:           { bg: '#F0F0F0', border: '#DCDCDC', text: '#5A5A5A', point: '#A0A0A0', label: 'Autre' },
}

export type CategorieKey = keyof typeof CAT
