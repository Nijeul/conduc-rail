'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { ColonneTS, LigneTS, CellulesTS, PersonnelMap } from './types'

interface Props {
  ligne: LigneTS
  colonnes: ColonneTS[]
  cellules: CellulesTS
  personnelMap: PersonnelMap
  onCellDoubleClick: (ligneId: string, colId: string) => void
  onLigneContextMenu: (e: React.MouseEvent, ligneId: string) => void
}

export function SortableRow({ ligne, colonnes, cellules, personnelMap, onCellDoubleClick, onLigneContextMenu }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ligne.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style}>
      {/* Drag handle + Libelle */}
      <td
        className="border border-[#DCDCDC] px-2 py-1.5 text-[12px] font-medium whitespace-nowrap cursor-context-menu select-none"
        style={{ backgroundColor: ligne.bg, color: ligne.fg, width: 180, minWidth: 180, maxWidth: 180 }}
        onContextMenu={(e) => onLigneContextMenu(e, ligne.id)}
      >
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-black/10 shrink-0"
            style={{ color: ligne.fg }}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span>{ligne.libelle}</span>
        </div>
      </td>

      {/* Data cells */}
      {colonnes.map((col) => {
        const key = `${ligne.id}|${col.id}`
        const cell = cellules[key]

        // Resolve personnel info from map (O(1) lookup)
        const pId = cell?.personnelId
        const pInfo = pId ? personnelMap[pId] : undefined

        // Displayed name: prefer map data, fallback to stored personnelNom
        const displayPrenom = pInfo?.prenom || cell?.personnelNom?.split(' ')[0] || ''
        const displayNom = pInfo?.nom || cell?.personnelNom?.split(' ').slice(1).join(' ') || ''
        const displayName = (displayPrenom || displayNom) ? `${displayPrenom} ${displayNom}`.trim() : ''

        // Phone: prefer map, fallback to stored
        const telephone = pInfo?.telephone || cell?.personnelTelephone || ''

        return (
          <td
            key={col.id}
            className="border border-[#DCDCDC] cursor-pointer hover:bg-blue-50/50 transition-colors"
            style={{ minWidth: 150 }}
            onDoubleClick={() => onCellDoubleClick(ligne.id, col.id)}
          >
            <div className="p-2 min-h-[48px]">
              {displayName && (
                <div className="font-medium text-[13px] leading-tight">{displayName}</div>
              )}
              {telephone && (
                <div className="text-[11px] text-[#5A5A5A] mt-0.5">{'\u{1F4DE}'} {telephone}</div>
              )}
              {cell?.texte && !displayName && (
                <div className="text-slate-500 text-[11px]">{cell.texte}</div>
              )}
              {cell?.texte && displayName && (
                <div className="text-slate-400 text-[10px] mt-0.5">{cell.texte}</div>
              )}
            </div>
          </td>
        )
      })}
    </tr>
  )
}
