'use client'

import { pdf } from '@react-pdf/renderer'
import { RapportPDF } from '@/lib/pdf/rapport'
import type { RapportPDFData } from './RapportPDFButton'

export async function generateRapportPDF(
  projetName: string,
  data: RapportPDFData,
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <RapportPDF projetName={projetName} data={data} userLogo={userLogo} nomSociete={nomSociete} />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `rapport_${data.date || 'sans-date'}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
