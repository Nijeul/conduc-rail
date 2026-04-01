'use client'

import { resolveCatColors, type CouleursCatMap } from './categories'
import { FileText } from 'lucide-react'
import type { PlacementBulle } from './FriseChronologique'

interface BulleEvenementProps {
  titre: string
  description?: string | null
  date: Date
  categorie: string
  categorieId?: string | null
  categorieRef?: {
    couleurBg: string
    couleurBorder: string
    couleurText: string
    couleurPoint: string
    nom: string
    estSysteme: boolean
  } | null
  couleursCat?: CouleursCatMap
  hasFichiers: boolean
  placement: PlacementBulle
  onClick: () => void
}

export function BulleEvenement({
  titre,
  description,
  date,
  categorie,
  categorieId,
  categorieRef,
  couleursCat = {},
  hasFichiers,
  placement,
  onClick,
}: BulleEvenementProps) {
  const cat = resolveCatColors({ categorieId, categorie, categorieRef }, couleursCat)

  const dateStr = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })

  return (
    <div
      data-bulle="true"
      className="absolute cursor-pointer group"
      style={{
        left: placement.x - placement.largeur / 2,
        top: placement.y,
        width: placement.largeur,
      }}
      onClick={onClick}
    >
      {/* Bulle */}
      <div
        className="rounded-lg px-2.5 py-2 border shadow-sm transition-shadow group-hover:shadow-md"
        style={{
          backgroundColor: cat.bg,
          borderColor: cat.border,
          color: cat.text,
          minHeight: placement.hauteur,
        }}
      >
        <div className="font-bold" style={{ fontSize: 10 }}>
          {dateStr}
        </div>
        <div
          data-clamp="true"
          className="mt-0.5 leading-tight font-bold"
          style={{
            fontSize: 11,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {titre}
        </div>
        {description && description.trim() !== '' && (
          <div
            data-description="true"
            data-clamp="true"
            className="leading-tight"
            style={{
              fontSize: 10,
              opacity: 0.80,
              marginTop: 5,
              display: '-webkit-box',
              WebkitLineClamp: 10,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </div>
        )}
        {hasFichiers && (
          <FileText
            className="absolute bottom-1.5 right-1.5"
            style={{ width: 12, height: 12, color: cat.text, opacity: 0.65 }}
          />
        )}
      </div>
    </div>
  )
}
