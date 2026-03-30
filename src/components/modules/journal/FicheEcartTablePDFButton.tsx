'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { FicheEcartTablePDF } from '@/lib/pdf/fiche-ecart'

interface LigneData {
  etude: string
  prevuDCE: string
  phaseTransitoire: string
  exe: string
  impacts: string
  delaisImpactes: string
  coutImpactes: string
  chapitre: string
  estChapitre: boolean
}

interface Props {
  lignes: LigneData[]
  projetName: string
}

export function FicheEcartTablePDFButton({ lignes, projetName }: Props) {
  const [loading, setLoading] = useState(false)

  const handleExport = useCallback(async () => {
    setLoading(true)
    try {
      const blob = await pdf(
        <FicheEcartTablePDF projetName={projetName} lignes={lignes} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fiche-ecart_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setLoading(false)
    }
  }, [lignes, projetName])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      style={{ backgroundColor: '#37474F', color: 'white' }}
      className="hover:opacity-90"
    >
      <Download className="h-3.5 w-3.5 mr-1.5" />
      {loading ? 'Export en cours...' : 'Export PDF'}
    </Button>
  )
}
