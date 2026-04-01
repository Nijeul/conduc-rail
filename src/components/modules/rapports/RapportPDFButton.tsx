'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

interface TravailRealise {
  ligneDeId: string
  code: string
  designation: string
  unite: string
  quantiteMarche: number
  quantiteRealisee: number
}

export interface RapportPDFData {
  nomChantier: string
  titre: string
  date: string
  posteNuit: boolean
  heureDebutPrevue: string
  heureFinPrevue: string
  heureDebut: string
  heureFin: string
  heureRestituee: string
  production: string
  commentaire: string
  redacteurName: string
  dateRedaction: string
  valide: boolean
  travaux: TravailRealise[]
}

interface RapportPDFButtonProps {
  projetName: string
  getData: () => RapportPDFData
}

export function RapportPDFButton({ projetName, getData }: RapportPDFButtonProps) {
  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  function handleClick() {
    const data = getData()
    exportAvecGuard(async () => {
      try {
        const { generateRapportPDF } = await import('./RapportPDFDownload')
        await generateRapportPDF(projetName, data, userLogo ?? undefined, nomSociete ?? undefined)
      } catch (err) {
        console.error('PDF generation error:', err)
      }
    })
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isExporting}
      className="bg-[#F0F0F0] border border-[#DCDCDC] hover:bg-[#E0E0E0] text-[#000000]"
    >
      <FileText className="h-4 w-4 mr-1" />
      {isExporting ? 'Generation...' : 'Export PDF'}
    </Button>
  )
}
