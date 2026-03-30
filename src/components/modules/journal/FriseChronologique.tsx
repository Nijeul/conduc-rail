'use client'

import { useState, useMemo, useRef } from 'react'
import { BulleEvenement } from './BulleEvenement'
import { FiltresFrise } from './FiltresFrise'
import { DialogEvenement } from './DialogEvenement'
import { CAT, type CategorieKey } from './categories'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useExportPDF } from '@/hooks/useExportPDF'
import { formatDateFR } from '@/lib/utils'

const LARGEUR_MOIS = 260
const MARGE_GAUCHE = 60
const Y_LIGNE = 225
const HAUTEUR_CONTENEUR_MIN = 400

const LARGEUR_BULLE = 165
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

function estimerHauteur(titre: string): number {
  const lignes = Math.ceil(titre.length / 22)
  return Math.min(28 + lignes * 16, HAUTEUR_BULLE)
}

function calculerPlacements(
  evenements: { id: string; titre: string }[],
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
    const hauteur = estimerHauteur(ev.titre)
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

      const canvas = await html2canvas(friseRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: friseRef.current.scrollWidth,
        height: friseRef.current.scrollHeight,
      })

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const PAGE_W = 297, PAGE_H = 210, MARGIN = 10, HEADER_H = 18, FOOTER_H = 8

      // En-tete
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      pdf.setTextColor(26, 35, 126)
      pdf.text('JOURNAL DE CHANTIER — FRISE CHRONOLOGIQUE', PAGE_W / 2, MARGIN + 6, { align: 'center' })
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(84, 110, 122)
      pdf.text(nomProjet, PAGE_W / 2, MARGIN + 12, { align: 'center' })
      pdf.text(`Édité le ${formatDateFR(new Date())}`, PAGE_W - MARGIN, MARGIN + 6, { align: 'right' })
      pdf.setDrawColor(207, 216, 220)
      pdf.setLineWidth(0.3)
      pdf.line(MARGIN, MARGIN + HEADER_H, PAGE_W - MARGIN, MARGIN + HEADER_H)

      // Zone frise
      const friseY = MARGIN + HEADER_H + 3
      const friseH = PAGE_H - MARGIN - HEADER_H - FOOTER_H - 6
      const friseW = PAGE_W - MARGIN * 2

      const imgData = canvas.toDataURL('image/png')
      const ratioW = friseW / (canvas.width / 2)
      const ratioH = friseH / (canvas.height / 2)
      const ratio = Math.min(ratioW, ratioH)
      const imgFinalW = (canvas.width / 2) * ratio
      const imgFinalH = (canvas.height / 2) * ratio
      const imgY = friseY + (friseH - imgFinalH) / 2

      pdf.addImage(imgData, 'PNG', MARGIN, imgY, imgFinalW, imgFinalH)

      // Pied de page
      pdf.setDrawColor(207, 216, 220)
      pdf.line(MARGIN, PAGE_H - FOOTER_H, PAGE_W - MARGIN, PAGE_H - FOOTER_H)
      pdf.setFontSize(7)
      pdf.setTextColor(176, 190, 197)
      pdf.text(nomProjet, MARGIN, PAGE_H - FOOTER_H + 4)
      pdf.text('Page 1 / 1', PAGE_W - MARGIN, PAGE_H - FOOTER_H + 4, { align: 'right' })

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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm bg-[#37474F] text-[#ECEFF1] hover:bg-[#455A64] disabled:opacity-50"
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
              backgroundColor: '#1A237E',
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
                backgroundColor: '#1A237E',
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
