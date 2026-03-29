'use client'

import { COULEURS_TYPE_MATERIEL } from '../materiel/constants'

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
      <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
        Aucun vehicule
      </div>
    )
  }

  return (
    <div className="flex items-end gap-1 overflow-x-auto pb-1" style={{ minHeight: '88px' }}>
      {vehicules.map((v, i) => {
        const bgColor = COULEURS_TYPE_MATERIEL[v.type] || '#546E7A'
        const nombre = v.nombre || 1
        const widthPx = Math.max(nombre * 60, 60)
        const isSelected = selectedIdx === i

        return (
          <div
            key={v.id}
            onClick={() => onSelect(selectedIdx === i ? null : i)}
            className={`relative flex flex-col items-center justify-center rounded cursor-pointer transition-all shrink-0 ${
              isSelected ? 'ring-2 ring-[#0D47A1] ring-offset-1' : ''
            }`}
            style={{
              backgroundColor: bgColor,
              width: `${widthPx}px`,
              height: '80px',
            }}
          >
            <span className="text-white text-[10px] font-bold leading-tight">
              {v.type}
            </span>
            {v.designation && (
              <span className="text-white/80 text-[9px] leading-tight truncate max-w-full px-1">
                {v.designation.length > 12
                  ? v.designation.substring(0, 12) + '...'
                  : v.designation}
              </span>
            )}
            <span className="text-white/90 text-[10px] font-medium">
              x{nombre}
            </span>
          </div>
        )
      })}
    </div>
  )
}
