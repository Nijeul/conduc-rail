'use client'

import { useEffect, useState } from 'react'
import type { LigneDE } from '@prisma/client'
import { useProfilStore } from '@/stores/profil'

interface DEPdfExportProps {
  lignes: LigneDE[]
  projetName: string
  totalHT: number
  onClose: () => void
}

export function DEPdfExport({ lignes, projetName, totalHT, onClose }: DEPdfExportProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(true)
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const fileName = `DE_${projetName.replace(/[^a-zA-Z0-9]/g, '_')}_${date.replace(/\//g, '-')}.pdf`

  useEffect(() => {
    let cancelled = false

    async function generatePdf() {
      try {
        const { pdf } = await import('@react-pdf/renderer')
        const { DetailEstimatifPDF } = await import('@/lib/pdf/detail-estimatif')
        const { createElement } = await import('react')

        const doc = createElement(DetailEstimatifPDF, { lignes, projetName, totalHT, userLogo: userLogo ?? undefined, nomSociete: nomSociete ?? undefined })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = await pdf(doc as any).toBlob()

        if (!cancelled) {
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
          setGenerating(false)
        }
      } catch (err) {
        console.error('PDF generation error:', err)
        if (!cancelled) {
          setGenerating(false)
        }
      }
    }

    generatePdf()

    return () => {
      cancelled = true
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = pdfUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(pdfUrl)
    }, 100)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#263238' }}>
          Export PDF
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Detail Estimatif - {projetName}
          <br />
          {lignes.length} ligne{lignes.length > 1 ? 's' : ''} - Total HT : {totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} &euro;
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>

          <button
            onClick={handleDownload}
            disabled={generating || !pdfUrl}
            className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#1565C0' }}
          >
            {generating ? 'Generation...' : 'Telecharger PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
