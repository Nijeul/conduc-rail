'use client'

import { pdf } from '@react-pdf/renderer'
import { CompositionPDF } from '@/lib/pdf/composition'
import type { CompositionPDFData } from './CompositionPDFButton'

export async function generateCompositionPDF(
  projetName: string,
  data: CompositionPDFData,
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <CompositionPDF projetName={projetName} data={data} userLogo={userLogo} nomSociete={nomSociete} />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `composition_${data.date || 'sans-date'}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
