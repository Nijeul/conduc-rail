'use client'

import React, { useRef, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import type { SoudureAluminothermique } from '@prisma/client'
import { FileDown } from 'lucide-react'
import { SouduresPDF } from '@/lib/pdf/soudures'
import { useProfilStore } from '@/stores/profil'

interface Props {
  projetName: string
  soudures: SoudureAluminothermique[]
}

export default function SouduresPDFDownloadInner({
  projetName,
  soudures,
}: Props) {
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)
  const guardRef = useRef(false)
  const [justClicked, setJustClicked] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (guardRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    guardRef.current = true
    setJustClicked(true)
    setTimeout(() => {
      guardRef.current = false
      setJustClicked(false)
    }, 1000)
  }

  return (
    <PDFDownloadLink
      document={<SouduresPDF projetName={projetName} soudures={soudures} userLogo={userLogo ?? undefined} nomSociete={nomSociete ?? undefined} />}
      fileName={`SA_${projetName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading || justClicked}
          onClick={handleClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#37474F', color: '#ECEFF1' }}
        >
          <FileDown className="h-4 w-4" />
          {loading ? 'Preparation...' : justClicked ? 'Generation...' : 'Export PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
