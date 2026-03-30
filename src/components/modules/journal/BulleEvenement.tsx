'use client'

import { CAT, type CategorieKey } from './categories'
import { FileText } from 'lucide-react'
import type { PlacementBulle } from './FriseChronologique'

interface BulleEvenementProps {
  titre: string
  description?: string | null
  date: Date
  categorie: string
  hasFichiers: boolean
  placement: PlacementBulle
  onClick: () => void
}

export function BulleEvenement({
  titre,
  description,
  date,
  categorie,
  hasFichiers,
  placement,
  onClick,
}: BulleEvenementProps) {
  const cat = CAT[categorie as CategorieKey] || CAT.autre

  const dateStr = new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })

  return (
    <div
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
            className="leading-tight"
            style={{
              fontSize: 10,
              opacity: 0.85,
              borderTop: `1px solid ${cat.border}`,
              paddingTop: 3,
              marginTop: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </div>
        )}
        {hasFichiers && (
          <FileText
            className="absolute bottom-1.5 right-1.5 opacity-50"
            style={{ width: 12, height: 12, color: cat.text }}
          />
        )}
      </div>
    </div>
  )
}
