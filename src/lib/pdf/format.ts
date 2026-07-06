// Formatage français pour @react-pdf/renderer.
// toLocaleString('fr-FR') insère des espaces insécables (U+00A0) et des espaces
// fines insécables (U+202F) que la police Helvetica des PDF ne sait pas rendre
// (glyphe « / » ou vide) : on les remplace par des espaces normales.

const ESPACES_INSECABLES = /[\u00A0\u202F]/g

export function pdfNombreFR(n: number, decimales = 2): string {
  return n
    .toLocaleString('fr-FR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    })
    .replace(ESPACES_INSECABLES, ' ')
}

export function pdfMontantFR(n: number): string {
  return n
    .toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(ESPACES_INSECABLES, ' ')
}

export function pdfPctFR(n: number, decimales = 1): string {
  return `${pdfNombreFR(n, decimales)} %`
}
