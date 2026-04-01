'use client'

import React, { useState } from 'react'
import type { SoudureAluminothermique } from '@prisma/client'
import { Plus, Trash2, FileDown, Loader2 } from 'lucide-react'
import { SouduresPDFDownload } from './SouduresPDFDownload'

interface SouduresToolbarProps {
  onAdd: () => void
  onDelete: () => void
  hasSelection: boolean
  projetId: string
  projetName: string
  soudures: SoudureAluminothermique[]
  isPending: boolean
}

export function SouduresToolbar({
  onAdd,
  onDelete,
  hasSelection,
  projetName,
  soudures,
  isPending,
}: SouduresToolbarProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex items-center gap-2 mb-2">
      <button
        onClick={onAdd}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
        style={{ backgroundColor: '#004489', color: '#FFFFFF' }}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        + Soudure
      </button>

      {confirmDelete ? (
        <button
          onClick={() => {
            onDelete()
            setConfirmDelete(false)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          style={{ backgroundColor: '#E20025', color: '#FFFFFF' }}
        >
          <Trash2 className="h-4 w-4" />
          Confirmer
        </button>
      ) : (
        <button
          onClick={() => {
            if (hasSelection) setConfirmDelete(true)
          }}
          disabled={!hasSelection || isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-40"
          style={{ backgroundColor: '#F0F0F0', color: '#000000', border: '1px solid #DCDCDC' }}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </button>
      )}

      <SouduresPDFDownload projetName={projetName} soudures={soudures} />

      {isPending && (
        <span className="text-xs text-slate-400 ml-2">Sauvegarde...</span>
      )}
    </div>
  )
}
