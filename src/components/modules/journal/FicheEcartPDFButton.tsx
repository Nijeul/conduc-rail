'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { FicheEcartPDF } from '@/lib/pdf/journal-fiche-ecart'
import { useExportPDF } from '@/hooks/useExportPDF'

interface FichierRow {
  id: string
  nom: string
  type: string
  taille: number
}

interface EvenementRow {
  id: string
  date: Date
  titre: string
  description: string | null
  categorie: string
  fichiers: FichierRow[]
}

interface Props {
  evenements: EvenementRow[]
  projetName: string
}

export function FicheEcartPDFButton({ evenements, projetName }: Props) {
  const { exportAvecGuard, isExporting } = useExportPDF()

  const handleExport = () => {
    exportAvecGuard(async () => {
      try {
        const data = evenements.map((ev) => ({
          date: new Date(ev.date).toISOString(),
          titre: ev.titre,
          description: ev.description || undefined,
          categorie: ev.categorie,
          fichiersCount: ev.fichiers.length,
        }))

        const blob = await pdf(
          <FicheEcartPDF projetName={projetName} evenements={data} />
        ).toBlob()

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `fiche-ecart_${new Date().toISOString().slice(0, 10)}.pdf`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
      } catch (err) {
        console.error('PDF generation error:', err)
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      style={{ backgroundColor: '#37474F', color: 'white' }}
      className="hover:opacity-90"
    >
      <Download className="h-3.5 w-3.5 mr-1.5" />
      {isExporting ? 'Generation...' : 'Export PDF'}
    </Button>
  )
}
