'use client'

import { pdf } from '@react-pdf/renderer'
import {
  BidCompPDF,
  type BidCompPDFEntete,
  type BidCompPDFFournisseur,
} from '@/lib/pdf/matrice-bidcomp'
import type { BidCompData } from '@/lib/matrice-bidcomp'

export async function genererBidCompPDF(
  projetName: string,
  titre: string,
  entete: BidCompPDFEntete,
  data: BidCompData,
  fournisseurs: BidCompPDFFournisseur[],
  totaux: Record<string, number>,
  userLogo?: string,
  nomSociete?: string
) {
  const blob = await pdf(
    <BidCompPDF
      projetName={projetName}
      titre={titre}
      entete={entete}
      data={data}
      fournisseurs={fournisseurs}
      totaux={totaux}
      userLogo={userLogo}
      nomSociete={nomSociete}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `matrice_decisionnelle_${titre.replace(/\s+/g, '_')}.pdf`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}
