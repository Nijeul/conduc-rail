'use client'

import { pdf } from '@react-pdf/renderer'
import { SousTraitantsPDF } from '@/lib/pdf/sous-traitants'
import type { SousTraitantsData } from '@/actions/sous-traitants'

export async function genererSousTraitantsPDF(
  projetName: string,
  data: SousTraitantsData,
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <SousTraitantsPDF
      projetName={projetName}
      data={data}
      userLogo={userLogo}
      nomSociete={nomSociete}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `suivi_sous_traitants_${projetName.replace(/\s+/g, '_')}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
