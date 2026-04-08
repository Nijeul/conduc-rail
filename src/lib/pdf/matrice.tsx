import jsPDF from 'jspdf'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Notation {
  critereId: string
  valeurTexte: string | null
  note: number | null
  valeurBool: boolean | null
  commentaire: string | null
  estNonConformiteMajeure: boolean
  estNonConformiteNegociable: boolean
}

interface Fournisseur {
  id: string
  nom: string
  rang: number
  refOffre: string | null
  dateOffre: string | Date | null
  paysFabrication: string | null
  incoterm: string | null
  decision: string
  couleurDecision: string
  notations: Notation[]
}

interface Critere {
  id: string
  famille: string
  libelle: string
  coefficient: number
  ordreAffichage: number
  type: string
  notations: Notation[]
}

export interface MatricePDFData {
  id: string
  titre: string
  acheteur: string | null
  site: string | null
  familleAchats: string | null
  budgetTheorique: number | null
  devise: string
  seuilGo: number
  fournisseurs: Fournisseur[]
  criteres: Critere[]
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const VINCI_BLEU: [number, number, number] = [0, 68, 137]
const VINCI_BLEU_DARK: [number, number, number] = [0, 51, 112]
const WHITE: [number, number, number] = [255, 255, 255]
const GREY_LIGHT: [number, number, number] = [240, 240, 240]
const GREY_BORDER: [number, number, number] = [220, 220, 220]
const TEXT_MUTED: [number, number, number] = [181, 171, 161]

const NOTE_BG: Record<number, [number, number, number]> = {
  1: [253, 234, 237], // rouge clair
  2: [255, 247, 209], // jaune
  3: [232, 239, 218], // vert clair
}

const DECISION_BG: Record<string, [number, number, number]> = {
  vert: [232, 239, 218],
  jaune: [255, 247, 209],
  rouge: [253, 234, 237],
}

const DECISION_TEXT: Record<string, string> = {
  go: 'GO',
  no_go: 'NO-GO',
  en_attente: 'EN ATTENTE',
}

const FAMILLE_LABELS: Record<string, string> = {
  general: 'GENERAL',
  qualite: 'QUALITE',
  couts: 'COUTS',
  delais: 'DELAIS',
  service: 'SERVICE',
}

const FAMILLE_ORDER = ['general', 'qualite', 'couts', 'delais', 'service']

// Page layout (landscape A4)
const PAGE_W = 297
const PAGE_H = 210
const MARGIN = 15
const CONTENT_W = PAGE_W - 2 * MARGIN

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getNotation(f: Fournisseur, critereId: string): Notation | undefined {
  return f.notations.find((n) => n.critereId === critereId)
}

function computeScore(f: Fournisseur, criteres: Critere[]): number {
  return criteres
    .filter((c) => c.type === 'note_1_3')
    .reduce((sum, c) => {
      const n = getNotation(f, c.id)
      return sum + (n?.note ?? 0) * c.coefficient
    }, 0)
}

function computeMaxScore(criteres: Critere[]): number {
  return criteres.filter((c) => c.type === 'note_1_3').reduce((s, c) => s + 3 * c.coefficient, 0)
}

function formatDateFR(d: Date): string {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function hexToRGB(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

// ──────────────────────────────────────────────
// Header / Footer helpers
// ──────────────────────────────────────────────

function drawHeader(doc: jsPDF, titre: string, logoBase64?: string) {
  // Blue band
  doc.setFillColor(...VINCI_BLEU)
  doc.rect(0, 0, PAGE_W, 18, 'F')

  // Logo or brand text
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', MARGIN, 2, 14, 14)
    } catch {
      doc.setTextColor(...WHITE)
      doc.setFontSize(10)
      doc.setFont('Helvetica', 'bold')
      doc.text('CONDUC RAIL', MARGIN, 12)
    }
  } else {
    doc.setTextColor(...WHITE)
    doc.setFontSize(10)
    doc.setFont('Helvetica', 'bold')
    doc.text('CONDUC RAIL', MARGIN, 12)
  }

  // Title right-aligned
  doc.setTextColor(...WHITE)
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'normal')
  const titleText = titre.length > 60 ? titre.slice(0, 57) + '...' : titre
  doc.text(titleText, PAGE_W - MARGIN, 12, { align: 'right' })
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setDrawColor(...GREY_BORDER)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12)
  doc.setTextColor(...TEXT_MUTED)
  doc.setFontSize(7)
  doc.setFont('Helvetica', 'normal')
  doc.text('Conduc Rail', MARGIN, PAGE_H - 7)
  doc.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 7, { align: 'right' })
}

// ──────────────────────────────────────────────
// Main Generator
// ──────────────────────────────────────────────

export async function generateMatricePDF(
  matrice: MatricePDFData,
  logoBase64?: string,
  nomSociete?: string
): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const fournisseurs = [...matrice.fournisseurs].sort((a, b) => a.rang - b.rang)
  const maxScore = computeMaxScore(matrice.criteres)

  // Compute results for ranking
  const resultats = fournisseurs
    .map((f) => {
      const score = computeScore(f, matrice.criteres)
      const pct = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0
      return {
        fournisseur: f,
        score,
        pct,
      }
    })
    .sort((a, b) => b.pct - a.pct)

  const fournisseurRetenu = resultats.find((r) => r.fournisseur.decision === 'go')

  // ──── PAGE 1: Rapport de recommandation ────
  drawHeader(doc, `MATRICE DECISIONNELLE`, logoBase64)

  let y = 26

  // Title
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('Helvetica', 'bold')
  doc.text(`MATRICE DECISIONNELLE`, MARGIN, y)
  y += 6
  doc.setFontSize(11)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(...VINCI_BLEU)
  doc.text(matrice.titre, MARGIN, y)
  y += 10

  // Info block
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  const infoLines: [string, string][] = [
    ['Acheteur', matrice.acheteur ?? '-'],
    ['Site', matrice.site ?? '-'],
    ['Famille Achats', matrice.familleAchats ?? '-'],
    ['Budget theorique', matrice.budgetTheorique != null
      ? `${matrice.budgetTheorique.toLocaleString('fr-FR')} ${matrice.devise}`
      : '-'],
    ['Seuil Go', `${matrice.seuilGo}%`],
    ['Date', formatDateFR(new Date())],
  ]

  for (const [label, value] of infoLines) {
    doc.setFont('Helvetica', 'bold')
    doc.text(`${label} :`, MARGIN, y)
    doc.setFont('Helvetica', 'normal')
    doc.text(value, MARGIN + 40, y)
    y += 5
  }

  y += 8

  // Recap table
  doc.setFontSize(10)
  doc.setFont('Helvetica', 'bold')
  doc.text('Tableau recapitulatif', MARGIN, y)
  y += 5

  const recapCols = [
    { label: 'Rang', w: 20 },
    { label: 'Fournisseur', w: 60 },
    { label: 'Score', w: 30 },
    { label: 'Score (%)', w: 30 },
    { label: 'Decision', w: 30 },
  ]

  // Header
  let x = MARGIN
  doc.setFillColor(...VINCI_BLEU)
  const recapHeaderH = 7
  for (const col of recapCols) {
    doc.rect(x, y, col.w, recapHeaderH, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(8)
    doc.setFont('Helvetica', 'bold')
    doc.text(col.label, x + col.w / 2, y + 5, { align: 'center' })
    x += col.w
  }
  y += recapHeaderH

  // Rows
  const rowH = 7
  resultats.forEach((r, idx) => {
    x = MARGIN
    const isAlt = idx % 2 === 1
    const bg = isAlt ? GREY_LIGHT : WHITE

    for (const col of recapCols) {
      // Decision column bg
      if (col.label === 'Decision') {
        const decBg = DECISION_BG[r.fournisseur.couleurDecision] ?? bg
        doc.setFillColor(...decBg)
      } else {
        doc.setFillColor(...bg)
      }
      doc.rect(x, y, col.w, rowH, 'F')

      // Border
      doc.setDrawColor(...GREY_BORDER)
      doc.setLineWidth(0.2)
      doc.rect(x, y, col.w, rowH, 'S')

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(8)
      doc.setFont('Helvetica', 'normal')

      let val = ''
      if (col.label === 'Rang') val = `${idx + 1}`
      else if (col.label === 'Fournisseur') val = r.fournisseur.nom
      else if (col.label === 'Score') val = `${r.score} / ${maxScore}`
      else if (col.label === 'Score (%)') val = `${r.pct}%`
      else if (col.label === 'Decision') {
        val = DECISION_TEXT[r.fournisseur.decision] ?? r.fournisseur.decision
        doc.setFont('Helvetica', 'bold')
      }

      doc.text(val, x + col.w / 2, y + 5, { align: 'center' })
      x += col.w
    }
    y += rowH
  })

  y += 10

  // Recommandation
  doc.setFontSize(10)
  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(...VINCI_BLEU)
  doc.text('Recommandation', MARGIN, y)
  y += 6
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(0, 0, 0)

  if (fournisseurRetenu) {
    doc.text(
      `Le fournisseur retenu est ${fournisseurRetenu.fournisseur.nom} avec un score de ${fournisseurRetenu.pct}% (${fournisseurRetenu.score}/${maxScore}).`,
      MARGIN,
      y
    )
  } else {
    doc.text('Aucun fournisseur ne remplit les conditions Go pour cette matrice.', MARGIN, y)
  }

  // ──── PAGE 2+: Bid Comp table ────
  doc.addPage('a4', 'landscape')

  // Group criteres by famille
  const criteresByFamille = new Map<string, Critere[]>()
  for (const c of matrice.criteres) {
    const list = criteresByFamille.get(c.famille) || []
    list.push(c)
    criteresByFamille.set(c.famille, list)
  }

  // Calculate column widths for bid comp
  const critLabelW = 55
  const fournColW = Math.min(40, (CONTENT_W - critLabelW) / Math.max(fournisseurs.length, 1))

  function drawBidCompHeader(doc: jsPDF, startY: number): number {
    drawHeader(doc, `BID COMP — ${matrice.titre}`, logoBase64)

    let cx = MARGIN
    const hdrH = 8
    // Critere header
    doc.setFillColor(...VINCI_BLEU)
    doc.rect(cx, startY, critLabelW, hdrH, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.setFont('Helvetica', 'bold')
    doc.text('Critere', cx + 3, startY + 5.5)
    cx += critLabelW

    // Fournisseur headers
    for (const f of fournisseurs) {
      doc.setFillColor(...VINCI_BLEU)
      doc.rect(cx, startY, fournColW, hdrH, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(6)
      doc.setFont('Helvetica', 'bold')
      const displayName = f.nom.length > 12 ? f.nom.slice(0, 11) + '.' : f.nom
      doc.text(displayName, cx + fournColW / 2, startY + 5.5, { align: 'center' })
      cx += fournColW
    }

    return startY + hdrH
  }

  y = drawBidCompHeader(doc, 24)
  const bidRowH = 6
  let rowIdx = 0

  function checkPageBreak(needed: number): void {
    if (y + needed > PAGE_H - 18) {
      doc.addPage('a4', 'landscape')
      y = drawBidCompHeader(doc, 24)
      rowIdx = 0
    }
  }

  for (const famille of FAMILLE_ORDER) {
    const criteres = criteresByFamille.get(famille)
    if (!criteres || criteres.length === 0) continue

    // Famille header
    checkPageBreak(bidRowH + bidRowH)
    doc.setFillColor(...VINCI_BLEU)
    doc.rect(MARGIN, y, critLabelW + fournColW * fournisseurs.length, bidRowH, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.setFont('Helvetica', 'bold')
    doc.text(FAMILLE_LABELS[famille] || famille.toUpperCase(), MARGIN + 3, y + 4.5)
    y += bidRowH

    for (const critere of criteres) {
      checkPageBreak(bidRowH)

      const isAlt = rowIdx % 2 === 1
      let cx = MARGIN

      // Critere label
      const rowBg = isAlt ? GREY_LIGHT : WHITE
      doc.setFillColor(...rowBg)
      doc.rect(cx, y, critLabelW, bidRowH, 'F')
      doc.setDrawColor(...GREY_BORDER)
      doc.setLineWidth(0.15)
      doc.rect(cx, y, critLabelW, bidRowH, 'S')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(6.5)
      doc.setFont('Helvetica', 'normal')
      const lbl = critere.libelle.length > 35 ? critere.libelle.slice(0, 33) + '..' : critere.libelle
      doc.text(lbl, cx + 2, y + 4.2)
      cx += critLabelW

      // Fournisseur cells
      for (const f of fournisseurs) {
        const notation = getNotation(f, critere.id)

        // Cell background
        let cellBg = rowBg
        if (notation) {
          if (notation.estNonConformiteMajeure) {
            cellBg = hexToRGB('#FDEAED')
          } else if (notation.estNonConformiteNegociable) {
            cellBg = hexToRGB('#FFF7D1')
          } else if (critere.type === 'note_1_3' && notation.note != null && NOTE_BG[notation.note]) {
            cellBg = NOTE_BG[notation.note]
          }
        }

        doc.setFillColor(...cellBg)
        doc.rect(cx, y, fournColW, bidRowH, 'F')
        doc.setDrawColor(...GREY_BORDER)
        doc.rect(cx, y, fournColW, bidRowH, 'S')

        // Cell value
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(6.5)
        doc.setFont('Helvetica', 'normal')

        let val = '-'
        if (notation) {
          if (critere.type === 'note_1_3' && notation.note != null) {
            val = String(notation.note)
          } else if (critere.type === 'booleen') {
            val = notation.valeurBool ? 'Oui' : 'Non'
          } else if (notation.valeurTexte) {
            val = notation.valeurTexte.length > 12 ? notation.valeurTexte.slice(0, 10) + '..' : notation.valeurTexte
          } else if (notation.commentaire) {
            val = notation.commentaire.length > 12 ? notation.commentaire.slice(0, 10) + '..' : notation.commentaire
          }
        }

        doc.text(val, cx + fournColW / 2, y + 4.2, { align: 'center' })
        cx += fournColW
      }

      y += bidRowH
      rowIdx++
    }
  }

  // Score total row
  checkPageBreak(bidRowH * 2)
  let cx = MARGIN
  doc.setFillColor(...VINCI_BLEU_DARK)
  doc.rect(cx, y, critLabelW, bidRowH, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(7)
  doc.setFont('Helvetica', 'bold')
  doc.text('SCORE TOTAL', cx + 3, y + 4.5)
  cx += critLabelW

  for (const f of fournisseurs) {
    doc.setFillColor(...VINCI_BLEU_DARK)
    doc.rect(cx, y, fournColW, bidRowH, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(7)
    doc.setFont('Helvetica', 'bold')
    const score = computeScore(f, matrice.criteres)
    doc.text(`${score}/${maxScore}`, cx + fournColW / 2, y + 4.5, { align: 'center' })
    cx += fournColW
  }
  y += bidRowH

  // Decision row
  cx = MARGIN
  doc.setFillColor(...GREY_LIGHT)
  doc.rect(cx, y, critLabelW, bidRowH, 'F')
  doc.setDrawColor(...GREY_BORDER)
  doc.rect(cx, y, critLabelW, bidRowH, 'S')
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(7)
  doc.setFont('Helvetica', 'bold')
  doc.text('DECISION', cx + 3, y + 4.5)
  cx += critLabelW

  for (const f of fournisseurs) {
    const decBg = DECISION_BG[f.couleurDecision] ?? GREY_LIGHT
    doc.setFillColor(...decBg)
    doc.rect(cx, y, fournColW, bidRowH, 'F')
    doc.setDrawColor(...GREY_BORDER)
    doc.rect(cx, y, fournColW, bidRowH, 'S')
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(6.5)
    doc.setFont('Helvetica', 'bold')
    doc.text(
      DECISION_TEXT[f.decision] ?? f.decision,
      cx + fournColW / 2,
      y + 4.5,
      { align: 'center' }
    )
    cx += fournColW
  }

  // ──── LAST PAGE: Signature ────
  doc.addPage('a4', 'landscape')
  drawHeader(doc, `SIGNATURES — ${matrice.titre}`, logoBase64)

  y = 40

  doc.setFontSize(12)
  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(...VINCI_BLEU)
  doc.text('Signatures', MARGIN, y)
  y += 15

  // Signature blocks
  const sigBlockW = 80
  const sigBlockH = 40
  const sigGap = 20

  // Block 1: Acheteur
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Acheteur', MARGIN, y)
  y += 5
  doc.setFont('Helvetica', 'normal')
  doc.text(matrice.acheteur ?? '-', MARGIN, y)
  y += 3
  doc.setDrawColor(...GREY_BORDER)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN, y, sigBlockW, sigBlockH, 'S')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('Signature', MARGIN + 2, y + sigBlockH - 3)

  // Block 2: Responsable Projet (beside)
  const sig2X = MARGIN + sigBlockW + sigGap
  const sig2Y = y - 8
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Responsable Projet', sig2X, sig2Y)
  doc.setFont('Helvetica', 'normal')
  doc.text('-', sig2X, sig2Y + 5)
  doc.setDrawColor(...GREY_BORDER)
  doc.rect(sig2X, y, sigBlockW, sigBlockH, 'S')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('Signature', sig2X + 2, y + sigBlockH - 3)

  // Date
  y += sigBlockH + 10
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`Date : ${formatDateFR(new Date())}`, MARGIN, y)

  // ──── Apply footers to all pages ────
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    drawFooter(doc, p, totalPages)
  }

  // ──── Download ────
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const safeTitre = matrice.titre.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '_')
  doc.save(`Matrice_${safeTitre}_${dateStr}.pdf`)
}
