'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { formatNombreFR, formatDateFR } from '@/lib/utils'
import { Search, Download, FileText, BarChart3, FileCheck, CheckCircle2, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateQuantiteDE } from '@/actions/rapports'
import { useProfilStore } from '@/stores/profil'

interface LigneDEData {
  id: string
  code: string
  designation: string
  unite: string
  quantite: number
}

interface RapportData {
  id: string
  date: string
  titre: string | null
}

interface RecapitulatifTravauxProps {
  projetId: string
  projetName: string
  lignesDE: LigneDEData[]
  rapports: RapportData[]
  matrice: Record<string, Record<string, number>>
}

type FilterType = 'tous' | 'en_cours' | 'termines'

interface ColonneDate {
  dateStr: string
  dateISO: string
  rapportIds: string[]
  titres: string[]
}

function getAvancementStyle(pct: number): { bg: string; text: string } {
  if (pct >= 100) return { bg: '#E8EFDA', text: '#5E8019' }
  if (pct >= 75) return { bg: '#FFF7D1', text: '#DD9412' }
  if (pct >= 50) return { bg: '#F9E9D9', text: '#C26A32' }
  return { bg: '#FDEAED', text: '#E20025' }
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return formatDateFR(d)
}

function CelluleEditable({
  ligneId,
  col,
  valeur,
  matriceLocale,
  projetId,
  onUpdate,
}: {
  ligneId: string
  col: ColonneDate
  valeur: number
  matriceLocale: Record<string, Record<string, number>>
  projetId: string
  onUpdate: (ligneId: string, rapportId: string, newVal: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [localVal, setLocalVal] = useState('')

  const handleClick = () => {
    setLocalVal(valeur > 0 ? String(valeur) : '')
    setEditing(true)
  }

  const handleSave = async () => {
    setEditing(false)
    const newVal = parseFloat(localVal) || 0
    if (newVal === valeur) return

    // Trouver le bon rapport :
    // - Si une valeur existait deja dans un rapport -> modifier ce rapport
    // - Sinon -> utiliser le premier rapport de cette date
    let targetRapportId = col.rapportIds[0]
    for (const rId of col.rapportIds) {
      if ((matriceLocale[ligneId]?.[rId] || 0) > 0) {
        targetRapportId = rId
        break
      }
    }

    // Mise a jour optimiste
    onUpdate(ligneId, targetRapportId, newVal)

    // Sauvegarder cote serveur
    await updateQuantiteDE(projetId, targetRapportId, ligneId, newVal)
  }

  if (editing) {
    return (
      <input
        type="number"
        min="0"
        step="0.5"
        autoFocus
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-full text-center outline-none"
        style={{
          border: '2px solid #004489',
          borderRadius: 3,
          padding: '2px 4px',
          fontSize: 12,
        }}
      />
    )
  }

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer w-full"
      style={{ minHeight: 20 }}
      title="Cliquer pour modifier"
    >
      {valeur > 0 ? formatNombreFR(valeur) : ''}
    </div>
  )
}

export function RecapitulatifTravaux({
  projetId,
  projetName,
  lignesDE,
  rapports,
  matrice,
}: RecapitulatifTravauxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('tous')
  const tableRef = useRef<HTMLDivElement>(null)

  // State local pour mise a jour optimiste
  const [matriceLocale, setMatriceLocale] = useState(matrice)

  const handleCellUpdate = useCallback(
    (ligneId: string, rapportId: string, newVal: number) => {
      setMatriceLocale((prev) => {
        const next = { ...prev }
        if (!next[ligneId]) next[ligneId] = {}
        next[ligneId] = { ...next[ligneId] }
        if (newVal > 0) {
          next[ligneId][rapportId] = newVal
        } else {
          const copy = { ...next[ligneId] }
          delete copy[rapportId]
          next[ligneId] = copy
        }
        return next
      })
    },
    []
  )

  // Compute totals per ligne
  const ligneTotals = useMemo(() => {
    const result: Record<string, number> = {}
    for (const ligne of lignesDE) {
      let total = 0
      const rapportMap = matriceLocale[ligne.id] || {}
      for (const qty of Object.values(rapportMap)) {
        total += qty
      }
      result[ligne.id] = total
    }
    return result
  }, [lignesDE, matriceLocale])

  // Filter lignes
  const filteredLignes = useMemo(() => {
    let result = lignesDE

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) => l.code.toLowerCase().includes(q) || l.designation.toLowerCase().includes(q)
      )
    }

    if (filter === 'termines') {
      result = result.filter((l) => l.quantite > 0 && ligneTotals[l.id] >= l.quantite)
    } else if (filter === 'en_cours') {
      result = result.filter((l) => l.quantite <= 0 || ligneTotals[l.id] < l.quantite)
    }

    return result
  }, [lignesDE, searchQuery, filter, ligneTotals])

  // Synthesis cards
  const stats = useMemo(() => {
    const totalLignes = lignesDE.length
    const rapportsLies = rapports.length
    const terminees = lignesDE.filter(
      (l) => l.quantite > 0 && ligneTotals[l.id] >= l.quantite
    ).length
    const totalPrevu = lignesDE.reduce((s, l) => s + l.quantite, 0)
    const totalRealise = Object.values(ligneTotals).reduce((s, v) => s + v, 0)
    const avancementGlobal = totalPrevu > 0 ? (totalRealise / totalPrevu) * 100 : 0
    return { totalLignes, rapportsLies, terminees, avancementGlobal }
  }, [lignesDE, rapports, ligneTotals])

  // Group rapports by date
  const colonnesParDate = useMemo(() => {
    const dateMap = new Map<string, ColonneDate>()
    for (const r of rapports) {
      const dateKey = r.date.slice(0, 10) // "YYYY-MM-DD"
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          dateStr: formatShortDate(r.date),
          dateISO: dateKey,
          rapportIds: [],
          titres: [],
        })
      }
      const entry = dateMap.get(dateKey)!
      entry.rapportIds.push(r.id)
      if (r.titre) entry.titres.push(r.titre)
    }
    // Sort by date
    return Array.from(dateMap.values()).sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  }, [rapports])

  // Compute cumulated value per ligne per date
  function valeurParDate(ligneId: string, col: { rapportIds: string[] }): number {
    let total = 0
    for (const rId of col.rapportIds) {
      total += matriceLocale[ligneId]?.[rId] || 0
    }
    return total
  }

  // Excel Export (remplace CSV)
  const exportExcel = useCallback(async () => {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Récapitulatif Travaux')

    const logoSociete = useProfilStore.getState().logoSociete
    const nomSociete = useProfilStore.getState().nomSociete

    const totalCols = 4 + colonnesParDate.length + 2

    // Titre en-tête
    ws.mergeCells('A1', `${colLetter(totalCols)}1`)
    const titleCell = ws.getCell('A1')
    titleCell.value = `${nomSociete || ''} — ${projetName} — Récapitulatif Travaux`
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004489' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(1).height = 30

    // Date
    ws.mergeCells('A2', `${colLetter(totalCols)}2`)
    const dateCell = ws.getCell('A2')
    dateCell.value = `Édité le ${new Date().toLocaleDateString('fr-FR')}`
    dateCell.font = { size: 9, color: { argb: 'FF5A5A5A' } }
    dateCell.alignment = { horizontal: 'right' }

    // En-têtes (ligne 4)
    const headerRow = ws.getRow(4)
    const headers = ['N°', 'Désignation', 'Unité', 'Prévu',
      ...colonnesParDate.map(c => c.dateStr),
      'Total', '% Avmt.']

    headers.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = h
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004489' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      cell.border = thinBorder()
    })
    headerRow.height = 28

    // Sous-en-tête (ligne 5) — noms RJ
    const subHeaderRow = ws.getRow(5)
    subHeaderRow.getCell(1).value = ''
    subHeaderRow.getCell(2).value = ''
    subHeaderRow.getCell(3).value = ''
    subHeaderRow.getCell(4).value = ''
    colonnesParDate.forEach((col, i) => {
      const cell = subHeaderRow.getCell(5 + i)
      cell.value = col.titres.join('\n')
      cell.font = { size: 8, color: { argb: 'FF5A5A5A' } }
      cell.alignment = { horizontal: 'center', wrapText: true }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } }
    })

    // Données (à partir de la ligne 6)
    filteredLignes.forEach((ligne, idx) => {
      const row = ws.getRow(6 + idx)
      const total = ligneTotals[ligne.id] || 0
      const pct = ligne.quantite > 0 ? (total / ligne.quantite) * 100 : 0

      row.getCell(1).value = ligne.code
      row.getCell(2).value = ligne.designation
      row.getCell(3).value = ligne.unite
      row.getCell(4).value = ligne.quantite

      colonnesParDate.forEach((col, i) => {
        const val = valeurParDate(ligne.id, col)
        const cell = row.getCell(5 + i)
        if (val > 0) {
          cell.value = val
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5EFF8' } }
          cell.font = { bold: true, color: { argb: 'FF004489' } }
        }
        cell.alignment = { horizontal: 'center' }
        cell.border = thinBorder()
      })

      // Total
      const totalCell = row.getCell(5 + colonnesParDate.length)
      totalCell.value = total
      totalCell.font = { bold: true }
      totalCell.border = thinBorder()

      // % avancement avec couleur
      const pctCell = row.getCell(6 + colonnesParDate.length)
      pctCell.value = pct > 0 ? pct / 100 : 0
      pctCell.numFmt = '0.0%'
      pctCell.font = { bold: true, color: { argb: pctColorArgb(pct) } }
      pctCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pctBgArgb(pct) } }
      pctCell.border = thinBorder()

      // Alternance couleur lignes
      const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF0F0F0'
      for (let c = 1; c <= 4; c++) {
        const cell = row.getCell(c)
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
        cell.border = thinBorder()
      }
    })

    // Largeurs de colonnes
    ws.getColumn(1).width = 10
    ws.getColumn(2).width = 35
    ws.getColumn(3).width = 8
    ws.getColumn(4).width = 12
    colonnesParDate.forEach((_, i) => { ws.getColumn(5 + i).width = 10 })
    ws.getColumn(5 + colonnesParDate.length).width = 12
    ws.getColumn(6 + colonnesParDate.length).width = 10

    // Figer les 4 premières colonnes + en-tête
    ws.views = [{ state: 'frozen' as const, xSplit: 4, ySplit: 5 }]

    // Télécharger
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recapitulatif_${projetName.replace(/\s+/g, '_')}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLignes, colonnesParDate, matriceLocale, ligneTotals, projetName])

  // PDF Export — rendu direct jsPDF (sans html2canvas)
  const exportPDF = useCallback(async () => {
    const { jsPDF } = await import('jspdf')
    const logoSociete = useProfilStore.getState().logoSociete
    const nomSociete = useProfilStore.getState().nomSociete

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const PW = 297, PH = 210, M = 8
    const HEADER_H = 16, FOOTER_H = 8

    // Regrouper les colonnes par mois
    const moisMap = new Map<string, ColonneDate[]>()
    for (const col of colonnesParDate) {
      const moisKey = col.dateISO.slice(0, 7)
      if (!moisMap.has(moisKey)) moisMap.set(moisKey, [])
      moisMap.get(moisKey)!.push(col)
    }

    const moisList = Array.from(moisMap.entries())
    // Si aucun mois, on fait quand même 1 page vide
    if (moisList.length === 0) moisList.push(['', []])

    for (let moisIdx = 0; moisIdx < moisList.length; moisIdx++) {
      const [moisKey, colsDuMois] = moisList[moisIdx]
      if (moisIdx > 0) pdf.addPage()

      // En-tête VINCI
      pdf.setFillColor(0, 68, 137)
      pdf.rect(0, 0, PW, HEADER_H, 'F')
      if (logoSociete && logoSociete.startsWith('data:image')) {
        try { pdf.addImage(logoSociete, 'PNG', M, 2, 18, 10, undefined, 'FAST') } catch { /* logo invalide */ }
      } else if (nomSociete) {
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'bold')
        pdf.text(nomSociete, M, 10)
      }
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')

      const moisLabel = moisKey
        ? new Date(moisKey + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : ''
      pdf.text(`Récapitulatif Travaux — ${moisLabel}`, PW / 2, 9, { align: 'center' })
      pdf.text(projetName, PW / 2, 13, { align: 'center' })
      pdf.setFontSize(7)
      pdf.text(`Édité le ${new Date().toLocaleDateString('fr-FR')}`, PW - M, 9, { align: 'right' })

      // Dimensions colonnes — ajustées dynamiquement selon le nombre de dates
      const nbColsDates = colsDuMois.length
      const COL_W_UNITE = 10
      const COL_W_PREVU = 14
      const COL_W_TOTAL = 14
      const COL_W_PCT = 12
      const synthW = COL_W_UNITE + COL_W_PREVU + COL_W_TOTAL + COL_W_PCT
      // Espace restant pour N° + Désignation + colonnes dates
      const availForDynamic = PW - 2 * M - synthW
      // Colonnes dates : entre 8 et 14mm selon le nombre
      const dateColW = nbColsDates > 0
        ? Math.max(8, Math.min(14, (availForDynamic * 0.6) / nbColsDates))
        : 0
      const datesW = dateColW * nbColsDates
      // Espace restant pour N° + Désignation
      const codeDesigW = availForDynamic - datesW
      const COL_W_NO = Math.min(22, Math.max(14, codeDesigW * 0.3))
      const COL_W_DESIG = codeDesigW - COL_W_NO

      const startY = HEADER_H + 2
      const rowH = 5.5
      let y = startY

      // En-tête tableau
      pdf.setFillColor(0, 68, 137)
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(6)
      pdf.setFont('helvetica', 'bold')

      // Pré-calculer la hauteur sous-en-tête pour les RJ empilés
      const maxRjPreCalc = Math.max(1, ...colsDuMois.map(c => c.titres.length))
      const headerTotalH = rowH + maxRjPreCalc * 3.5 + 1

      let x = M
      const drawHeaderCell = (text: string, w: number) => {
        pdf.rect(x, y, w, headerTotalH, 'F')
        pdf.text(text, x + w / 2, y + headerTotalH / 2 + 1, { align: 'center' })
        x += w
      }

      drawHeaderCell('N°', COL_W_NO)
      drawHeaderCell('Désignation', COL_W_DESIG)
      drawHeaderCell('Unité', COL_W_UNITE)
      drawHeaderCell('Prévu', COL_W_PREVU)

      // Hauteur sous-en-tête = nombre max de RJ par date pour les empiler en colonne
      const maxRjParDate = Math.max(1, ...colsDuMois.map(c => c.titres.length))
      const subRowH = maxRjParDate * 3.5 + 1

      colsDuMois.forEach(col => {
        // Ligne date
        pdf.setFillColor(0, 68, 137)
        pdf.rect(x, y, dateColW, rowH, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(5)
        pdf.text(col.dateStr.slice(0, 5), x + dateColW / 2, y + rowH - 1.5, { align: 'center' })
        // Sous-ligne: noms RJ empilés verticalement
        pdf.setFillColor(0, 51, 112)
        pdf.rect(x, y + rowH, dateColW, subRowH, 'F')
        pdf.setFontSize(3.5)
        col.titres.forEach((titre, ti) => {
          pdf.text(titre, x + dateColW / 2, y + rowH + 3 + ti * 3.5, { align: 'center', maxWidth: dateColW - 1 })
        })
        pdf.setFontSize(6)
        x += dateColW
      })

      pdf.setFillColor(0, 68, 137)
      pdf.setTextColor(255, 255, 255)
      drawHeaderCell('Total', COL_W_TOTAL)
      drawHeaderCell('%', COL_W_PCT)

      y += headerTotalH

      // Fonction pour redessiner l'en-tête de tableau sur une nouvelle page
      const drawTableHeader = () => {
        pdf.setFillColor(0, 68, 137)
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(6)
        pdf.setFont('helvetica', 'bold')

        let hx = M
        const dh = (text: string, w: number) => {
          pdf.rect(hx, y, w, headerTotalH, 'F')
          pdf.text(text, hx + w / 2, y + headerTotalH / 2 + 1, { align: 'center' })
          hx += w
        }
        dh('N°', COL_W_NO)
        dh('Désignation', COL_W_DESIG)
        dh('Unité', COL_W_UNITE)
        dh('Prévu', COL_W_PREVU)

        colsDuMois.forEach(col => {
          pdf.setFillColor(0, 68, 137)
          pdf.rect(hx, y, dateColW, rowH, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(5)
          pdf.text(col.dateStr.slice(0, 5), hx + dateColW / 2, y + rowH - 1.5, { align: 'center' })
          pdf.setFillColor(0, 51, 112)
          pdf.rect(hx, y + rowH, dateColW, subRowH, 'F')
          pdf.setFontSize(3.5)
          col.titres.forEach((titre, ti) => {
            pdf.text(titre, hx + dateColW / 2, y + rowH + 3 + ti * 3.5, { align: 'center', maxWidth: dateColW - 1 })
          })
          pdf.setFontSize(6)
          hx += dateColW
        })

        pdf.setFillColor(0, 68, 137)
        pdf.setTextColor(255, 255, 255)
        dh('Total', COL_W_TOTAL)
        dh('%', COL_W_PCT)

        y += headerTotalH
      }

      // Lignes de données
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(6)

      for (let i = 0; i < filteredLignes.length; i++) {
        // Nouvelle page si on dépasse
        if (y + rowH > PH - FOOTER_H - 2) {
          pdf.addPage()
          // Ré-imprimer en-tête page
          pdf.setFillColor(0, 68, 137)
          pdf.rect(0, 0, PW, HEADER_H, 'F')
          if (logoSociete && logoSociete.startsWith('data:image')) {
            try { pdf.addImage(logoSociete, 'PNG', M, 2, 18, 10, undefined, 'FAST') } catch {}
          } else if (nomSociete) {
            pdf.setTextColor(255, 255, 255)
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'bold')
            pdf.text(nomSociete, M, 10)
          }
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`Récapitulatif Travaux — ${moisLabel} (suite)`, PW / 2, 9, { align: 'center' })
          pdf.text(projetName, PW / 2, 13, { align: 'center' })

          y = HEADER_H + 2
          drawTableHeader()
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(6)
        }

        const ligne = filteredLignes[i]
        const total = ligneTotals[ligne.id] || 0
        const pct = ligne.quantite > 0 ? Math.round((total / ligne.quantite) * 100) : 0
        const isEven = i % 2 === 0

        if (!isEven) {
          pdf.setFillColor(240, 240, 240)
          pdf.rect(M, y, PW - 2 * M, rowH, 'F')
        }

        x = M
        pdf.setTextColor(0, 0, 0)

        // N° — tronquer selon la largeur dispo
        const maxCodeChars = Math.floor(COL_W_NO / 1.8)
        const codeTrunc = ligne.code.length > maxCodeChars ? ligne.code.slice(0, maxCodeChars - 1) + '.' : ligne.code
        pdf.setFontSize(5)
        pdf.text(codeTrunc, x + 1, y + rowH - 1.5)
        pdf.setFontSize(6)
        x += COL_W_NO

        // Désignation — tronquer selon la largeur dispo
        const maxDesigChars = Math.floor(COL_W_DESIG / 1.6)
        const desig = ligne.designation.length > maxDesigChars ? ligne.designation.slice(0, maxDesigChars - 1) + '…' : ligne.designation
        pdf.text(desig, x + 1, y + rowH - 1.5)
        x += COL_W_DESIG

        pdf.text(ligne.unite || '', x + COL_W_UNITE / 2, y + rowH - 1.5, { align: 'center' })
        x += COL_W_UNITE

        pdf.text(fmtPdf(ligne.quantite, 0), x + COL_W_PREVU - 1, y + rowH - 1.5, { align: 'right' })
        x += COL_W_PREVU

        colsDuMois.forEach(col => {
          const val = valeurParDate(ligne.id, col)
          if (val > 0) {
            pdf.setFillColor(229, 239, 248)
            pdf.rect(x, y, dateColW, rowH, 'F')
            pdf.setTextColor(0, 68, 137)
            pdf.setFont('helvetica', 'bold')
            pdf.text(String(val), x + dateColW / 2, y + rowH - 1.5, { align: 'center' })
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(0, 0, 0)
          }
          x += dateColW
        })

        // Total
        pdf.setFont('helvetica', 'bold')
        pdf.text(fmtPdf(total, 0), x + COL_W_TOTAL - 1, y + rowH - 1.5, { align: 'right' })
        x += COL_W_TOTAL

        // %
        const avStyle = getAvancementStyle(pct)
        const bgRgb = hexToRgbPdf(avStyle.bg)
        pdf.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b)
        pdf.rect(x, y, COL_W_PCT, rowH, 'F')
        const txtRgb = hexToRgbPdf(avStyle.text)
        pdf.setTextColor(txtRgb.r, txtRgb.g, txtRgb.b)
        pdf.text(`${pct}%`, x + COL_W_PCT / 2, y + rowH - 1.5, { align: 'center' })
        pdf.setTextColor(0, 0, 0)
        pdf.setFont('helvetica', 'normal')

        // Bordure ligne
        pdf.setDrawColor(220, 220, 220)
        pdf.line(M, y + rowH, PW - M, y + rowH)

        y += rowH
      }

      // Pied de page
      pdf.setFillColor(0, 51, 112)
      pdf.rect(0, PH - FOOTER_H, PW, FOOTER_H, 'F')
      pdf.setFontSize(7)
      pdf.setTextColor(181, 171, 161)
      const piedGauche = [nomSociete, projetName].filter(Boolean).join(' — ')
      pdf.text(piedGauche, M, PH - 2)
      pdf.text(`Page ${moisIdx + 1} / ${moisList.length}`, PW - M, PH - 2, { align: 'right' })
    }

    pdf.save(`recapitulatif_${projetName.replace(/\s+/g, '_')}.pdf`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLignes, colonnesParDate, matriceLocale, ligneTotals, projetName])

  const avancementGlobalStyle = getAvancementStyle(stats.avancementGlobal)

  return (
    <div className="p-6 space-y-6">
      {/* Synthesis cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SynthCard
          icon={<FileText className="h-5 w-5 text-[#004489]" />}
          label="Lignes DE"
          value={String(stats.totalLignes)}
        />
        <SynthCard
          icon={<BarChart3 className="h-5 w-5 text-[#004489]" />}
          label="Rapports lies"
          value={String(stats.rapportsLies)}
        />
        <SynthCard
          icon={<CheckCircle2 className="h-5 w-5 text-[#5E8019]" />}
          label="Lignes terminees"
          value={String(stats.terminees)}
        />
        <div
          className="flex items-center gap-3 rounded-lg border p-4"
          style={{ borderColor: '#DCDCDC', backgroundColor: avancementGlobalStyle.bg }}
        >
          <TrendingUp className="h-5 w-5" style={{ color: avancementGlobalStyle.text }} />
          <div>
            <div className="text-xs text-[#5A5A5A]">Avancement global</div>
            <div
              className="text-lg font-bold"
              style={{ color: avancementGlobalStyle.text }}
            >
              {formatNombreFR(stats.avancementGlobal, 1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A5A5A]" />
          <Input
            placeholder="Rechercher une ligne..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(
            [
              ['tous', 'Tous'],
              ['en_cours', 'En cours'],
              ['termines', 'Termin\u00E9s'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={
                filter === key
                  ? { backgroundColor: '#004489', color: '#FFFFFF' }
                  : { backgroundColor: '#F0F0F0', color: '#000000', border: '1px solid #DCDCDC' }
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportExcel}
            variant="outline"
            className="text-sm border-[#004489] text-[#004489]"
          >
            <Download className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button
            onClick={exportPDF}
            className="text-sm bg-[#004489] hover:bg-[#003370] text-white"
          >
            <FileCheck className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <style>{`
        .recap-table td.editable-cell:hover {
          background-color: #E5EFF8 !important;
        }
      `}</style>
      <div ref={tableRef} className="overflow-x-auto border border-[#DCDCDC] rounded-lg">
        <table className="w-full text-xs border-collapse recap-table">
          <thead>
            <tr style={{ backgroundColor: '#004489' }}>
              <th
                className="text-left px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap sticky left-0 z-10"
                style={{ backgroundColor: '#004489', minWidth: 50 }}
              >
                N°
              </th>
              <th
                className="text-left px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap"
                style={{ minWidth: 200 }}
              >
                Designation
              </th>
              <th
                className="text-center px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap"
                style={{ minWidth: 50 }}
              >
                Unite
              </th>
              <th
                className="text-right px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap"
                style={{ minWidth: 70 }}
              >
                Prevu
              </th>
              {colonnesParDate.map((col) => (
                <th
                  key={col.dateISO}
                  className="text-center px-1 py-1 text-white font-bold border-r border-white/20 whitespace-nowrap"
                  style={{ minWidth: 70 }}
                >
                  <div style={{ fontSize: 10, lineHeight: 1.3 }}>{col.dateStr}</div>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 400,
                      opacity: 0.75,
                      lineHeight: 1.2,
                      marginTop: 1,
                    }}
                  >
                    {col.titres.length > 0 ? col.titres.join(' · ') : '\u2014'}
                  </div>
                </th>
              ))}
              <th
                className="text-right px-2 py-2 text-white font-bold border-r border-white/20 whitespace-nowrap"
                style={{ minWidth: 70 }}
              >
                Total
              </th>
              <th
                className="text-center px-2 py-2 text-white font-bold whitespace-nowrap"
                style={{ minWidth: 80 }}
              >
                % Avancement
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLignes.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + colonnesParDate.length + 2}
                  className="text-center py-8 text-[#5A5A5A]"
                >
                  Aucune ligne trouvee
                </td>
              </tr>
            ) : (
              filteredLignes.map((ligne, idx) => {
                const total = ligneTotals[ligne.id] || 0
                const pct = ligne.quantite > 0 ? (total / ligne.quantite) * 100 : 0
                const avStyle = getAvancementStyle(pct)
                const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F0F0F0'

                return (
                  <tr key={ligne.id} style={{ backgroundColor: rowBg }}>
                    <td
                      className="px-2 py-1.5 border-r border-[#DCDCDC] font-mono sticky left-0 z-10"
                      style={{ backgroundColor: rowBg }}
                    >
                      {ligne.code}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC]">
                      {ligne.designation}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC] text-center">
                      {ligne.unite}
                    </td>
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC] text-right">
                      {formatNombreFR(ligne.quantite)}
                    </td>
                    {colonnesParDate.map((col) => {
                      const val = valeurParDate(ligne.id, col)
                      return (
                        <td
                          key={col.dateISO}
                          className="px-1 py-0.5 border-r border-[#DCDCDC] text-center editable-cell"
                          style={
                            val > 0
                              ? {
                                  backgroundColor: '#E5EFF8',
                                  color: '#004489',
                                  fontWeight: 700,
                                }
                              : undefined
                          }
                        >
                          <CelluleEditable
                            ligneId={ligne.id}
                            col={col}
                            valeur={val}
                            matriceLocale={matriceLocale}
                            projetId={projetId}
                            onUpdate={handleCellUpdate}
                          />
                        </td>
                      )
                    })}
                    <td className="px-2 py-1.5 border-r border-[#DCDCDC] text-right font-bold">
                      {formatNombreFR(total)}
                    </td>
                    <td
                      className="px-2 py-1.5 text-center font-bold"
                      style={{ backgroundColor: avStyle.bg, color: avStyle.text }}
                    >
                      {formatNombreFR(pct, 1)}%
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Helpers Excel ---

function thinBorder(): Partial<import('exceljs').Borders> {
  return {
    top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
  }
}

function colLetter(n: number): string {
  let s = ''
  let num = n
  while (num > 0) { num--; s = String.fromCharCode(65 + (num % 26)) + s; num = Math.floor(num / 26) }
  return s
}

function pctColorArgb(pct: number): string {
  if (pct >= 100) return 'FF5E8019'
  if (pct >= 75) return 'FFDD9412'
  if (pct >= 50) return 'FFC26A32'
  return 'FFE20025'
}

function pctBgArgb(pct: number): string {
  if (pct >= 100) return 'FFE8EFDA'
  if (pct >= 75) return 'FFFFF7D1'
  if (pct >= 50) return 'FFF9E9D9'
  return 'FFFDEAED'
}

// --- Helper PDF ---

// Formater un nombre pour jsPDF — remplace les espaces insécables par des espaces normaux
function fmtPdf(n: number, dec = 0): string {
  return formatNombreFR(n, dec).replace(/\u00A0/g, ' ').replace(/\u202F/g, ' ')
}

function hexToRgbPdf(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function SynthCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-[#DCDCDC] p-4">
      {icon}
      <div>
        <div className="text-xs text-[#5A5A5A]">{label}</div>
        <div className="text-lg font-bold text-[#000000]">{value}</div>
      </div>
    </div>
  )
}
