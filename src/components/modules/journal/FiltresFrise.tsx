'use client'

import type { CategorieRow } from './categories'

interface FiltresFriseProps {
  categories: CategorieRow[]
  actifs: Set<string>
  onToggle: (catId: string) => void
}

export function FiltresFrise({ categories, actifs, onToggle }: FiltresFriseProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {categories.map((cat) => {
        const isActive = actifs.has(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
            style={
              isActive
                ? {
                    backgroundColor: cat.couleurBg,
                    borderColor: cat.couleurBorder,
                    color: cat.couleurText,
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
                backgroundColor: isActive ? cat.couleurPoint : '#bdbdbd',
              }}
            />
            {cat.nom}
          </button>
        )
      })}
    </div>
  )
}
