import { create } from 'zustand'
import type { ColonneTS, LigneTS, CellulesTS, TableauServiceData } from './types'
import { DEFAULT_COL_COULEUR, TYPES_LIGNES } from './types'
import { updateTableau } from '@/actions/tableau-service'

function genId() {
  return Math.random().toString(36).substring(2, 10)
}

interface TableauStore {
  // Data
  projetId: string
  tableau: TableauServiceData | null
  colonnes: ColonneTS[]
  lignes: LigneTS[]
  cellules: CellulesTS
  saving: boolean
  dirty: boolean

  // Init
  init: (projetId: string, tableau: TableauServiceData) => void

  // Colonnes
  addColonne: (nom: string) => void
  renameColonne: (id: string, nom: string) => void
  changeColonneCouleur: (id: string, couleur: string) => void
  removeColonne: (id: string) => void

  // Lignes
  addLigne: (libelle: string, type: string) => void
  renameLigne: (id: string, libelle: string) => void
  changeLigneType: (id: string, type: string) => void
  removeLigne: (id: string) => void
  reorderLignes: (lignes: LigneTS[]) => void

  // Cellules
  updateCellule: (ligneId: string, colId: string, texte: string, personnelId?: string, personnelNom?: string, personnelTelephone?: string) => void
  clearCellule: (ligneId: string, colId: string) => void

  // Save
  scheduleSave: () => void
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null

export const useTableauStore = create<TableauStore>((set, get) => ({
  projetId: '',
  tableau: null,
  colonnes: [],
  lignes: [],
  cellules: {},
  saving: false,
  dirty: false,

  init: (projetId, tableau) => {
    if (saveTimeout) clearTimeout(saveTimeout)
    set({
      projetId,
      tableau,
      colonnes: (tableau.colonnes as ColonneTS[]) || [],
      lignes: (tableau.lignes as LigneTS[]) || [],
      cellules: (tableau.cellules as CellulesTS) || {},
      saving: false,
      dirty: false,
    })
  },

  // --- Colonnes ---
  addColonne: (nom) => {
    const col: ColonneTS = { id: genId(), nom, couleur: DEFAULT_COL_COULEUR }
    set((s) => ({ colonnes: [...s.colonnes, col], dirty: true }))
    get().scheduleSave()
  },

  renameColonne: (id, nom) => {
    set((s) => ({
      colonnes: s.colonnes.map((c) => (c.id === id ? { ...c, nom } : c)),
      dirty: true,
    }))
    get().scheduleSave()
  },

  changeColonneCouleur: (id, couleur) => {
    set((s) => ({
      colonnes: s.colonnes.map((c) => (c.id === id ? { ...c, couleur } : c)),
      dirty: true,
    }))
    get().scheduleSave()
  },

  removeColonne: (id) => {
    set((s) => {
      const newCellules = { ...s.cellules }
      for (const key of Object.keys(newCellules)) {
        if (key.endsWith(`|${id}`)) delete newCellules[key]
      }
      return {
        colonnes: s.colonnes.filter((c) => c.id !== id),
        cellules: newCellules,
        dirty: true,
      }
    })
    get().scheduleSave()
  },

  // --- Lignes ---
  addLigne: (libelle, type) => {
    const tl = TYPES_LIGNES.find((t) => t.type === type)
    const ligne: LigneTS = {
      id: genId(),
      libelle,
      type,
      bg: tl?.bg || '#FFFFFF',
      fg: tl?.fg || '#000000',
    }
    set((s) => ({ lignes: [...s.lignes, ligne], dirty: true }))
    get().scheduleSave()
  },

  renameLigne: (id, libelle) => {
    set((s) => ({
      lignes: s.lignes.map((l) => (l.id === id ? { ...l, libelle } : l)),
      dirty: true,
    }))
    get().scheduleSave()
  },

  changeLigneType: (id, type) => {
    const tl = TYPES_LIGNES.find((t) => t.type === type)
    set((s) => ({
      lignes: s.lignes.map((l) =>
        l.id === id
          ? { ...l, type, bg: tl?.bg || l.bg, fg: tl?.fg || l.fg }
          : l
      ),
      dirty: true,
    }))
    get().scheduleSave()
  },

  removeLigne: (id) => {
    set((s) => {
      const newCellules = { ...s.cellules }
      for (const key of Object.keys(newCellules)) {
        if (key.startsWith(`${id}|`)) delete newCellules[key]
      }
      return {
        lignes: s.lignes.filter((l) => l.id !== id),
        cellules: newCellules,
        dirty: true,
      }
    })
    get().scheduleSave()
  },

  reorderLignes: (lignes) => {
    set({ lignes, dirty: true })
    get().scheduleSave()
  },

  // --- Cellules ---
  updateCellule: (ligneId, colId, texte, personnelId, personnelNom, personnelTelephone) => {
    const key = `${ligneId}|${colId}`
    set((s) => ({
      cellules: {
        ...s.cellules,
        [key]: { texte, personnelId, personnelNom, personnelTelephone },
      },
      dirty: true,
    }))
    get().scheduleSave()
  },

  clearCellule: (ligneId, colId) => {
    const key = `${ligneId}|${colId}`
    set((s) => {
      const newCellules = { ...s.cellules }
      delete newCellules[key]
      return { cellules: newCellules, dirty: true }
    })
    get().scheduleSave()
  },

  // --- Save with debounce ---
  scheduleSave: () => {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(async () => {
      const state = get()
      if (!state.tableau || !state.dirty) return

      set({ saving: true })
      try {
        await updateTableau(state.projetId, {
          id: state.tableau.id,
          colonnes: state.colonnes,
          lignes: state.lignes,
          cellules: state.cellules,
        })
        set({ saving: false, dirty: false })
      } catch (e) {
        console.error('Auto-save failed:', e)
        set({ saving: false })
      }
    }, 500)
  },
}))
