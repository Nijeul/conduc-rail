'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

// ──────────────────────────────────────────────
// Types (same as MatriceExcelExport)
// ──────────────────────────────────────────────

interface Notation {
  critereId: string
  valeurTexte: string | null
  note: number | null
  valeurBool: boolean | null
  commentaire: string | null
  estNonConformiteMajeure: boolean
  estNonConformiteNegociable: boolean
}

interface Fournisseur {
  id: string
  nom: string
  rang: number
  refOffre: string | null
  dateOffre: string | Date | null
  paysFabrication: string | null
  incoterm: string | null
  decision: string
  couleurDecision: string
  notations: Notation[]
}

interface Critere {
  id: string
  famille: string
  libelle: string
  coefficient: number
  ordreAffichage: number
  type: string
  notations: Notation[]
}

interface MatriceData {
  id: string
  titre: string
  acheteur: string | null
  site: string | null
  familleAchats: string | null
  budgetTheorique: number | null
  devise: string
  seuilGo: number
  fournisseurs: Fournisseur[]
  criteres: Critere[]
}

interface MatricePDFExportProps {
  matrice: MatriceData
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function MatricePDFExport({ matrice }: MatricePDFExportProps) {
  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  function handleClick() {
    exportAvecGuard(async () => {
      try {
        const { generateMatricePDF } = await import('@/lib/pdf/matrice')
        await generateMatricePDF(matrice, userLogo ?? undefined, nomSociete ?? undefined)
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
