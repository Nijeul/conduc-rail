import { create } from 'zustand'

interface ProfilStore {
  logoSociete: string | null
  nomSociete: string | null
  setLogo: (logo: string | null) => void
  setNomSociete: (nom: string | null) => void
}

export const useProfilStore = create<ProfilStore>((set) => ({
  logoSociete: null,
  nomSociete: null,
  setLogo: (logo) => set({ logoSociete: logo }),
  setNomSociete: (nom) => set({ nomSociete: nom }),
}))
