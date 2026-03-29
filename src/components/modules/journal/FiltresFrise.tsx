'use client'

import { CAT, type CategorieKey } from './categories'

interface FiltresFriseProps {
  actifs: Set<CategorieKey>
  onToggle: (cat: CategorieKey) => void
}

export function FiltresFrise({ actifs, onToggle }: FiltresFriseProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {(Object.entries(CAT) as [CategorieKey, (typeof CAT)[CategorieKey]][]).map(
        ([key, cat]) => {
          const isActive = actifs.has(key)
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
              style={
                isActive
                  ? {
                      backgroundColor: cat.bg,
                      borderColor: cat.border,
                      color: cat.text,
                    }
                  : {
                      backgroundColor: '#f5f5f5',
                      borderColor: '#e0e0e0',
                      color: '#9e9e9e',
                    }
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: isActive ? cat.point : '#bdbdbd',
                }}
              />
              {cat.label}
            </button>
          )
        }
      )}
    </div>
  )
}
