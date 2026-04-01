'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import type { SoudureAluminothermique } from '@prisma/client'
import { FileDown } from 'lucide-react'

function PDFButtonPlaceholder() {
  return (
    <button
      disabled
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium opacity-50"
      style={{ backgroundColor: '#F0F0F0', color: '#000000', border: '1px solid #DCDCDC' }}
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </button>
  )
}

// Lazy-loaded inner component that imports @react-pdf/renderer + SouduresPDF
const SouduresPDFDownloadInner = dynamic(
  () => import('./SouduresPDFDownloadInner'),
  {
    ssr: false,
    loading: () => <PDFButtonPlaceholder />,
  }
)

interface SouduresPDFDownloadProps {
  projetName: string
  soudures: SoudureAluminothermique[]
}

export function SouduresPDFDownload({
  projetName,
  soudures,
}: SouduresPDFDownloadProps) {
  return (
    <SouduresPDFDownloadInner projetName={projetName} soudures={soudures} />
  )
}
