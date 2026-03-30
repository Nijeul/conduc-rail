'use client'

import { COULEURS_TYPE_MATERIEL } from '../materiel/constants'
import { getSVGMateriel } from '@/lib/materiel-svgs'

interface Vehicule {
  id: string
  type: string
  designation: string
  nombre: number
}

interface RameVisualProps {
  vehicules: Vehicule[]
  selectedIdx: number | null
  onSelect: (idx: number | null) => void
}

export function RameVisual({ vehicules, selectedIdx, onSelect }: RameVisualProps) {
  if (vehicules.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-400 text-sm">
        Aucun vehicule
      </div>
    )
  }

  return (
    <div className="flex items-end gap-1 overflow-x-auto pb-1" style={{ minHeight: '100px' }}>
      {vehicules.map((v, i) => {
        const bgColor = COULEURS_TYPE_MATERIEL[v.type] || '#546E7A'
        const nombre = v.nombre || 1
        const isSelected = selectedIdx === i
        const svgContent = getSVGMateriel(v.type, v.designation)

        return (
          <div
            key={v.id}
            onClick={() => onSelect(selectedIdx === i ? null : i)}
            className={`relative flex flex-col items-center cursor-pointer transition-all shrink-0 ${
              isSelected ? 'ring-2 ring-[#0D47A1] ring-offset-1 rounded' : ''
            }`}
            style={{ width: '130px' }}
          >
            {/* SVG ou fallback colore */}
            <div
              className="relative rounded overflow-hidden"
              style={{ width: '130px', height: '80px' }}
            >
              {svgContent ? (
                <div
                  className="w-full h-full flex items-center justify-center bg-white/5"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center rounded"
                  style={{ backgroundColor: bgColor }}
                >
                  <span className="text-white text-[10px] font-bold leading-tight">
                    {v.type}
                  </span>
                </div>
              )}

              {/* Badge xN en haut a droite */}
              {nombre > 1 && (
                <div
                  className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white text-[10px] font-bold"
                  style={{
                    backgroundColor: '#263238',
                    minWidth: '22px',
                    height: '22px',
                    padding: '0 4px',
                  }}
                >
                  &times;{nombre}
                </div>
              )}
            </div>

            {/* Label designation sous le bloc */}
            <span className="text-[9px] text-gray-600 leading-tight truncate max-w-[130px] mt-0.5 text-center px-0.5">
              {v.designation
                ? v.designation.length > 18
                  ? v.designation.substring(0, 18) + '...'
                  : v.designation
                : v.type}
            </span>
          </div>
        )
      })}
    </div>
  )
}
