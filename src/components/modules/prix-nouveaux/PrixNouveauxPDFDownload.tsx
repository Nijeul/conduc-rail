'use client'

import { pdf } from '@react-pdf/renderer'
import type { PrixNouveau } from '@prisma/client'
import { PrixNouveauxPDF } from '@/lib/pdf/prix-nouveaux'

export async function genererPrixNouveauxPDF(
  projetName: string,
  prixNouveaux: PrixNouveau[],
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <PrixNouveauxPDF
      projetName={projetName}
      prixNouveaux={prixNouveaux}
      userLogo={userLogo}
      nomSociete={nomSociete}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `prix_nouveaux_${projetName.replace(/\s+/g, '_')}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
