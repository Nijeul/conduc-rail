// Export Excel du suivi ARF, même mise en forme croisée que le PDF :
// un groupement de colonnes par voie (Prévu ITC | Réel | Temps | Delta
// [| Caténaire | Delta]), une ligne par jour ouvré, totaux en pied.

import type { ARFRow } from '@/actions/arf'
import {
  pivotARF,
  calculsLigneARF,
  finComptabilisee,
  deltaCatenaire,
  cumulColonne,
} from '@/lib/arf-calculs'
import type ExcelJS from 'exceljs'

const BLEU = 'FF004489'
const BLEU_FONCE = 'FF003370'
const BLEU_TRES_CLAIR = 'FFE5EFF8'
const JAUNE_CLAIR = 'FFFFF7D1'
const JAUNE = 'FFF2AB1B'
const GRIS_CLAIR = 'FFF0F0F0'
const GRIS_BORDURE = 'FFDCDCDC'
const BLANC = 'FFFFFFFF'
const TEXTE_SECONDAIRE = 'FF5A5A5A'

function couleurDelta(pct: number | null): string {
  if (pct === null) return TEXTE_SECONDAIRE
  if (pct >= 95) return 'FF5E8019'
  if (pct >= 90) return 'FFDD9412'
  return 'FFE20025'
}

function formatDuree(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  const sign = minutes < 0 ? '-' : ''
  if (h === 0) return `${sign}${m}min`
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h${m.toString().padStart(2, '0')}`
}

function formatDateCourt(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

type Cellule = ExcelJS.Cell

function remplir(cell: Cellule, argb: string) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

function bordures(cell: Cellule) {
  cell.border = {
    top: { style: 'thin', color: { argb: GRIS_BORDURE } },
    bottom: { style: 'thin', color: { argb: GRIS_BORDURE } },
    left: { style: 'thin', color: { argb: GRIS_BORDURE } },
    right: { style: 'thin', color: { argb: GRIS_BORDURE } },
  }
}

export async function generateARFExcel(projetName: string, rows: ARFRow[]) {
  const ExcelJSMod = (await import('exceljs')).default
  const wb = new ExcelJSMod.Workbook()
  wb.creator = 'Conduc Rail'
  wb.created = new Date()

  const pivot = pivotARF(rows)

  // ──── Onglet 1 : Par voie (format croisé) ────
  if (pivot) {
    const ws = wb.addWorksheet('Par voie')

    // Colonnes : Sem. | Date | puis par voie 4 ou 6 sous-colonnes
    const sousColonnes: {
      voie: string
      type: 'prevu' | 'reel' | 'temps' | 'delta' | 'catReel' | 'catDelta'
    }[] = []
    for (const c of pivot.colonnes) {
      sousColonnes.push({ voie: c.voie, type: 'prevu' })
      sousColonnes.push({ voie: c.voie, type: 'reel' })
      sousColonnes.push({ voie: c.voie, type: 'temps' })
      sousColonnes.push({ voie: c.voie, type: 'delta' })
      if (c.avecCat) {
        sousColonnes.push({ voie: c.voie, type: 'catReel' })
        sousColonnes.push({ voie: c.voie, type: 'catDelta' })
      }
    }
    const nbCols = 2 + sousColonnes.length

    ws.getColumn(1).width = 6
    ws.getColumn(2).width = 9
    sousColonnes.forEach((sc, i) => {
      const largeurs = { prevu: 14, reel: 15, temps: 8, delta: 8, catReel: 15, catDelta: 8 }
      ws.getColumn(3 + i).width = largeurs[sc.type]
    })

    // Titre
    ws.mergeCells(1, 1, 1, nbCols)
    const titre = ws.getCell(1, 1)
    titre.value = `SUIVI ARF — ${projetName}`
    titre.font = { bold: true, size: 13, color: { argb: BLANC } }
    remplir(titre, BLEU)
    titre.alignment = { horizontal: 'left', vertical: 'middle' }
    ws.getRow(1).height = 24

    // En-tête niveau 1 : groupements de voies (ligne 3)
    const rowG = ws.getRow(3)
    ws.mergeCells(3, 1, 4, 1)
    ws.mergeCells(3, 2, 4, 2)
    ws.getCell(3, 1).value = 'Sem.'
    ws.getCell(3, 2).value = 'Date'
    let col = 3
    for (const c of pivot.colonnes) {
      const span = 4 + (c.avecCat ? 2 : 0)
      ws.mergeCells(3, col, 3, col + span - 1)
      ws.getCell(3, col).value = c.voie
      col += span
    }
    for (let i = 1; i <= nbCols; i++) {
      const cell = rowG.getCell(i)
      cell.font = { bold: true, size: 10, color: { argb: BLANC } }
      remplir(cell, BLEU)
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      bordures(cell)
    }

    // En-tête niveau 2 : sous-colonnes (ligne 4)
    const libelles = {
      prevu: 'Prévu ITC',
      reel: 'Réel',
      temps: 'Temps',
      delta: 'Delta',
      catReel: 'Caténaire',
      catDelta: 'Delta',
    }
    const rowS = ws.getRow(4)
    sousColonnes.forEach((sc, i) => {
      const cell = rowS.getCell(3 + i)
      cell.value = libelles[sc.type]
      const cat = sc.type === 'catReel' || sc.type === 'catDelta'
      cell.font = { bold: true, size: 9, color: { argb: cat ? JAUNE : BLANC } }
    })
    for (let i = 1; i <= nbCols; i++) {
      const cell = rowS.getCell(i)
      remplir(cell, BLEU_FONCE)
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      bordures(cell)
      if (!cell.font) cell.font = { bold: true, size: 9, color: { argb: BLANC } }
    }

    ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 4 }]

    // Corps : une ligne par jour ouvré
    let r = 5
    for (const sem of pivot.semaines) {
      const premierR = r
      for (const d of sem.dates) {
        const row = ws.getRow(r)
        const alt = pivot.dates.indexOf(d) % 2 !== 0

        row.getCell(2).value = formatDateCourt(d)
        row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }
        row.getCell(2).font = { size: 9 }

        let c2 = 3
        for (const c of pivot.colonnes) {
          const eVoie = pivot.parCle.get(`${d}|${c.voie}|voie`) || []
          const eCat = pivot.parCle.get(`${d}|${c.voie}|cat`) || []

          const cellPrevu = row.getCell(c2)
          cellPrevu.value =
            eVoie
              .map((e) =>
                e.heureDebutPrevue && e.heureFinPrevue
                  ? `${e.heureDebutPrevue} - ${e.heureFinPrevue}`
                  : '—'
              )
              .join('\n') || '—'
          cellPrevu.font = { size: 9, color: { argb: BLEU_FONCE } }
          remplir(cellPrevu, BLEU_TRES_CLAIR)

          const cellReel = row.getCell(c2 + 1)
          cellReel.value =
            eVoie
              .map((e) => `${e.heureDebut || '—'} - ${finComptabilisee(e) || '...'}`)
              .join('\n') || '—'
          cellReel.font = { bold: true, size: 9 }

          const cellTemps = row.getCell(c2 + 2)
          cellTemps.value =
            eVoie
              .map((e) => {
                const { dureeReelleMin } = calculsLigneARF(e)
                return dureeReelleMin !== null ? formatDuree(dureeReelleMin) : '—'
              })
              .join('\n') || '—'
          cellTemps.font = { bold: true, size: 9 }

          const cellDelta = row.getCell(c2 + 3)
          const pcts = eVoie.map((e) => calculsLigneARF(e).pourcentTemps)
          cellDelta.value =
            pcts.map((p) => (p !== null ? `${p.toFixed(0)} %` : '—')).join('\n') || '—'
          cellDelta.font = {
            bold: true,
            size: 9,
            color: { argb: couleurDelta(pcts.find((p) => p !== null) ?? null) },
          }

          if (c.avecCat) {
            const cellCat = row.getCell(c2 + 4)
            cellCat.value =
              eCat
                .map((e) => `${e.heureDebut || '—'} - ${finComptabilisee(e) || '...'}`)
                .join('\n') || '—'
            cellCat.font = { bold: true, size: 9 }
            remplir(cellCat, JAUNE_CLAIR)

            const cellCatDelta = row.getCell(c2 + 5)
            const deltas = eCat.map((e) => deltaCatenaire(e, pivot.avecVoie))
            cellCatDelta.value =
              deltas.map((p) => (p !== null ? `${p.toFixed(0)} %` : '—')).join('\n') || '—'
            cellCatDelta.font = {
              bold: true,
              size: 9,
              color: { argb: couleurDelta(deltas.find((p) => p !== null) ?? null) },
            }
            remplir(cellCatDelta, JAUNE_CLAIR)
          }

          c2 += 4 + (c.avecCat ? 2 : 0)
        }

        for (let i = 1; i <= nbCols; i++) {
          const cell = row.getCell(i)
          bordures(cell)
          if (!cell.alignment)
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
          else cell.alignment = { ...cell.alignment, wrapText: true }
          if (alt && (!cell.fill || (cell.fill as { pattern?: string }).pattern !== 'solid')) {
            remplir(cell, GRIS_CLAIR)
          }
        }
        r++
      }

      // Numéro de semaine fusionné sur la colonne Sem.
      if (r - 1 >= premierR) {
        ws.mergeCells(premierR, 1, r - 1, 1)
        const cellSem = ws.getCell(premierR, 1)
        cellSem.value = `S${sem.num}`
        cellSem.font = { bold: true, size: 9, color: { argb: BLEU } }
        cellSem.alignment = { horizontal: 'center', vertical: 'middle' }
      }
    }

    // Totaux
    const rowT = ws.getRow(r)
    ws.mergeCells(r, 1, r, 2)
    rowT.getCell(1).value = 'TOTAL'
    let cT = 3
    for (const c of pivot.colonnes) {
      const tv = cumulColonne(pivot.avecVoie, c.voie, false)
      rowT.getCell(cT).value = formatDuree(tv.prevu)
      rowT.getCell(cT + 1).value = formatDuree(tv.reel)
      rowT.getCell(cT + 3).value = tv.delta !== null ? `${tv.delta.toFixed(0)} %` : '—'
      if (c.avecCat) {
        const tc = cumulColonne(pivot.avecVoie, c.voie, true)
        rowT.getCell(cT + 4).value = formatDuree(tc.reel)
        rowT.getCell(cT + 5).value = tc.delta !== null ? `${tc.delta.toFixed(0)} %` : '—'
      }
      cT += 4 + (c.avecCat ? 2 : 0)
    }
    for (let i = 1; i <= nbCols; i++) {
      const cell = rowT.getCell(i)
      cell.font = { bold: true, size: 9, color: { argb: BLANC } }
      remplir(cell, BLEU_FONCE)
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      bordures(cell)
    }
    r += 2

    // Note de calcul
    ws.mergeCells(r, 1, r, nbCols)
    const note = ws.getCell(r, 1)
    note.value =
      'Réel : du début réel au plus tardif entre la fin accordée (dernière ARF du RJ SNCF) et la restitution effective. ' +
      'Prévu voie : fenêtre ITC du marché. Prévu caténaire : ARF réelle de la voie + 30 min, fin accordée de la voie − 30 min.'
    note.font = { size: 8, italic: true, color: { argb: TEXTE_SECONDAIRE } }
    note.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    ws.getRow(r).height = 26
  }

  // ──── Onglet 2 : Liste (données brutes) ────
  const ws2 = wb.addWorksheet('Liste')
  const entetes = [
    'Date',
    'Sem.',
    'Voie',
    'Type',
    'Début prévu ITC',
    'Fin prévue ITC',
    'Début réel',
    'Fin accordée',
    'Restitution',
    'Fin comptabilisée',
    'Durée réelle',
    'Delta %',
    'Commentaire',
  ]
  const largeurs = [12, 6, 10, 10, 14, 14, 12, 12, 12, 15, 11, 9, 50]
  entetes.forEach((t, i) => {
    const cell = ws2.getCell(1, i + 1)
    cell.value = t
    cell.font = { bold: true, size: 9, color: { argb: BLANC } }
    remplir(cell, BLEU)
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    bordures(cell)
    ws2.getColumn(i + 1).width = largeurs[i]
  })
  ws2.views = [{ state: 'frozen', ySplit: 1 }]

  const tries = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  tries.forEach((e, idx) => {
    const row = ws2.getRow(2 + idx)
    const { dureeReelleMin, pourcentTemps } = calculsLigneARF(e)
    const estCat = e.typeFermeture === 'catenaire'
    const delta = estCat ? deltaCatenaire(e, tries) : pourcentTemps
    const dateObj = new Date(e.date.slice(0, 10))
    const valeurs: (string | number | null)[] = [
      dateObj.toLocaleDateString('fr-FR'),
      `S${(() => {
        const dd = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()))
        const jour = dd.getUTCDay() || 7
        dd.setUTCDate(dd.getUTCDate() + 4 - jour)
        const debut = new Date(Date.UTC(dd.getUTCFullYear(), 0, 1))
        return Math.ceil(((dd.getTime() - debut.getTime()) / 86400000 + 1) / 7)
      })()}`,
      e.voie || '—',
      estCat ? 'Caténaire' : 'Voie',
      e.heureDebutPrevue || '—',
      e.heureFinPrevue || '—',
      e.heureDebut || '—',
      e.heureFinAccordee || '—',
      e.heureRestituee || e.heureFin || '—',
      finComptabilisee(e) || '—',
      dureeReelleMin !== null ? formatDuree(dureeReelleMin) : '—',
      delta !== null ? `${delta.toFixed(0)} %` : '—',
      e.commentaire || '',
    ]
    valeurs.forEach((v, i) => {
      const cell = row.getCell(i + 1)
      cell.value = v
      cell.font = { size: 9 }
      cell.alignment = {
        horizontal: i === valeurs.length - 1 ? 'left' : 'center',
        vertical: 'middle',
      }
      bordures(cell)
      if (idx % 2 === 1) remplir(cell, GRIS_CLAIR)
      if (estCat && i === 3) cell.font = { size: 9, color: { argb: 'FFC26A32' } }
    })
  })

  // ──── Téléchargement ────
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const safeNom = projetName.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Suivi_ARF_${safeNom}_${dateStr}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
