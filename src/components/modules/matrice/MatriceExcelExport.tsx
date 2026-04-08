'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

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

interface MatriceData {
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

interface MatriceExcelExportProps {
  matrice: MatriceData
}

// ──────────────────────────────────────────────
// Famille labels
// ──────────────────────────────────────────────

const FAMILLE_LABELS: Record<string, string> = {
  general: 'GENERAL',
  qualite: 'QUALITE',
  couts: 'COUTS',
  delais: 'DELAIS',
  service: 'SERVICE',
}

// ──────────────────────────────────────────────
// Colors
// ──────────────────────────────────────────────

const VINCI_BLEU = '004489'
const VINCI_BLEU_DARK = '003370'
const NOTE_COLORS: Record<number, string> = {
  1: 'FDEAED', // rouge clair
  2: 'FFF7D1', // jaune clair
  3: 'E8EFDA', // vert clair
}
const NC_MAJEURE_BG = 'FDEAED'
const NC_NEGO_BG = 'FFF7D1'
const DECISION_COLORS: Record<string, string> = {
  vert: 'E8EFDA',
  jaune: 'FFF7D1',
  rouge: 'FDEAED',
}
const DECISION_LABELS: Record<string, string> = {
  go: 'GO',
  no_go: 'NO-GO',
  en_attente: 'EN ATTENTE',
}

// ──────────────────────────────────────────────
// Helper: get notation for a fournisseur / critere
// ──────────────────────────────────────────────

function getNotation(fournisseur: Fournisseur, critereId: string): Notation | undefined {
  return fournisseur.notations.find((n) => n.critereId === critereId)
}

function computeScore(fournisseur: Fournisseur, criteres: Critere[]): number {
  const criteresNote = criteres.filter((c) => c.type === 'note_1_3')
  let score = 0
  for (const critere of criteresNote) {
    const notation = getNotation(fournisseur, critere.id)
    if (notation?.note) {
      score += notation.note * critere.coefficient
    }
  }
  return score
}

function computeMaxScore(criteres: Critere[]): number {
  return criteres.filter((c) => c.type === 'note_1_3').reduce((sum, c) => sum + 3 * c.coefficient, 0)
}

// ──────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────

async function generateExcel(matrice: MatriceData) {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Conduc Rail'
  wb.created = new Date()

  const fournisseurs = [...matrice.fournisseurs].sort((a, b) => a.rang - b.rang)
  const maxScore = computeMaxScore(matrice.criteres)

  // ──── Onglet 1: Bid Comp ────
  const ws1 = wb.addWorksheet('Bid Comp')

  // Freeze first 2 columns (critere label + famille)
  ws1.views = [{ state: 'frozen', xSplit: 2, ySplit: 7 }]

  // Column widths
  ws1.getColumn(1).width = 30
  ws1.getColumn(2).width = 15
  for (let i = 0; i < fournisseurs.length; i++) {
    ws1.getColumn(3 + i).width = 18
  }

  // Helper for header info rows
  function addInfoRow(ws: typeof ws1, label: string, value: string, row: number) {
    const cell = ws.getCell(row, 1)
    cell.value = label
    cell.font = { bold: true, size: 10, color: { argb: 'FF004489' } }
    const valCell = ws.getCell(row, 2)
    valCell.value = value
    valCell.font = { size: 10 }
  }

  addInfoRow(ws1, 'Acheteur', matrice.acheteur ?? '-', 1)
  addInfoRow(ws1, 'Site', matrice.site ?? '-', 2)
  addInfoRow(ws1, 'Projet', matrice.titre, 3)
  addInfoRow(ws1, 'Famille Achats', matrice.familleAchats ?? '-', 4)
  addInfoRow(ws1, 'Budget', matrice.budgetTheorique != null
    ? `${matrice.budgetTheorique.toLocaleString('fr-FR')} ${matrice.devise}`
    : '-', 5)

  // Blank row 6
  // Header row 7
  const headerRow = ws1.getRow(7)
  headerRow.getCell(1).value = 'Critere'
  headerRow.getCell(2).value = 'Type'
  fournisseurs.forEach((f, i) => {
    headerRow.getCell(3 + i).value = f.nom
  })
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${VINCI_BLEU}` } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    }
  })

  // Group criteres by famille
  const familleOrder = ['general', 'qualite', 'couts', 'delais', 'service']
  const criteresByFamille = new Map<string, Critere[]>()
  for (const c of matrice.criteres) {
    const list = criteresByFamille.get(c.famille) || []
    list.push(c)
    criteresByFamille.set(c.famille, list)
  }

  let currentRow = 8

  for (const famille of familleOrder) {
    const criteres = criteresByFamille.get(famille)
    if (!criteres || criteres.length === 0) continue

    // Famille header row
    const familleRow = ws1.getRow(currentRow)
    familleRow.getCell(1).value = FAMILLE_LABELS[famille] || famille.toUpperCase()
    // Merge across all columns
    ws1.mergeCells(currentRow, 1, currentRow, 2 + fournisseurs.length)
    familleRow.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    familleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${VINCI_BLEU}` } }
    familleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
    currentRow++

    for (const critere of criteres) {
      const row = ws1.getRow(currentRow)
      row.getCell(1).value = critere.libelle
      row.getCell(1).font = { size: 10 }
      row.getCell(2).value = critere.type
      row.getCell(2).font = { size: 9, color: { argb: 'FF5A5A5A' } }

      fournisseurs.forEach((f, i) => {
        const cell = row.getCell(3 + i)
        const notation = getNotation(f, critere.id)

        if (!notation) {
          cell.value = '-'
          cell.alignment = { horizontal: 'center' }
          return
        }

        // Non-conformite backgrounds
        if (notation.estNonConformiteMajeure) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${NC_MAJEURE_BG}` } }
        } else if (notation.estNonConformiteNegociable) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${NC_NEGO_BG}` } }
        }

        if (critere.type === 'note_1_3' && notation.note != null) {
          cell.value = notation.note
          if (!notation.estNonConformiteMajeure && !notation.estNonConformiteNegociable) {
            const color = NOTE_COLORS[notation.note]
            if (color) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color}` } }
            }
          }
        } else if (critere.type === 'booleen') {
          cell.value = notation.valeurBool ? 'Oui' : 'Non'
        } else if (critere.type === 'montant' && notation.valeurTexte) {
          cell.value = notation.valeurTexte
        } else {
          cell.value = notation.valeurTexte ?? notation.commentaire ?? '-'
        }

        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.font = { size: 10 }
      })

      // Borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
          bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
          left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
          right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
        }
      })

      // Alternate row bg
      if ((currentRow - 8) % 2 === 1) {
        row.eachCell((cell) => {
          if (!cell.fill || (cell.fill as { pattern?: string }).pattern !== 'solid') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }
          }
        })
      }

      currentRow++
    }
  }

  // Score total row
  const scoreRow = ws1.getRow(currentRow)
  scoreRow.getCell(1).value = 'SCORE TOTAL'
  scoreRow.getCell(2).value = `/ ${maxScore}`
  fournisseurs.forEach((f, i) => {
    const score = computeScore(f, matrice.criteres)
    scoreRow.getCell(3 + i).value = score
  })
  scoreRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${VINCI_BLEU_DARK}` } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    }
  })
  currentRow++

  // Score normalise row
  const normRow = ws1.getRow(currentRow)
  normRow.getCell(1).value = 'Score normalise (%)'
  normRow.getCell(2).value = ''
  fournisseurs.forEach((f, i) => {
    const score = computeScore(f, matrice.criteres)
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 10000) / 100 : 0
    normRow.getCell(3 + i).value = `${pct}%`
  })
  normRow.eachCell((cell) => {
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    }
  })
  currentRow++

  // Decision row
  const decRow = ws1.getRow(currentRow)
  decRow.getCell(1).value = 'DECISION'
  decRow.getCell(2).value = ''
  fournisseurs.forEach((f, i) => {
    const cell = decRow.getCell(3 + i)
    cell.value = DECISION_LABELS[f.decision] ?? f.decision
    cell.font = { bold: true, size: 10 }
    cell.alignment = { horizontal: 'center' }
    const bgColor = DECISION_COLORS[f.couleurDecision]
    if (bgColor) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgColor}` } }
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    }
  })

  // ──── Onglet 2: Selection RMS ────
  const ws2 = wb.addWorksheet('Selection RMS')
  ws2.views = [{ state: 'frozen', xSplit: 3, ySplit: 1 }]

  ws2.getColumn(1).width = 30
  ws2.getColumn(2).width = 12
  ws2.getColumn(3).width = 10
  for (let i = 0; i < fournisseurs.length; i++) {
    ws2.getColumn(4 + i).width = 18
  }

  // Header
  const ws2Header = ws2.getRow(1)
  ws2Header.getCell(1).value = 'Critere'
  ws2Header.getCell(2).value = 'Type'
  ws2Header.getCell(3).value = 'Coeff.'
  fournisseurs.forEach((f, i) => {
    ws2Header.getCell(4 + i).value = f.nom
  })
  ws2Header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${VINCI_BLEU}` } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    }
  })

  let rmsRow = 2
  const criteresNote = matrice.criteres.filter((c) => c.type === 'note_1_3')

  for (const critere of criteresNote) {
    const row = ws2.getRow(rmsRow)
    row.getCell(1).value = critere.libelle
    row.getCell(1).font = { size: 10 }
    row.getCell(2).value = critere.type
    row.getCell(2).font = { size: 9, color: { argb: 'FF5A5A5A' } }
    row.getCell(3).value = critere.coefficient
    row.getCell(3).font = { bold: true, size: 10 }
    row.getCell(3).alignment = { horizontal: 'center' }

    fournisseurs.forEach((f, i) => {
      const cell = row.getCell(4 + i)
      const notation = getNotation(f, critere.id)
      if (notation?.note != null) {
        const weighted = notation.note * critere.coefficient
        cell.value = weighted
        const noteColor = NOTE_COLORS[notation.note]
        if (noteColor) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${noteColor}` } }
        }
      } else {
        cell.value = '-'
      }
      cell.alignment = { horizontal: 'center' }
      cell.font = { size: 10 }
    })

    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
        bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
        left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
        right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      }
    })

    if ((rmsRow - 2) % 2 === 1) {
      row.eachCell((cell) => {
        if (!cell.fill || (cell.fill as { pattern?: string }).pattern !== 'solid') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }
        }
      })
    }

    rmsRow++
  }

  // Score total row
  const totalRow = ws2.getRow(rmsRow)
  totalRow.getCell(1).value = 'SCORE TOTAL PONDERE'
  totalRow.getCell(2).value = ''
  totalRow.getCell(3).value = ''
  fournisseurs.forEach((f, i) => {
    totalRow.getCell(4 + i).value = computeScore(f, matrice.criteres)
  })
  totalRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${VINCI_BLEU_DARK}` } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    }
  })
  rmsRow++

  // Classement row
  const classRow = ws2.getRow(rmsRow)
  classRow.getCell(1).value = 'CLASSEMENT'
  classRow.getCell(2).value = ''
  classRow.getCell(3).value = ''

  // Sort fournisseurs by score to get ranking
  const ranked = fournisseurs
    .map((f) => ({ id: f.id, score: computeScore(f, matrice.criteres) }))
    .sort((a, b) => b.score - a.score)

  fournisseurs.forEach((f, i) => {
    const rank = ranked.findIndex((r) => r.id === f.id) + 1
    const cell = classRow.getCell(4 + i)
    cell.value = `#${rank}`
    cell.font = { bold: true, size: 11 }
    cell.alignment = { horizontal: 'center' }
    const bgColor = DECISION_COLORS[f.couleurDecision]
    if (bgColor) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgColor}` } }
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    }
  })

  // ──── Download ────
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const safeTitre = matrice.titre.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '_')
  const filename = `Matrice_${safeTitre}_${dateStr}.xlsx`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function MatriceExcelExport({ matrice }: MatriceExcelExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    if (isExporting) return
    setIsExporting(true)
    try {
      await generateExcel(matrice)
    } catch (err) {
      console.error('Excel export error:', err)
    } finally {
      setTimeout(() => setIsExporting(false), 1000)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className="bg-[#F0F0F0] border border-[#DCDCDC] hover:bg-[#E0E0E0] text-[#000000]"
    >
      <FileSpreadsheet className="h-4 w-4 mr-1" />
      {isExporting ? 'Generation...' : 'Export Excel'}
    </Button>
  )
}
