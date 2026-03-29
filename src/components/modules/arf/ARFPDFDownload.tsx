'use client'

import { pdf } from '@react-pdf/renderer'
import { ARFPDF } from '@/lib/pdf/arf'
import type { ARFRow } from '@/actions/arf'

export async function generateARFPDF(
  projetName: string,
  rows: ARFRow[],
  totalMinutes: number,
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <ARFPDF projetName={projetName} rows={rows} totalMinutes={totalMinutes} userLogo={userLogo} nomSociete={nomSociete} />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `arf_${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
