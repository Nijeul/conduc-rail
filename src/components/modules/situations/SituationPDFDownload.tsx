'use client'

import { pdf } from '@react-pdf/renderer'
import {
  SituationPDF,
  type SituationPDFMeta,
  type SituationPDFData,
} from '@/lib/pdf/situation'

export async function genererSituationPDF(
  projetName: string,
  meta: SituationPDFMeta,
  data: SituationPDFData,
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <SituationPDF
      projetName={projetName}
      meta={meta}
      data={data}
      userLogo={userLogo}
      nomSociete={nomSociete}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `situation_${meta.numero}_${meta.annee}-${String(meta.mois).padStart(2, '0')}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
