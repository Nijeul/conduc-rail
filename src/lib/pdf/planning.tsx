import jsPDF from 'jspdf'

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Creneau {
  id: string
  debut: Date | string
  fin: Date | string
  effectif: number
  statut: string
}

interface ChantierEl {
  id: string
  libelle: string
  categorie: string | null
  couleur?: string | null
  estGroupe: boolean
  ordreAffichage: number
  dureePlanifieeMinutes: number
  creneaux: Creneau[]
}

interface OCPData {
  id: string
  nom: string
  version: string
  dateDebut: Date | string
  dateFin: Date | string
  dfvTotalMinutes: number
  statut: string
  chantiersElementaires: ChantierEl[]
}

interface PersonnelLink {
  id: string
  debut: Date | string
  fin: Date | string
  tableauService: {
    id: string
    titre: string
    entreprise: string | null
    semaine: number
    annee: number
    colonnes?: Array<{ id: string; nom: string; couleur: string }>
    lignes?: Array<{ id: string; libelle: string; bg: string; fg: string }>
    cellules?: Record<string, { personnelNom?: string; texte?: string; personnelTelephone?: string }>
  }
}

interface VehiculeData {
  type?: string
  designation?: string
  nombre?: number
  poidsEntrant?: number
  poidsSortant?: number
  longueur?: number
  freinage?: string
  traction?: string
}

interface TractionLink {
  id: string
  heureArrivee: Date | string
  heureDepart: Date | string
  label: string | null
  composition: {
    id: string
    titre: string | null
    date: Date | string | null
    sens: string
    vehicules: unknown
  }
}

export interface PlanningPDFData {
  ocp: OCPData
  nomProjet: string
  personnelLinks: PersonnelLink[]
  tractionLinks: TractionLink[]
  logoSociete?: string | null
  nomSociete?: string | null
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
const BLACK: [number, number, number] = [0, 0, 0]
const ORANGE: [number, number, number] = [255, 143, 0]

// A4 Landscape
const PAGE_W = 297
const PAGE_H = 210
const MARGIN = 10
const CONTENT_W = PAGE_W - 2 * MARGIN
const HEADER_H = 18
const FOOTER_H = 14
const CONTENT_TOP = HEADER_H + 4
const CONTENT_BOTTOM = PAGE_H - FOOTER_H

const COULEURS_CATEGORIE: Record<string, { label: string; couleur: string }> = {
  catenaire: { label: 'Caténaire', couleur: '#004489' },
  voie: { label: 'Voie', couleur: '#FF8F00' },
  procedure_sncf: { label: 'Procédure SNCF', couleur: '#E20025' },
  essais: { label: 'Essais', couleur: '#7AA536' },
  signalisation: { label: 'Signalisation', couleur: '#F2AB1B' },
  telecom: { label: 'Télécom', couleur: '#80B4FF' },
  energie: { label: 'Énergie', couleur: '#C26A32' },
  genie_civil: { label: 'Génie civil', couleur: '#A152E5' },
  autre: { label: 'Autre', couleur: '#5A5A5A' },
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function hexToRGB(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return [r, g, b]
}

function getChantierColor(ch: ChantierEl): [number, number, number] {
  if (ch.couleur) return hexToRGB(ch.couleur)
  if (ch.categorie) {
    const cat = COULEURS_CATEGORIE[ch.categorie]
    if (cat) return hexToRGB(cat.couleur)
  }
  return hexToRGB('#5A5A5A')
}

function formatDateRangeFR(debut: Date, fin: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const joursSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const d = new Date(debut)
  const f = new Date(fin)
  const dStr = `${joursSemaine[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}h${pad(d.getMinutes())}`
  const fStr = `${joursSemaine[f.getDay()]} ${pad(f.getDate())}/${pad(f.getMonth() + 1)} ${pad(f.getHours())}h${pad(f.getMinutes())}`
  return `${dStr} → ${fStr}`
}

function formatDFV(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${m.toString().padStart(2, '0')}`
}

interface TimeSlot {
  date: Date
  label: string
  dayLabel: string
}

function generateTimeSlots(dateDebut: Date, dateFin: Date): TimeSlot[] {
  const slots: TimeSlot[] = []
  const current = new Date(dateDebut)
  current.setSeconds(0, 0)
  const end = new Date(dateFin)
  const joursSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  while (current <= end) {
    const hh = current.getHours().toString().padStart(2, '0')
    const mm = current.getMinutes().toString().padStart(2, '0')
    const dayLabel = `${joursSemaine[current.getDay()]} ${current.getDate().toString().padStart(2, '0')}/${(current.getMonth() + 1).toString().padStart(2, '0')}`
    slots.push({
      date: new Date(current),
      label: `${hh}h${mm}`,
      dayLabel,
    })
    current.setMinutes(current.getMinutes() + 30)
  }
  return slots
}

function isCreneauActive(creneau: Creneau, slotStart: Date): boolean {
  const debut = new Date(creneau.debut)
  const fin = new Date(creneau.fin)
  const slotEnd = new Date(slotStart.getTime() + 30 * 60000)
  return (
    debut < slotEnd &&
    fin > slotStart &&
    (creneau.statut === 'planifie' || creneau.statut === 'realise')
  )
}

// ──────────────────────────────────────────────
// Header / Footer
// ──────────────────────────────────────────────

function drawHeader(
  doc: jsPDF,
  titre: string,
  version: string,
  logoBase64?: string | null,
  nomSociete?: string | null,
) {
  // Blue band
  doc.setFillColor(...VINCI_BLEU)
  doc.rect(0, 0, PAGE_W, HEADER_H, 'F')

  // Logo or brand text
  let logoEndX = MARGIN
  if (logoBase64 && (logoBase64.startsWith('data:image/png') || logoBase64.startsWith('data:image/jpeg'))) {
    try {
      doc.addImage(logoBase64, 'PNG', MARGIN, 2, 14, 14)
      logoEndX = MARGIN + 16
    } catch {
      // fallback to text
    }
  }
  if (logoEndX === MARGIN) {
    doc.setTextColor(...WHITE)
    doc.setFontSize(10)
    doc.setFont('Helvetica', 'bold')
    doc.text(nomSociete || 'CONDUC RAIL', MARGIN, 12)
    logoEndX = MARGIN + doc.getTextWidth(nomSociete || 'CONDUC RAIL') + 4
  }

  // Title center
  doc.setTextColor(...WHITE)
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'bold')
  const titleTrunc = titre.length > 70 ? titre.slice(0, 67) + '...' : titre
  doc.text(titleTrunc, PAGE_W / 2, 12, { align: 'center' })

  // Version badge right
  const badgeColor: [number, number, number] = version === 'BASE' ? VINCI_BLEU_DARK : [255, 143, 0]
  doc.setFillColor(...badgeColor)
  const badgeW = doc.getTextWidth(version) + 6
  doc.roundedRect(PAGE_W - MARGIN - badgeW, 5, badgeW, 9, 1.5, 1.5, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(7)
  doc.setFont('Helvetica', 'bold')
  doc.text(version, PAGE_W - MARGIN - badgeW / 2, 11, { align: 'center' })
}

function drawFooter(
  doc: jsPDF,
  pageNum: number,
  totalPages: number,
  nomSociete?: string | null,
  nomProjet?: string,
) {
  // Dark band
  doc.setFillColor(...VINCI_BLEU_DARK)
  doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, 'F')

  doc.setTextColor(...WHITE)
  doc.setFontSize(7)
  doc.setFont('Helvetica', 'normal')

  const label = [nomSociete || 'Conduc Rail', nomProjet].filter(Boolean).join(' — ')
  doc.text(label, MARGIN, PAGE_H - 5)
  doc.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 5, { align: 'right' })
}

// ──────────────────────────────────────────────
// Planning Grid Pages
// ──────────────────────────────────────────────

function drawPlanningPages(
  doc: jsPDF,
  ocp: OCPData,
  pageContents: { pages: number[] },
  logoBase64?: string | null,
  nomSociete?: string | null,
) {
  const dateDebut = new Date(ocp.dateDebut)
  const dateFin = new Date(ocp.dateFin)
  const slots = generateTimeSlots(dateDebut, dateFin)
  const slotCount = slots.length

  const sortedChantiers = [...ocp.chantiersElementaires].sort(
    (a, b) => a.ordreAffichage - b.ordreAffichage
  )

  // Layout constants
  const labelColW = 55
  const gridX = MARGIN + labelColW
  const gridW = CONTENT_W - labelColW
  const cellW = Math.min(gridW / slotCount, 6)
  const actualGridW = cellW * slotCount
  const rowH = 5
  const dayHeaderH = 6
  const hourHeaderH = 5
  const dfvRowH = 4
  const legendH = 8

  // How many chantier rows per page
  const headerZoneH = dayHeaderH + hourHeaderH + dfvRowH
  const availH = CONTENT_BOTTOM - CONTENT_TOP - headerZoneH - legendH - 6
  const rowsPerPage = Math.floor(availH / rowH)

  // Paginate chantiers
  const chantierPages: ChantierEl[][] = []
  for (let i = 0; i < sortedChantiers.length; i += rowsPerPage) {
    chantierPages.push(sortedChantiers.slice(i, i + rowsPerPage))
  }
  if (chantierPages.length === 0) chantierPages.push([])

  for (let p = 0; p < chantierPages.length; p++) {
    if (p > 0) doc.addPage('a4', 'landscape')
    pageContents.pages.push(1)

    drawHeader(doc, ocp.nom, ocp.version, logoBase64, nomSociete)

    let y = CONTENT_TOP

    // Sub-header: date range + DFV
    doc.setTextColor(...BLACK)
    doc.setFontSize(7)
    doc.setFont('Helvetica', 'normal')
    doc.text(formatDateRangeFR(dateDebut, dateFin), MARGIN, y + 3)
    doc.setFont('Helvetica', 'bold')
    doc.setTextColor(...VINCI_BLEU)
    doc.text(`DFV : ${formatDFV(ocp.dfvTotalMinutes)}`, MARGIN + 90, y + 3)
    y += 6

    // Day headers
    const dayGroups: { label: string; startIdx: number; endIdx: number }[] = []
    let curDay = ''
    let dayStart = 0
    for (let i = 0; i < slotCount; i++) {
      if (slots[i].dayLabel !== curDay) {
        if (curDay) dayGroups.push({ label: curDay, startIdx: dayStart, endIdx: i - 1 })
        curDay = slots[i].dayLabel
        dayStart = i
      }
    }
    if (curDay) dayGroups.push({ label: curDay, startIdx: dayStart, endIdx: slotCount - 1 })

    // Draw day header row
    doc.setFillColor(...VINCI_BLEU)
    doc.rect(MARGIN, y, labelColW, dayHeaderH, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(5)
    doc.setFont('Helvetica', 'bold')
    doc.text('Chantiers', MARGIN + 2, y + dayHeaderH - 1.5)

    for (const dg of dayGroups) {
      const x = gridX + dg.startIdx * cellW
      const w = (dg.endIdx - dg.startIdx + 1) * cellW
      doc.setFillColor(...VINCI_BLEU)
      doc.rect(x, y, w, dayHeaderH, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(4)
      doc.setFont('Helvetica', 'bold')
      const truncLabel = w > 20 ? dg.label : dg.label.slice(0, 3)
      doc.text(truncLabel, x + w / 2, y + dayHeaderH - 1.5, { align: 'center' })
    }
    y += dayHeaderH

    // Hour sub-header row
    doc.setFillColor(...VINCI_BLEU_DARK)
    doc.rect(MARGIN, y, labelColW, hourHeaderH, 'F')
    for (let i = 0; i < slotCount; i++) {
      const x = gridX + i * cellW
      doc.setFillColor(...VINCI_BLEU_DARK)
      doc.rect(x, y, cellW, hourHeaderH, 'F')
      // Only show hour label if cell is wide enough
      if (cellW >= 4) {
        doc.setTextColor(...WHITE)
        doc.setFontSize(2.5)
        doc.setFont('Helvetica', 'normal')
        doc.text(slots[i].label, x + cellW / 2, y + hourHeaderH - 1, { align: 'center' })
      }
    }
    y += hourHeaderH

    // DFV row
    doc.setFillColor(...WHITE)
    doc.rect(MARGIN, y, labelColW, dfvRowH, 'F')
    doc.setTextColor(...VINCI_BLEU_DARK)
    doc.setFontSize(4)
    doc.setFont('Helvetica', 'bold')
    doc.text('DFV', MARGIN + 2, y + dfvRowH - 1)

    const startMs = dateDebut.getTime()
    const stepMs = 30 * 60 * 1000

    // Compute DFV union
    const dfvSet = new Set<number>()
    for (const ch of ocp.chantiersElementaires) {
      for (const c of ch.creneaux) {
        if (c.statut === 'annule') continue
        const cDebut = new Date(c.debut).getTime()
        const cFin = new Date(c.fin).getTime()
        const s0 = Math.floor((cDebut - startMs) / stepMs)
        const s1 = Math.ceil((cFin - startMs) / stepMs)
        for (let j = s0; j < s1; j++) dfvSet.add(j)
      }
    }

    for (let i = 0; i < slotCount; i++) {
      const x = gridX + i * cellW
      if (dfvSet.has(i)) {
        doc.setFillColor(...VINCI_BLEU_DARK)
        doc.rect(x, y, cellW, dfvRowH, 'F')
      } else {
        doc.setDrawColor(...GREY_BORDER)
        doc.setLineWidth(0.1)
        doc.rect(x, y, cellW, dfvRowH)
      }
    }
    y += dfvRowH

    // Chantier rows
    const chantiers = chantierPages[p]
    for (const ch of chantiers) {
      const isGroup = ch.estGroupe
      const bgColor: [number, number, number] = isGroup ? GREY_LIGHT : WHITE

      // Label cell
      doc.setFillColor(...bgColor)
      doc.rect(MARGIN, y, labelColW, rowH, 'F')
      doc.setDrawColor(...GREY_BORDER)
      doc.setLineWidth(0.1)
      doc.rect(MARGIN, y, labelColW, rowH)

      doc.setTextColor(...BLACK)
      doc.setFontSize(isGroup ? 4 : 3.5)
      doc.setFont('Helvetica', isGroup ? 'bold' : 'normal')
      const truncLib = ch.libelle.length > 30 ? ch.libelle.slice(0, 27) + '...' : ch.libelle
      doc.text(truncLib, MARGIN + 1.5, y + rowH - 1.2)

      // Color indicator dot
      if (!isGroup) {
        const color = getChantierColor(ch)
        doc.setFillColor(...color)
        doc.circle(MARGIN + labelColW - 3, y + rowH / 2, 1, 'F')
      }

      // Slot cells
      const chColor = getChantierColor(ch)
      for (let i = 0; i < slotCount; i++) {
        const x = gridX + i * cellW
        const active = ch.creneaux.some((c) => isCreneauActive(c, slots[i].date))

        if (active) {
          doc.setFillColor(...chColor)
          doc.rect(x, y, cellW, rowH, 'F')
        } else if (isGroup) {
          doc.setFillColor(...GREY_LIGHT)
          doc.rect(x, y, cellW, rowH, 'F')
        }

        // Grid lines
        doc.setDrawColor(...GREY_BORDER)
        doc.setLineWidth(0.05)
        doc.rect(x, y, cellW, rowH)
      }

      y += rowH
    }

    // Legend at bottom
    y += 3
    doc.setFontSize(4)
    doc.setFont('Helvetica', 'bold')
    doc.setTextColor(...BLACK)
    doc.text('Légende :', MARGIN, y + 3)
    let legendX = MARGIN + 15
    for (const [, { label, couleur }] of Object.entries(COULEURS_CATEGORIE)) {
      const rgb = hexToRGB(couleur)
      doc.setFillColor(...rgb)
      doc.rect(legendX, y + 0.5, 3, 3, 'F')
      doc.setTextColor(...BLACK)
      doc.setFontSize(3.5)
      doc.setFont('Helvetica', 'normal')
      doc.text(label, legendX + 4, y + 3)
      legendX += doc.getTextWidth(label) + 8
    }
  }
}

// ──────────────────────────────────────────────
// Personnel Pages
// ──────────────────────────────────────────────

function drawPersonnelPages(
  doc: jsPDF,
  personnelLinks: PersonnelLink[],
  ocp: OCPData,
  pageContents: { pages: number[] },
  logoBase64?: string | null,
  nomSociete?: string | null,
) {
  if (personnelLinks.length === 0) return

  doc.addPage('a4', 'landscape')
  pageContents.pages.push(1)
  drawHeader(doc, `${ocp.nom} — PERSONNEL`, ocp.version, logoBase64, nomSociete)

  let y = CONTENT_TOP

  // Section title
  doc.setFillColor(...VINCI_BLEU)
  doc.rect(MARGIN, y, CONTENT_W, 8, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'bold')
  doc.text('PERSONNEL — TABLEAUX DE SERVICE', MARGIN + 4, y + 5.5)
  y += 12

  const dateDebut = new Date(ocp.dateDebut)
  const dateFin = new Date(ocp.dateFin)
  const startMs = dateDebut.getTime()
  const stepMs = 30 * 60 * 1000
  const slots = generateTimeSlots(dateDebut, dateFin)
  const slotCount = slots.length

  // Timeline bar area
  const labelW = 60
  const barAreaW = CONTENT_W - labelW
  const barX = MARGIN + labelW

  for (const link of personnelLinks) {
    // Check page overflow
    if (y + 30 > CONTENT_BOTTOM) {
      doc.addPage('a4', 'landscape')
      pageContents.pages.push(1)
      drawHeader(doc, `${ocp.nom} — PERSONNEL`, ocp.version, logoBase64, nomSociete)
      y = CONTENT_TOP + 4
    }

    const label = link.tableauService.titre
      || `S${link.tableauService.semaine} ${link.tableauService.annee}`

    // Label
    doc.setFillColor(...GREY_LIGHT)
    doc.rect(MARGIN, y, labelW, 7, 'F')
    doc.setTextColor(...BLACK)
    doc.setFontSize(5)
    doc.setFont('Helvetica', 'bold')
    const truncLabel = label.length > 35 ? label.slice(0, 32) + '...' : label
    doc.text(truncLabel, MARGIN + 2, y + 5)

    // Timeline bar background
    doc.setFillColor(...GREY_LIGHT)
    doc.rect(barX, y, barAreaW, 7, 'F')
    doc.setDrawColor(...GREY_BORDER)
    doc.setLineWidth(0.1)
    doc.rect(barX, y, barAreaW, 7)

    // Active bar
    const debutMs = new Date(link.debut).getTime()
    const finMs = new Date(link.fin).getTime()
    const totalMs = dateFin.getTime() - dateDebut.getTime()
    if (totalMs > 0) {
      const barStartPct = Math.max(0, (debutMs - startMs) / totalMs)
      const barEndPct = Math.min(1, (finMs - startMs) / totalMs)
      const bx = barX + barStartPct * barAreaW
      const bw = (barEndPct - barStartPct) * barAreaW
      if (bw > 0) {
        doc.setFillColor(...VINCI_BLEU)
        doc.roundedRect(bx, y + 1, bw, 5, 1, 1, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(3)
        doc.setFont('Helvetica', 'bold')
        if (bw > 15) {
          doc.text(label, bx + bw / 2, y + 4.5, { align: 'center' })
        }
      }
    }
    y += 8

    // Mini table: tableau de service content
    const ts = link.tableauService
    const colonnes = ts.colonnes || []
    const lignes = ts.lignes || []
    const cellules = ts.cellules || {}

    if (colonnes.length > 0 && lignes.length > 0) {
      const colW = Math.min(
        (CONTENT_W - 30) / (colonnes.length + 1),
        35
      )
      const posteW = 30
      const tableW = posteW + colonnes.length * colW
      const miniRowH = 5

      // Check if the mini-table fits on the page
      const tableH = (lignes.length + 1) * miniRowH + 2
      if (y + tableH > CONTENT_BOTTOM) {
        doc.addPage('a4', 'landscape')
        pageContents.pages.push(1)
        drawHeader(doc, `${ocp.nom} — PERSONNEL`, ocp.version, logoBase64, nomSociete)
        y = CONTENT_TOP + 4
      }

      // Column headers
      doc.setFillColor(...VINCI_BLEU)
      doc.rect(MARGIN + 4, y, posteW, miniRowH, 'F')
      doc.setTextColor(...WHITE)
      doc.setFontSize(3.5)
      doc.setFont('Helvetica', 'bold')
      doc.text('Poste', MARGIN + 4 + posteW / 2, y + miniRowH - 1.2, { align: 'center' })

      for (let ci = 0; ci < colonnes.length; ci++) {
        const cx = MARGIN + 4 + posteW + ci * colW
        const colColor = hexToRGB(colonnes[ci].couleur || '#004489')
        doc.setFillColor(...colColor)
        doc.rect(cx, y, colW, miniRowH, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(3)
        doc.setFont('Helvetica', 'bold')
        const colLabel = colonnes[ci].nom.length > 15 ? colonnes[ci].nom.slice(0, 12) + '...' : colonnes[ci].nom
        doc.text(colLabel, cx + colW / 2, y + miniRowH - 1.2, { align: 'center' })
      }
      y += miniRowH

      // Data rows
      for (let ri = 0; ri < lignes.length; ri++) {
        const rowBg: [number, number, number] = ri % 2 === 0 ? WHITE : GREY_LIGHT
        const ligne = lignes[ri]

        // Libelle cell
        const libBg = hexToRGB(ligne.bg || '#FFFFFF')
        doc.setFillColor(...libBg)
        doc.rect(MARGIN + 4, y, posteW, miniRowH, 'F')
        doc.setDrawColor(...GREY_BORDER)
        doc.setLineWidth(0.05)
        doc.rect(MARGIN + 4, y, posteW, miniRowH)
        const libFg = hexToRGB(ligne.fg || '#000000')
        doc.setTextColor(...libFg)
        doc.setFontSize(3)
        doc.setFont('Helvetica', 'bold')
        const libTrunc = ligne.libelle.length > 18 ? ligne.libelle.slice(0, 15) + '...' : ligne.libelle
        doc.text(libTrunc, MARGIN + 4 + 1, y + miniRowH - 1.2)

        // Data cells
        for (let ci = 0; ci < colonnes.length; ci++) {
          const cx = MARGIN + 4 + posteW + ci * colW
          doc.setFillColor(...rowBg)
          doc.rect(cx, y, colW, miniRowH, 'F')
          doc.setDrawColor(...GREY_BORDER)
          doc.setLineWidth(0.05)
          doc.rect(cx, y, colW, miniRowH)

          const key = `${ligne.id}|${colonnes[ci].id}`
          const cell = cellules[key]
          if (cell) {
            const nom = cell.personnelNom
              ? cell.texte
                ? `${cell.personnelNom} - ${cell.texte}`
                : cell.personnelNom
              : cell.texte || ''
            doc.setTextColor(...BLACK)
            doc.setFontSize(2.5)
            doc.setFont('Helvetica', 'normal')
            const nomTrunc = nom.length > 20 ? nom.slice(0, 17) + '...' : nom
            doc.text(nomTrunc, cx + colW / 2, y + miniRowH - 1.5, { align: 'center' })
          }
        }
        y += miniRowH
      }
      y += 4
    } else {
      y += 2
    }
  }
}

// ──────────────────────────────────────────────
// Vehicle Drawing Helper (jsPDF shapes)
// ──────────────────────────────────────────────

function drawVehicule(pdf: jsPDF, x: number, y: number, w: number, h: number, type: string, designation: string) {
  const VEHICULE_COLORS: Record<string, string> = {
    Loco: '#E65100',
    Ballastiere: '#7D3520',
    Bigrue: '#7B1FA2',
    BML: '#E91E63',
    Regaleuse: '#9E9D24',
    Stabilisateur: '#0277BD',
    Wagon: '#5A5A5A',
    WagonLRS: '#E65100',
  }

  // Normalize type for lookup
  const typeKey = Object.keys(VEHICULE_COLORS).find(
    (k) => k.toLowerCase() === (type || '').toLowerCase()
  ) || 'Wagon'
  const couleur = VEHICULE_COLORS[typeKey] ?? '#5A5A5A'
  const rgb = hexToRGB(couleur)

  // Fond du vehicule
  pdf.setFillColor(...rgb)

  const tLower = (type || '').toLowerCase()

  if (tLower === 'loco') {
    // Locomotive: capot bas + cabine surelevee a droite
    pdf.rect(x, y + h * 0.3, w * 0.65, h * 0.7, 'F')       // capot
    pdf.rect(x + w * 0.6, y, w * 0.4, h, 'F')               // cabine
    // Fenetres cabine
    pdf.setFillColor(179, 229, 252) // #B3E5FC
    pdf.rect(x + w * 0.65, y + h * 0.15, w * 0.15, h * 0.25, 'F')
    pdf.rect(x + w * 0.82, y + h * 0.15, w * 0.15, h * 0.25, 'F')
  } else if (tLower === 'ballastiere') {
    // Trapezoidal hopper shape
    const x1 = x + w * 0.1, x2 = x + w * 0.9
    const x3 = x + w * 0.2, x4 = x + w * 0.8
    pdf.triangle(x1, y, x2, y, x4, y + h, 'F')
    pdf.triangle(x1, y, x3, y + h, x4, y + h, 'F')
  } else if (tLower === 'bigrue') {
    // Base plate + two cabins + pylone central
    pdf.rect(x, y + h * 0.5, w, h * 0.5, 'F')               // plateforme
    pdf.rect(x, y + h * 0.1, w * 0.22, h * 0.45, 'F')       // cabine gauche
    pdf.rect(x + w * 0.78, y + h * 0.1, w * 0.22, h * 0.45, 'F') // cabine droite
    // Pylone
    const darkerRgb = hexToRGB('#4A148C')
    pdf.setFillColor(...darkerRgb)
    pdf.rect(x + w * 0.44, y, w * 0.12, h * 0.55, 'F')
    // Fenetres
    pdf.setFillColor(179, 229, 252)
    pdf.rect(x + w * 0.04, y + h * 0.2, w * 0.08, h * 0.15, 'F')
    pdf.rect(x + w * 0.88, y + h * 0.2, w * 0.08, h * 0.15, 'F')
  } else if (tLower === 'bml') {
    // Base + two cabins + picots centraux
    pdf.rect(x, y + h * 0.5, w, h * 0.5, 'F')
    pdf.rect(x, y + h * 0.1, w * 0.22, h * 0.45, 'F')
    pdf.rect(x + w * 0.78, y + h * 0.1, w * 0.22, h * 0.45, 'F')
    const darkerRgb = hexToRGB('#C2185B')
    pdf.setFillColor(...darkerRgb)
    // Petites dents de bourrage
    for (let i = 0; i < 4; i++) {
      pdf.rect(x + w * 0.28 + i * w * 0.13, y + h * 0.4, w * 0.04, h * 0.3, 'F')
    }
    // Fenetres
    pdf.setFillColor(179, 229, 252)
    pdf.rect(x + w * 0.04, y + h * 0.2, w * 0.08, h * 0.15, 'F')
    pdf.rect(x + w * 0.88, y + h * 0.2, w * 0.08, h * 0.15, 'F')
  } else if (tLower === 'regaleuse') {
    // Base + cabine centrale + ailerons
    pdf.rect(x, y + h * 0.5, w, h * 0.5, 'F')
    // Ailerons rouges
    const redRgb = hexToRGB('#E20025')
    pdf.setFillColor(...redRgb)
    pdf.rect(x + w * 0.08, y + h * 0.5, w * 0.22, h * 0.3, 'F')
    pdf.rect(x + w * 0.70, y + h * 0.5, w * 0.22, h * 0.3, 'F')
    // Cabine centrale
    const cabRgb = hexToRGB('#CDDC39')
    pdf.setFillColor(...cabRgb)
    pdf.rect(x + w * 0.30, y + h * 0.1, w * 0.40, h * 0.45, 'F')
    // Fenetres
    pdf.setFillColor(179, 229, 252)
    pdf.rect(x + w * 0.34, y + h * 0.2, w * 0.12, h * 0.15, 'F')
    pdf.rect(x + w * 0.54, y + h * 0.2, w * 0.12, h * 0.15, 'F')
  } else if (tLower === 'stabilisateur') {
    // Base + two cabins + rouleaux centraux
    pdf.rect(x, y + h * 0.5, w, h * 0.5, 'F')
    pdf.rect(x, y + h * 0.1, w * 0.22, h * 0.45, 'F')
    pdf.rect(x + w * 0.78, y + h * 0.1, w * 0.22, h * 0.45, 'F')
    // Rouleaux (ellipses simulees par petits rectangles arrondis)
    const darkRgb = hexToRGB('#01579B')
    pdf.setFillColor(...darkRgb)
    for (let i = 0; i < 3; i++) {
      pdf.roundedRect(x + w * 0.28 + i * w * 0.17, y + h * 0.55, w * 0.12, h * 0.25, 1, 1, 'F')
    }
    // Fenetres
    pdf.setFillColor(179, 229, 252)
    pdf.rect(x + w * 0.04, y + h * 0.2, w * 0.08, h * 0.15, 'F')
    pdf.rect(x + w * 0.88, y + h * 0.2, w * 0.08, h * 0.15, 'F')
  } else if (tLower === 'wagonlrs') {
    // Wagon LRS: plateforme + rails longs depasses
    pdf.roundedRect(x, y + h * 0.35, w, h * 0.65, 1, 1, 'F')
    // Rails longs qui depassent
    const railRgb = hexToRGB('#90A4AE')
    pdf.setFillColor(...railRgb)
    pdf.rect(x - w * 0.05, y + h * 0.3, w * 1.1, h * 0.08, 'F')
    pdf.rect(x - w * 0.05, y + h * 0.45, w * 1.1, h * 0.08, 'F')
    // Serre-rails
    const clampRgb = hexToRGB('#455A64')
    pdf.setFillColor(...clampRgb)
    pdf.rect(x + w * 0.2, y + h * 0.25, w * 0.04, h * 0.35, 'F')
    pdf.rect(x + w * 0.76, y + h * 0.25, w * 0.04, h * 0.35, 'F')
  } else {
    // Wagon standard: simple rectangle avec bord arrondi
    pdf.roundedRect(x, y + h * 0.2, w, h * 0.8, 1, 1, 'F')
    // Rebords
    pdf.setDrawColor(...hexToRGB('#5A5A5A'))
    pdf.setLineWidth(0.2)
    pdf.roundedRect(x, y + h * 0.2, w, h * 0.8, 1, 1, 'S')
  }

  // Roues (2 cercles en bas)
  pdf.setFillColor(38, 50, 56) // #263238
  const wheelR = Math.min(2, h * 0.12)
  pdf.circle(x + w * 0.2, y + h - wheelR * 0.3, wheelR, 'F')
  pdf.circle(x + w * 0.8, y + h - wheelR * 0.3, wheelR, 'F')

  // Attelages (petits rectangles aux extremites)
  pdf.setFillColor(90, 90, 90)
  pdf.rect(x - 1, y + h * 0.6, 1.5, h * 0.15, 'F')
  pdf.rect(x + w - 0.5, y + h * 0.6, 1.5, h * 0.15, 'F')

  // Designation sous le vehicule
  pdf.setFontSize(3.5)
  pdf.setTextColor(90, 90, 90)
  const label = designation.length > 12 ? designation.slice(0, 10) + '...' : designation
  pdf.text(label, x + w / 2, y + h + 3, { align: 'center' })
}

function formatHeurePDF(dateStr: Date | string): string {
  const d = new Date(dateStr)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}h${mm}`
}

// ──────────────────────────────────────────────
// Traction Pages
// ──────────────────────────────────────────────

function drawTractionPages(
  doc: jsPDF,
  tractionLinks: TractionLink[],
  ocp: OCPData,
  pageContents: { pages: number[] },
  logoBase64?: string | null,
  nomSociete?: string | null,
) {
  if (tractionLinks.length === 0) return

  doc.addPage('a4', 'landscape')
  pageContents.pages.push(1)
  drawHeader(doc, `${ocp.nom} — TRACTION`, ocp.version, logoBase64, nomSociete)

  let y = CONTENT_TOP

  // Section title
  doc.setFillColor(...ORANGE)
  doc.rect(MARGIN, y, CONTENT_W, 8, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(9)
  doc.setFont('Helvetica', 'bold')
  doc.text('TRACTION — COMPOSITIONS DE TRAINS', MARGIN + 4, y + 5.5)
  y += 12

  const dateDebut = new Date(ocp.dateDebut)
  const dateFin = new Date(ocp.dateFin)
  const startMs = dateDebut.getTime()
  const totalMs = dateFin.getTime() - dateDebut.getTime()

  const labelW = 60
  const barAreaW = CONTENT_W - labelW
  const barX = MARGIN + labelW

  for (const link of tractionLinks) {
    const vehicules = Array.isArray(link.composition.vehicules)
      ? (link.composition.vehicules as VehiculeData[])
      : []

    // Estimate how much space we need (vehicule shapes are taller)
    const neededH = 18 + Math.max(10, vehicules.length * 7 + 28)

    if (y + neededH > CONTENT_BOTTOM) {
      doc.addPage('a4', 'landscape')
      pageContents.pages.push(1)
      drawHeader(doc, `${ocp.nom} — TRACTION`, ocp.version, logoBase64, nomSociete)
      y = CONTENT_TOP + 4
    }

    const displayLabel = link.label || link.composition.titre || 'Train'

    // Label
    doc.setFillColor(...GREY_LIGHT)
    doc.rect(MARGIN, y, labelW, 7, 'F')
    doc.setTextColor(...BLACK)
    doc.setFontSize(5)
    doc.setFont('Helvetica', 'bold')
    const truncLabel = displayLabel.length > 35 ? displayLabel.slice(0, 32) + '...' : displayLabel
    doc.text(truncLabel, MARGIN + 2, y + 5)

    // --- Correction 2: Heures arrivee/depart au-dessus de la barre ---
    const heureArrivee = formatHeurePDF(link.heureArrivee)
    const heureDepart = formatHeurePDF(link.heureDepart)
    doc.setFontSize(5)
    doc.setTextColor(90, 90, 90)
    doc.setFont('Helvetica', 'normal')
    doc.text(`Arrivée ${heureArrivee}`, barX, y - 1)
    doc.text(`Départ ${heureDepart}`, barX + barAreaW, y - 1, { align: 'right' })

    // Timeline bar background
    doc.setFillColor(...GREY_LIGHT)
    doc.rect(barX, y, barAreaW, 7, 'F')
    doc.setDrawColor(...GREY_BORDER)
    doc.setLineWidth(0.1)
    doc.rect(barX, y, barAreaW, 7)

    // Active bar
    if (totalMs > 0) {
      const arriveeMs = new Date(link.heureArrivee).getTime()
      const departMs = new Date(link.heureDepart).getTime()
      const barStartPct = Math.max(0, (arriveeMs - startMs) / totalMs)
      const barEndPct = Math.min(1, (departMs - startMs) / totalMs)
      const bx = barX + barStartPct * barAreaW
      const bw = (barEndPct - barStartPct) * barAreaW
      if (bw > 0) {
        doc.setFillColor(...ORANGE)
        doc.roundedRect(bx, y + 1, bw, 5, 1, 1, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(3)
        doc.setFont('Helvetica', 'bold')
        if (bw > 15) {
          doc.text(displayLabel, bx + bw / 2, y + 4.5, { align: 'center' })
        }
      }
    }
    y += 9

    // --- Correction 1 & 3: Vehicules realistes avec badge xN ---
    if (vehicules.length > 0) {
      // Visual rame line with realistic vehicle shapes
      const vehH = 12
      const vehW = Math.min(22, (CONTENT_W - 20) / vehicules.length)
      let bx2 = MARGIN + 4
      for (const v of vehicules) {
        drawVehicule(doc, bx2, y, vehW - 2, vehH, v.type || 'Wagon', v.designation || v.type || '')

        // Badge xN (circle en haut a droite)
        if (v.nombre && v.nombre > 1) {
          doc.setFillColor(38, 50, 56) // #263238
          doc.circle(bx2 + vehW - 3, y + 1, 3, 'F')
          doc.setFontSize(5)
          doc.setTextColor(255, 255, 255)
          doc.text(`\u00d7${v.nombre}`, bx2 + vehW - 3, y + 2.5, { align: 'center' })
        }

        bx2 += vehW
      }
      y += vehH + 5

      // Summary table
      const cols = ['Type', 'Désignation', 'Nb', 'P.Ent (t)', 'P.Sort (t)', 'Long (m)']
      const colWidths = [22, 40, 10, 18, 18, 18]
      const tblRowH = 4.5
      const tblX = MARGIN + 4

      // Table header
      for (let ci = 0; ci < cols.length; ci++) {
        let cx = tblX
        for (let j = 0; j < ci; j++) cx += colWidths[j]
        doc.setFillColor(...VINCI_BLEU)
        doc.rect(cx, y, colWidths[ci], tblRowH, 'F')
        doc.setTextColor(...WHITE)
        doc.setFontSize(3)
        doc.setFont('Helvetica', 'bold')
        doc.text(cols[ci], cx + colWidths[ci] / 2, y + tblRowH - 1, { align: 'center' })
      }
      y += tblRowH

      // Table rows
      for (let vi = 0; vi < vehicules.length; vi++) {
        const v = vehicules[vi]
        const rowBg: [number, number, number] = vi % 2 === 0 ? WHITE : GREY_LIGHT
        const values = [
          v.type || '',
          v.designation || '',
          String(v.nombre ?? 1),
          v.poidsEntrant != null ? String(v.poidsEntrant) : '',
          v.poidsSortant != null ? String(v.poidsSortant) : '',
          v.longueur != null ? String(v.longueur) : '',
        ]

        for (let ci = 0; ci < cols.length; ci++) {
          let cx = tblX
          for (let j = 0; j < ci; j++) cx += colWidths[j]
          doc.setFillColor(...rowBg)
          doc.rect(cx, y, colWidths[ci], tblRowH, 'F')
          doc.setDrawColor(...GREY_BORDER)
          doc.setLineWidth(0.05)
          doc.rect(cx, y, colWidths[ci], tblRowH)
          doc.setTextColor(...BLACK)
          doc.setFontSize(3)
          doc.setFont('Helvetica', 'normal')
          const valTrunc = values[ci].length > 22 ? values[ci].slice(0, 19) + '...' : values[ci]
          doc.text(valTrunc, cx + colWidths[ci] / 2, y + tblRowH - 1.2, { align: 'center' })
        }
        y += tblRowH
      }

      // Freinage / Traction badges
      y += 1
      let badgeX = MARGIN + 4
      for (const v of vehicules) {
        if (v.freinage) {
          doc.setFillColor(122, 165, 54) // vert
          const bw = doc.getTextWidth(v.freinage) * 1.2 + 4
          doc.roundedRect(badgeX, y, Math.max(bw, 12), 4, 1, 1, 'F')
          doc.setTextColor(...WHITE)
          doc.setFontSize(2.5)
          doc.setFont('Helvetica', 'bold')
          doc.text(v.freinage, badgeX + Math.max(bw, 12) / 2, y + 2.8, { align: 'center' })
          badgeX += Math.max(bw, 12) + 2
        }
        if (v.traction) {
          doc.setFillColor(...VINCI_BLEU)
          const bw = doc.getTextWidth(v.traction) * 1.2 + 4
          doc.roundedRect(badgeX, y, Math.max(bw, 12), 4, 1, 1, 'F')
          doc.setTextColor(...WHITE)
          doc.setFontSize(2.5)
          doc.setFont('Helvetica', 'bold')
          doc.text(v.traction, badgeX + Math.max(bw, 12) / 2, y + 2.8, { align: 'center' })
          badgeX += Math.max(bw, 12) + 2
        }
      }
      y += 7
    } else {
      doc.setTextColor(...TEXT_MUTED)
      doc.setFontSize(4)
      doc.setFont('Helvetica', 'italic')
      doc.text('Aucun véhicule dans cette composition', MARGIN + 4, y + 3)
      y += 7
    }

    // Separator line
    doc.setDrawColor(...GREY_BORDER)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y)
    y += 4
  }
}

// ──────────────────────────────────────────────
// Main Export Function
// ──────────────────────────────────────────────

export async function generatePlanningPDF(data: PlanningPDFData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const pageContents: { pages: number[] } = { pages: [] }

  // Page 1+: Planning grid
  drawPlanningPages(doc, data.ocp, pageContents, data.logoSociete, data.nomSociete)

  // Personnel pages
  drawPersonnelPages(doc, data.personnelLinks, data.ocp, pageContents, data.logoSociete, data.nomSociete)

  // Traction pages
  drawTractionPages(doc, data.tractionLinks, data.ocp, pageContents, data.logoSociete, data.nomSociete)

  // Draw footers on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    drawFooter(doc, i, totalPages, data.nomSociete, data.nomProjet)
  }

  // Download
  const safeNomProjet = data.nomProjet.replace(/[^a-zA-Z0-9àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ _-]/g, '').replace(/\s+/g, '_')
  const safeNomOCP = data.ocp.nom.replace(/[^a-zA-Z0-9àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ _-]/g, '').replace(/\s+/g, '_')
  doc.save(`Planning_${safeNomProjet}_${safeNomOCP}.pdf`)
}
