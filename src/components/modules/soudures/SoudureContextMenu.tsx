'use client'

import React, { useState } from 'react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  ArrowUpFromLine,
  ArrowDownFromLine,
  CircleAlert,
  CircleMinus,
  Paintbrush,
  Trash2,
} from 'lucide-react'

interface SoudureContextMenuProps {
  children: React.ReactNode
  onInsertAbove: () => void
  onInsertBelow: () => void
  onSetYellow: () => void
  onSetRed: () => void
  onClearColor: () => void
  onDelete: () => void
}

export function SoudureContextMenu({
  children,
  onInsertAbove,
  onInsertBelow,
  onSetYellow,
  onSetRed,
  onClearColor,
  onDelete,
}: SoudureContextMenuProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (!open) setConfirmDelete(false)
      }}
    >
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onInsertAbove}>
          <ArrowUpFromLine className="mr-2 h-4 w-4" />
          Inserer une ligne au-dessus
        </ContextMenuItem>
        <ContextMenuItem onClick={onInsertBelow}>
          <ArrowDownFromLine className="mr-2 h-4 w-4" />
          Inserer une ligne en-dessous
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={onSetYellow}>
          <CircleAlert className="mr-2 h-4 w-4 text-yellow-600" />
          Marquer provisoire (jaune)
        </ContextMenuItem>
        <ContextMenuItem onClick={onSetRed}>
          <CircleMinus className="mr-2 h-4 w-4 text-red-600" />
          Marquer HS (rouge)
        </ContextMenuItem>
        <ContextMenuItem onClick={onClearColor}>
          <Paintbrush className="mr-2 h-4 w-4" />
          Supprimer la couleur
        </ContextMenuItem>

        <ContextMenuSeparator />

        {confirmDelete ? (
          <ContextMenuItem
            onClick={onDelete}
            className="text-red-600 font-semibold"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Confirmer la suppression
          </ContextMenuItem>
        ) : (
          <ContextMenuItem
            onClick={(e) => {
              e.preventDefault()
              setConfirmDelete(true)
            }}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer cette ligne
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
