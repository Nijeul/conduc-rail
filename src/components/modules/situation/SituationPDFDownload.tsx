'use client'

import { pdf } from '@react-pdf/renderer'
import { SituationPDF } from '@/lib/pdf/situation'
import type { SituationResult } from '@/actions/situation'

export async function generateSituationPDF(
  projetName: string,
  data: SituationResult,
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <SituationPDF projetName={projetName} data={data} userLogo={userLogo} nomSociete={nomSociete} />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `situation_${data.dateDebut}_${data.dateFin}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
