'use client'

import { useState, useMemo, useRef } from 'react'
import { BulleEvenement } from './BulleEvenement'
import { FiltresFrise } from './FiltresFrise'
import { DialogEvenement } from './DialogEvenement'
import { CAT, type CategorieKey } from './categories'
import html2canvas from 'html2canvas'
import { useExportPDF } from '@/hooks/useExportPDF'
import { formatDateFR } from '@/lib/utils'

const LARGEUR_MOIS = 260
const MARGE_GAUCHE = 60
const Y_LIGNE = 225
const HAUTEUR_CONTENEUR_MIN = 400

const LARGEUR_BULLE = 185
const HAUTEUR_BULLE = 90
const MARGE_H = 10
const MARGE_V = 8
const QUEUE_H = 14

export interface PlacementBulle {
  id: string
  x: number
  y: number
  cote: 'haut' | 'bas'
  largeur: number
  hauteur: number
}

function estimerHauteur(titre: string, description?: string): number {
  const lignesTitre = Math.ceil(titre.length / 20)
  const lignesDesc = description ? Math.min(3, Math.ceil(description.length / 22)) : 0
  const hauteurDate = 18
  const hauteurTitre = lignesTitre * 16 + 4
  const hauteurDesc = lignesDesc > 0 ? lignesDesc * 14 + 10 : 0
  const padding = 14
  return Math.max(55, hauteurDate + hauteurTitre + hauteurDesc + padding)
}

function calculerPlacements(
  evenements: { id: string; titre: string; description?: string | null }[],
  positionsX: Record<string, number>,
  yLigne: number
): PlacementBulle[] {
  const placements: PlacementBulle[] = []
  const tries = [...evenements].sort(
    (a, b) => positionsX[a.id] - positionsX[b.id]
  )

  for (const ev of tries) {
    const x = positionsX[ev.id]
    const largeur = LARGEUR_BULLE
    const hauteur = estimerHauteur(ev.titre, ev.description ?? undefined)
    let placed = false

    for (const cote of ['haut', 'bas'] as const) {
      const yCandidat =
        cote === 'haut' ? yLigne - QUEUE_H - hauteur : yLigne + QUEUE_H

      const collision = placements.some(
        (p) =>
          p.cote === cote &&
          Math.abs(x - p.x) < (largeur + p.largeur) / 2 + MARGE_H &&
          Math.abs(yCandidat - p.y) < Math.max(hauteur, p.hauteur) + MARGE_V
      )

      if (!collision) {
        placements.push({ id: ev.id, x, y: yCandidat, cote, largeur, hauteur })
        placed = true
        break
      }
    }

    if (!placed) {
      // Empiler verticalement du cote le moins charge
      const chevauchants = placements.filter(
        (p) => Math.abs(p.x - x) < (largeur + p.largeur) / 2 + MARGE_H
      )
      const nbHaut = chevauchants.filter((p) => p.cote === 'haut').length
      const nbBas = chevauchants.filter((p) => p.cote === 'bas').length
      const cote = nbHaut <= nbBas ? 'haut' : 'bas'
      const memesCote = chevauchants.filter((p) => p.cote === cote)

      let y: number
      if (cote === 'haut') {
        const topMin =
          memesCote.length > 0
            ? Math.min(...memesCote.map((p) => p.y))
            : yLigne - QUEUE_H
        y = topMin - hauteur - MARGE_V
      } else {
        const bottomMax =
          memesCote.length > 0
            ? Math.max(...memesCote.map((p) => p.y + p.hauteur))
            : yLigne + QUEUE_H
        y = bottomMax + MARGE_V
      }

      placements.push({ id: ev.id, x, y, cote, largeur, hauteur })
    }
  }

  return placements
}

function calculerHauteurConteneur(placements: PlacementBulle[]): number {
  if (placements.length === 0) return HAUTEUR_CONTENEUR_MIN
  const topMin = Math.min(...placements.map((p) => p.y)) - 20
  const bottomMax = Math.max(...placements.map((p) => p.y + p.hauteur)) + 40
  return Math.max(HAUTEUR_CONTENEUR_MIN, bottomMax - topMin + 60)
}

interface FichierRow {
  id: string
  nom: string
  type: string
  taille: number
}

interface EvenementRow {
  id: string
  date: Date
  titre: string
  description: string | null
  categorie: string
  fichiers: FichierRow[]
}

interface FriseChronologiqueProps {
  evenements: EvenementRow[]
  projetId: string
  nomProjet: string
}

function dateVersX(
  date: Date,
  dateMin: Date,
  dateMax: Date,
  largeurTotale: number
): number {
  const totalMs = dateMax.getTime() - dateMin.getTime()
  if (totalMs === 0) return MARGE_GAUCHE + (largeurTotale - MARGE_GAUCHE * 2) / 2
  const offsetMs = date.getTime() - dateMin.getTime()
  return MARGE_GAUCHE + (offsetMs / totalMs) * (largeurTotale - MARGE_GAUCHE * 2)
}

function genererMois(dateMin: Date, dateMax: Date): Date[] {
  const mois: Date[] = []
  const current = new Date(dateMin.getFullYear(), dateMin.getMonth(), 1)
  const fin = new Date(dateMax.getFullYear(), dateMax.getMonth() + 1, 1)
  while (current <= fin) {
    mois.push(new Date(current))
    current.setMonth(current.getMonth() + 1)
  }
  return mois
}

export function FriseChronologique({
  evenements,
  projetId,
  nomProjet,
}: FriseChronologiqueProps) {
  const friseRef = useRef<HTMLDivElement>(null)
  const { exportAvecGuard, isExporting } = useExportPDF()

  const handleExportFrise = () =>
    exportAvecGuard(async () => {
      if (!friseRef.current) return
      const el = friseRef.current

      // Sauvegarder styles originaux
      const styleOriginal = {
        overflow: el.style.overflow,
        paddingTop: el.style.paddingTop,
        paddingBottom: el.style.paddingBottom,
        height: el.style.height,
      }

      // Calculer padding haut nécessaire (bulles qui dépassent en haut)
      const bulles = el.querySelectorAll('[data-bulle]')
      let topMin = 0
      bulles.forEach(b => {
        const relTop = b.getBoundingClientRect().top - el.getBoundingClientRect().top
        if (relTop < topMin) topMin = relTop
      })
      const paddingTop = Math.max(20, Math.ceil(-topMin) + 20)

      // Appliquer styles de capture
      el.style.overflow = 'visible'
      el.style.paddingTop = `${paddingTop}px`
      el.style.paddingBottom = '20px'
      el.style.height = 'auto'

      // Lever les clamps pour texte complet
      const clampEls = Array.from(el.querySelectorAll('[data-clamp]')) as HTMLElement[]
      const clampBackup = clampEls.map(c => ({
        el: c,
        overflow: c.style.overflow,
        display: c.style.display,
        webkitLineClamp: c.style.webkitLineClamp,
      }))
      clampEls.forEach(c => {
        c.style.overflow = 'visible'
        c.style.display = 'block'
        c.style.webkitLineClamp = 'unset'
        const bulle = c.closest('[data-bulle]') as HTMLElement | null
        if (bulle) bulle.style.height = 'auto'
      })

      // Attendre 2 frames pour recalcul DOM
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

      // Capturer
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      })

      // Restaurer styles et clamps
      el.style.overflow = styleOriginal.overflow
      el.style.paddingTop = styleOriginal.paddingTop
      el.style.paddingBottom = styleOriginal.paddingBottom
      el.style.height = styleOriginal.height

      clampBackup.forEach(({ el: c, overflow, display, webkitLineClamp }) => {
        c.style.overflow = overflow
        c.style.display = display
        c.style.webkitLineClamp = webkitLineClamp
        const bulle = c.closest('[data-bulle]') as HTMLElement | null
        if (bulle) bulle.style.height = ''
      })

      // Générer le PDF
      const jsPDFModule = await import('jspdf')
      const jsPDFCtor = jsPDFModule.default
      const pdf = new jsPDFCtor({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const PAGE_W = 297, PAGE_H = 210, MARGIN = 10, HEADER_H = 18, FOOTER_H = 8

      // En-tête VINCI
      pdf.setFillColor(0, 68, 137)
      pdf.rect(0, 0, PAGE_W, HEADER_H + MARGIN, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.setTextColor(255, 255, 255)
      pdf.text('JOURNAL DE CHANTIER — FRISE CHRONOLOGIQUE', PAGE_W / 2, MARGIN + 5, { align: 'center' })
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.text(nomProjet, PAGE_W / 2, MARGIN + 11, { align: 'center' })
      pdf.text(`Édité le ${formatDateFR(new Date())}`, PAGE_W - MARGIN, MARGIN + 5, { align: 'right' })

      // Zone frise
      const friseY = MARGIN + HEADER_H + 2
      const friseH = PAGE_H - friseY - FOOTER_H - 4
      const friseW = PAGE_W - MARGIN * 2

      const imgW_mm = (canvas.width / 2) / (96 / 25.4)
      const imgH_mm = (canvas.height / 2) / (96 / 25.4)
      const ratioW = friseW / imgW_mm
      const ratioH = friseH / imgH_mm
      const ratio = Math.min(ratioW, ratioH, 1)
      const finalW = imgW_mm * ratio
      const finalH = imgH_mm * ratio
      const imgY = friseY + (friseH - finalH) / 2

      const RATIO_MIN = 0.55
      if (ratio < RATIO_MIN) {
        // Pagination
        const nbPages = Math.ceil(imgW_mm / (friseW / RATIO_MIN))
        const trancheW_px = Math.ceil(canvas.width / nbPages)

        for (let i = 0; i < nbPages; i++) {
          if (i > 0) {
            pdf.addPage()
            pdf.setFillColor(0, 68, 137)
            pdf.rect(0, 0, PAGE_W, HEADER_H + MARGIN, 'F')
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(10)
            pdf.setTextColor(255, 255, 255)
            pdf.text(nomProjet, PAGE_W / 2, MARGIN + 7, { align: 'center' })
          }

          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = trancheW_px
          sliceCanvas.height = canvas.height
          const ctx = sliceCanvas.getContext('2d')
          ctx?.drawImage(canvas, -i * trancheW_px, 0)

          const sliceW_mm = (trancheW_px / 2) / (96 / 25.4)
          const sliceH_mm = (canvas.height / 2) / (96 / 25.4)
          const sliceRatio = Math.min(friseW / sliceW_mm, friseH / sliceH_mm)
          const sliceFinalW = sliceW_mm * sliceRatio
          const sliceFinalH = sliceH_mm * sliceRatio
          const sliceImgY = friseY + (friseH - sliceFinalH) / 2

          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', MARGIN, sliceImgY, sliceFinalW, sliceFinalH)

          pdf.setFillColor(0, 51, 112)
          pdf.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, 'F')
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(7)
          pdf.setTextColor(181, 171, 161)
          pdf.text(`Page ${i + 1} / ${nbPages}`, PAGE_W - MARGIN, PAGE_H - 2, { align: 'right' })
        }
      } else {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGIN, imgY, finalW, finalH)

        pdf.setFillColor(0, 51, 112)
        pdf.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, 'F')
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(181, 171, 161)
        pdf.text(nomProjet, MARGIN, PAGE_H - 2)
        pdf.text('Page 1 / 1', PAGE_W - MARGIN, PAGE_H - 2, { align: 'right' })
      }

      pdf.save(`frise-${nomProjet.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`)
    })
  const [filtresActifs, setFiltresActifs] = useState<Set<CategorieKey>>(
    () => new Set(Object.keys(CAT) as CategorieKey[])
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<{
    id: string
    date: string
    titre: string
    description: string
    categorie: string
    fichiers: FichierRow[]
  } | null>(null)

  function toggleFiltre(cat: CategorieKey) {
    setFiltresActifs((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  const evenementsFiltres = useMemo(
    () =>
      evenements.filter((ev) =>
        filtresActifs.has(ev.categorie as CategorieKey)
      ),
    [evenements, filtresActifs]
  )

  const { dateMin, dateMax, largeurTotale, moisLabels, placements, hauteurConteneur } =
    useMemo(() => {
      if (evenementsFiltres.length === 0) {
        const now = new Date()
        return {
          dateMin: now,
          dateMax: now,
          largeurTotale: LARGEUR_MOIS * 3,
          moisLabels: [] as { date: Date; x: number }[],
          placements: [] as PlacementBulle[],
          hauteurConteneur: HAUTEUR_CONTENEUR_MIN,
        }
      }

      const dates = evenementsFiltres.map((ev) => new Date(ev.date).getTime())
      const minMs = Math.min(...dates)
      const maxMs = Math.max(...dates)

      // Add 1 month padding on each side
      const dMin = new Date(minMs)
      dMin.setMonth(dMin.getMonth() - 1)
      const dMax = new Date(maxMs)
      dMax.setMonth(dMax.getMonth() + 1)

      const mois = genererMois(dMin, dMax)
      const totalWidth = Math.max(mois.length * LARGEUR_MOIS, 800)

      // Build positionsX map for the new algorithm
      const positionsX: Record<string, number> = {}
      for (const ev of evenementsFiltres) {
        positionsX[ev.id] = dateVersX(new Date(ev.date), dMin, dMax, totalWidth)
      }

      const placements = calculerPlacements(evenementsFiltres, positionsX, Y_LIGNE)
      const hauteurConteneur = calculerHauteurConteneur(placements)

      const moisLabels = mois.map((d) => ({
        date: d,
        x: dateVersX(d, dMin, dMax, totalWidth),
      }))

      return {
        dateMin: dMin,
        dateMax: dMax,
        largeurTotale: totalWidth,
        moisLabels,
        placements,
        hauteurConteneur,
      }
    }, [evenementsFiltres])

  // Build a lookup from event id to its placement
  const placementMap = useMemo(() => {
    const map = new Map<string, PlacementBulle>()
    for (const p of placements) {
      map.set(p.id, p)
    }
    return map
  }, [placements])

  function handleBulleClick(ev: EvenementRow) {
    setEditData({
      id: ev.id,
      date: new Date(ev.date).toISOString().slice(0, 10),
      titre: ev.titre,
      description: ev.description || '',
      categorie: ev.categorie,
      fichiers: ev.fichiers,
    })
    setDialogOpen(true)
  }

  // Helper to get category color by event id
  function getCatColor(evId: string): string {
    const ev = evenementsFiltres.find((e) => e.id === evId)
    if (!ev) return '#607D8B'
    const cat = CAT[ev.categorie as CategorieKey] || CAT.autre
    return cat.border
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <FiltresFrise actifs={filtresActifs} onToggle={toggleFiltre} />
        <button
          onClick={handleExportFrise}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm bg-[#F0F0F0] text-[#000000] border border-[#DCDCDC] hover:bg-[#E0E0E0] disabled:opacity-50"
        >
          {isExporting ? 'Génération...' : '📄 Export PDF'}
        </button>
      </div>

      <div
        className="overflow-x-auto border rounded-lg bg-white"
        style={{ height: hauteurConteneur }}
      >
        <div
          ref={friseRef}
          className="relative"
          style={{
            width: largeurTotale,
            height: hauteurConteneur,
            minWidth: '100%',
          }}
        >
          {/* Ligne horizontale centrale */}
          <div
            className="absolute"
            style={{
              top: Y_LIGNE,
              left: MARGE_GAUCHE,
              right: MARGE_GAUCHE,
              height: 3,
              backgroundColor: '#004489',
              borderRadius: 2,
            }}
          />

          {/* Labels des mois */}
          {moisLabels.map((m, i) => {
            const label = m.date.toLocaleDateString('fr-FR', {
              month: 'short',
              year: '2-digit',
            })
            return (
              <div
                key={i}
                className="absolute text-xs text-gray-500 font-medium"
                style={{
                  left: m.x,
                  top: Y_LIGNE + 12,
                  transform: 'translateX(-50%)',
                }}
              >
                {label}
              </div>
            )
          })}

          {/* Traits verticaux mois */}
          {moisLabels.map((m, i) => (
            <div
              key={`tick-${i}`}
              className="absolute"
              style={{
                left: m.x,
                top: Y_LIGNE - 4,
                width: 1,
                height: 8,
                backgroundColor: '#004489',
                opacity: 0.4,
              }}
            />
          ))}

          {/* Points sur la ligne */}
          {evenementsFiltres.map((ev) => {
            const placement = placementMap.get(ev.id)
            if (!placement) return null
            const cat = CAT[ev.categorie as CategorieKey] || CAT.autre
            return (
              <div
                key={`point-${ev.id}`}
                className="absolute rounded-full z-10"
                style={{
                  left: placement.x - 5,
                  top: Y_LIGNE - 4,
                  width: 10,
                  height: 10,
                  backgroundColor: cat.point,
                  border: '2px solid white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            )
          })}

          {/* SVG overlay pour les lignes de connexion bulle -> ligne */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {placements.map((p) => {
              const yBulle = p.cote === 'haut' ? p.y + p.hauteur : p.y
              return (
                <line
                  key={`line-${p.id}`}
                  x1={p.x}
                  y1={yBulle}
                  x2={p.x}
                  y2={Y_LIGNE}
                  stroke={getCatColor(p.id)}
                  strokeWidth={1.5}
                  strokeDasharray={
                    Math.abs(yBulle - Y_LIGNE) > 30 ? '4 3' : 'none'
                  }
                  opacity={0.7}
                />
              )
            })}
          </svg>

          {/* Bulles */}
          {evenementsFiltres.map((ev) => {
            const placement = placementMap.get(ev.id)
            if (!placement) return null
            return (
              <BulleEvenement
                key={ev.id}
                titre={ev.titre}
                description={ev.description}
                date={ev.date}
                categorie={ev.categorie}
                hasFichiers={ev.fichiers.length > 0}
                placement={placement}
                onClick={() => handleBulleClick(ev)}
              />
            )
          })}

          {/* Empty state */}
          {evenementsFiltres.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Aucun evenement a afficher avec les filtres actuels
            </div>
          )}
        </div>
      </div>

      <DialogEvenement
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projetId={projetId}
        evenement={editData}
      />
    </div>
  )
}
