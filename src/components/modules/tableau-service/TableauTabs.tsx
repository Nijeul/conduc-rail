'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteTableau, updateTableau } from '@/actions/tableau-service'
import type { TableauServiceData } from './types'

interface Props {
  projetId: string
  tableaux: TableauServiceData[]
  activeId: string | null
  onSelect: (id: string) => void
  onAdd: () => void
  onDeleted: () => void
}

export function TableauTabs({ projetId, tableaux, activeId, onSelect, onAdd, onDeleted }: Props) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [renaming])

  function handleContextMenu(e: React.MouseEvent, id: string) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, id })
  }

  async function handleRename() {
    if (!renaming || !renameValue.trim()) {
      setRenaming(null)
      return
    }
    await updateTableau(projetId, { id: renaming, titre: renameValue.trim() })
    setRenaming(null)
  }

  async function handleDelete(id: string) {
    setContextMenu(null)
    if (!confirm('Supprimer ce tableau ?')) return
    await deleteTableau(projetId, id)
    onDeleted()
  }

  return (
    <div className="flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto border-b border-[#DCDCDC] bg-white">
      {tableaux.map((t) => (
        <div
          key={t.id}
          onContextMenu={(e) => handleContextMenu(e, t.id)}
          onClick={() => onSelect(t.id)}
          className={cn(
            'relative flex items-center gap-2 px-4 py-2 text-[13px] font-medium cursor-pointer rounded-t-md border border-b-0 transition-colors select-none',
            t.id === activeId
              ? 'bg-white text-slate-900 border-[#DCDCDC]'
              : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'
          )}
        >
          {renaming === t.id ? (
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') setRenaming(null)
              }}
              className="w-24 px-1 py-0 text-[13px] border border-slate-300 rounded outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="truncate max-w-[140px]">{t.titre}</span>
          )}
        </div>
      ))}

      {/* Add button */}
      <button
        onClick={onAdd}
        className="flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        title="Nouveau tableau"
      >
        <Plus className="h-4 w-4" />
      </button>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100 transition-colors"
            onClick={() => {
              const tab = tableaux.find((t) => t.id === contextMenu.id)
              setRenameValue(tab?.titre || '')
              setRenaming(contextMenu.id)
              setContextMenu(null)
            }}
          >
            Renommer
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-[#E20025] hover:bg-red-50 transition-colors"
            onClick={() => handleDelete(contextMenu.id)}
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
