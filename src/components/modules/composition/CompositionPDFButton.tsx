'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

interface Vehicule {
  id: string
  type: string
  designation: string
  nombre: number
  capEssieuxFreines: number
  nbEssieux: number
  poidsEntrant: number
  poidsSortant: number
  longueur: number
  capTraction: number
  commentaires: string
}

interface Summary {
  capEssieux: number
  nbEssieux: number
  capTraction: number
  poidsEntrant: number
  poidsSortant: number
  longueur: number
  freinageOk: boolean
  tractionOk: boolean
}

export interface CompositionPDFData {
  titre: string
  date: string
  sens: string
  vehicules: Vehicule[]
  summary: Summary
}

interface CompositionPDFButtonProps {
  projetName: string
  getData: () => CompositionPDFData
}

export function CompositionPDFButton({ projetName, getData }: CompositionPDFButtonProps) {
  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  function handleClick() {
    const data = getData()
    exportAvecGuard(async () => {
      try {
        const { generateCompositionPDF } = await import('./CompositionPDFDownload')
        await generateCompositionPDF(projetName, data, userLogo ?? undefined, nomSociete ?? undefined)
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
      className="bg-[#37474F] hover:bg-[#455A64] text-[#ECEFF1]"
    >
      <FileText className="h-4 w-4 mr-1" />
      {isExporting ? 'Generation...' : 'Export PDF'}
    </Button>
  )
}
