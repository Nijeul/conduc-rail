'use client'

import React, { useState, useCallback, useMemo, useRef, useTransition } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { SoudureAluminothermique } from '@prisma/client'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import {
  COLUMN_GROUPS,
  ALL_COLUMNS,
  TOTAL_WIDTH,
  ROW_COLORS,
  type ColumnDef,
} from './columns'
import { SoudureCell } from './SoudureCell'
import { SoudureContextMenu } from './SoudureContextMenu'
import { SouduresToolbar } from './SouduresToolbar'
import { SouduresStatusBar } from './SouduresStatusBar'
import {
  createSoudure,
  updateSoudureField,
  deleteSoudure,
  updateCouleurLigne,
  reorderSoudures,
} from '@/actions/soudures'

interface SouduresTableProps {
  projetId: string
  projetName: string
  initialData: SoudureAluminothermique[]
}

const ROW_HEIGHT = 28
// Colonne poignée de drag & drop, devant les colonnes configurées
const HANDLE_WIDTH = 26
const GRID_WIDTH = TOTAL_WIDTH + HANDLE_WIDTH

type SortDir = 'asc' | 'desc'
interface SortState {
  key: string
  dir: SortDir
}

function valeurTri(
  s: SoudureAluminothermique,
  key: string
): number | string | null {
  const raw = s[key as keyof SoudureAluminothermique]
  if (raw === null || raw === undefined || raw === '') return null
  if (raw instanceof Date) return raw.getTime()
  if (typeof raw === 'number') return raw
  return String(raw)
}

function comparer(
  a: SoudureAluminothermique,
  b: SoudureAluminothermique,
  sort: SortState
): number {
  const va = valeurTri(a, sort.key)
  const vb = valeurTri(b, sort.key)
  // Cellules vides toujours en bas, quel que soit le sens
  if (va === null && vb === null) return a.ordre - b.ordre
  if (va === null) return 1
  if (vb === null) return -1
  let cmp: number
  if (typeof va === 'number' && typeof vb === 'number') {
    cmp = va - vb
  } else {
    cmp = String(va).localeCompare(String(vb), 'fr', {
      numeric: true,
      sensitivity: 'base',
    })
  }
  if (cmp === 0) cmp = a.ordre - b.ordre
  return sort.dir === 'asc' ? cmp : -cmp
}

// ─── Ligne triable (drag & drop) ─────────────────────────────────────────────

interface SortableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  soudure: SoudureAluminothermique
  top: number
  bg: string
  isSelected: boolean
  dragDisabled: boolean
  onSelect: () => void
  children: React.ReactNode
}

// forwardRef + spread des props : requis car ContextMenuTrigger (asChild)
// clone cette ligne et lui injecte ref et onContextMenu.
const SortableRow = React.forwardRef<HTMLDivElement, SortableRowProps>(
  function SortableRow(
    { soudure, top, bg, isSelected, dragDisabled, onSelect, children, ...rest },
    forwardedRef
  ) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: soudure.id, disabled: dragDisabled })

    const setRefs = (node: HTMLDivElement | null) => {
      setNodeRef(node)
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    return (
      <div
        {...rest}
        ref={setRefs}
        className="flex items-center border-b border-[#DCDCDC] cursor-pointer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: ROW_HEIGHT,
          transform: `translateY(${top + (transform?.y ?? 0)}px)`,
          transition: transform ? transition : undefined,
          backgroundColor: bg,
          outline: isSelected ? '2px solid #004489' : 'none',
          outlineOffset: '-2px',
          zIndex: isDragging ? 20 : undefined,
          boxShadow: isDragging ? '0 2px 8px rgba(0,0,0,0.25)' : undefined,
          opacity: isDragging ? 0.95 : undefined,
        }}
        onClick={(e) => {
          rest.onClick?.(e)
          onSelect()
        }}
      >
        <div
          className="flex items-center justify-center h-full border-r border-[#DCDCDC] shrink-0"
          style={{
            width: HANDLE_WIDTH,
            minWidth: HANDLE_WIDTH,
            cursor: dragDisabled ? 'not-allowed' : 'grab',
            touchAction: 'none',
          }}
          title={
            dragDisabled
              ? 'Tri actif — cliquez sur N° pour revenir à l’ordre manuel et glisser-déposer'
              : 'Glisser pour déplacer la ligne'
          }
          {...(dragDisabled ? {} : { ...attributes, ...listeners })}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical
            className="h-4 w-4"
            style={{ color: dragDisabled ? '#DCDCDC' : '#B5ABA1' }}
          />
        </div>
        {children}
      </div>
    )
  }
)

// ─── Table ───────────────────────────────────────────────────────────────────

export function SouduresTable({
  projetId,
  projetName,
  initialData,
}: SouduresTableProps) {
  const [soudures, setSoudures] = useState<SoudureAluminothermique[]>(initialData)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState | null>(null)
  const [isPending, startTransition] = useTransition()
  const parentRef = useRef<HTMLDivElement>(null)
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const affichees = useMemo(() => {
    if (!sort) return soudures
    return [...soudures].sort((a, b) => comparer(a, b, sort))
  }, [soudures, sort])

  const virtualizer = useVirtualizer({
    count: affichees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ─── Tri par clic sur les en-têtes ────────────────────────────────────────

  const handleHeaderClick = useCallback((col: ColumnDef) => {
    if (col.key === 'ordre') {
      // N° = retour à l'ordre manuel
      setSort(null)
      return
    }
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: 'asc' }
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' }
      return null
    })
  }, [])

  // ─── Drag & drop (ordre manuel uniquement) ────────────────────────────────

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      setSoudures((prev) => {
        const oldIndex = prev.findIndex((s) => s.id === active.id)
        const newIndex = prev.findIndex((s) => s.id === over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        const newOrder = arrayMove(prev, oldIndex, newIndex).map((s, i) => ({
          ...s,
          ordre: i,
        }))
        reorderSoudures(
          projetId,
          newOrder.map((s) => s.id)
        ).catch(console.error)
        return newOrder
      })
    },
    [projetId]
  )

  // ─── Debounced update ──────────────────────────────────────────────────────

  const handleCellUpdate = useCallback(
    (id: string, field: string, value: string | null) => {
      // Optimistic update
      setSoudures((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s
          if (field === 'date') {
            return { ...s, [field]: value ? new Date(value) : null }
          }
          return { ...s, [field]: value }
        })
      )

      // Debounced server call
      const key = `${id}-${field}`
      const existing = debounceTimers.current.get(key)
      if (existing) clearTimeout(existing)

      const timer = setTimeout(() => {
        startTransition(async () => {
          await updateSoudureField(projetId, { id, field, value })
        })
        debounceTimers.current.delete(key)
      }, 500)

      debounceTimers.current.set(key, timer)
    },
    [projetId]
  )

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleAddSoudure = useCallback(async () => {
    startTransition(async () => {
      const result = await createSoudure(projetId)
      if (result.success) {
        setSoudures((prev) => [...prev, result.data])
      }
    })
  }, [projetId])

  const handleInsertAbove = useCallback(
    async (soudureId: string) => {
      const idx = soudures.findIndex((s) => s.id === soudureId)
      if (idx === -1) return
      const ordre = soudures[idx].ordre
      startTransition(async () => {
        const result = await createSoudure(projetId, ordre)
        if (result.success) {
          setSoudures((prev) => {
            const updated = prev.map((s) =>
              s.ordre >= ordre && s.id !== result.data.id
                ? { ...s, ordre: s.ordre + 1 }
                : s
            )
            updated.splice(idx, 0, result.data)
            return updated
          })
        }
      })
    },
    [projetId, soudures]
  )

  const handleInsertBelow = useCallback(
    async (soudureId: string) => {
      const idx = soudures.findIndex((s) => s.id === soudureId)
      if (idx === -1) return
      const ordre = soudures[idx].ordre + 1
      startTransition(async () => {
        const result = await createSoudure(projetId, ordre)
        if (result.success) {
          setSoudures((prev) => {
            const updated = prev.map((s) =>
              s.ordre >= ordre && s.id !== result.data.id
                ? { ...s, ordre: s.ordre + 1 }
                : s
            )
            updated.splice(idx + 1, 0, result.data)
            return updated
          })
        }
      })
    },
    [projetId, soudures]
  )

  const handleDelete = useCallback(
    async (soudureId: string) => {
      startTransition(async () => {
        const result = await deleteSoudure(projetId, soudureId)
        if (result.success) {
          setSoudures((prev) => prev.filter((s) => s.id !== soudureId))
          if (selectedId === soudureId) setSelectedId(null)
        }
      })
    },
    [projetId, selectedId]
  )

  const handleSetCouleur = useCallback(
    async (soudureId: string, couleur: string) => {
      // Optimistic
      setSoudures((prev) =>
        prev.map((s) =>
          s.id === soudureId ? { ...s, couleurLigne: couleur || null } : s
        )
      )
      startTransition(async () => {
        await updateCouleurLigne(projetId, soudureId, couleur)
      })
    },
    [projetId]
  )

  const handleDeleteSelected = useCallback(async () => {
    if (!selectedId) return
    await handleDelete(selectedId)
  }, [selectedId, handleDelete])

  // ─── Row background ───────────────────────────────────────────────────────

  const getRowBg = (soudure: SoudureAluminothermique, index: number) => {
    if (soudure.couleurLigne && ROW_COLORS[soudure.couleurLigne]) {
      return ROW_COLORS[soudure.couleurLigne]
    }
    return index % 2 === 0 ? '#FFFFFF' : '#F0F0F0'
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const virtualItems = virtualizer.getVirtualItems()
  const dragDisabled = sort !== null

  return (
    <div className="flex flex-col h-full">
      <SouduresToolbar
        onAdd={handleAddSoudure}
        onDelete={handleDeleteSelected}
        hasSelection={!!selectedId}
        projetId={projetId}
        projetName={projetName}
        soudures={affichees}
        isPending={isPending}
      />

      <div className="flex-1 overflow-hidden border border-[#DCDCDC] rounded">
        {/* Fixed double-header */}
        <div
          style={{ minWidth: GRID_WIDTH }}
          className="sticky top-0 z-10"
        >
          {/* Row 1: Group headers */}
          <div className="flex">
            <div
              className="border-r border-[#DCDCDC]"
              style={{
                width: HANDLE_WIDTH,
                minWidth: HANDLE_WIDTH,
                backgroundColor: '#004489',
              }}
            />
            {COLUMN_GROUPS.map((group) => {
              const totalW = group.columns.reduce((s, c) => s + c.width, 0)
              return (
                <div
                  key={group.label}
                  className="text-center text-xs font-bold border-r border-[#DCDCDC] last:border-r-0"
                  style={{
                    width: totalW,
                    minWidth: totalW,
                    backgroundColor: group.color,
                    color: group.textColor,
                    padding: '4px 0',
                  }}
                >
                  {group.label}
                </div>
              )
            })}
          </div>
          {/* Row 2: Column headers (cliquables pour trier) */}
          <div className="flex" style={{ backgroundColor: '#004489' }}>
            <div
              className="border-r border-[#DCDCDC]"
              style={{ width: HANDLE_WIDTH, minWidth: HANDLE_WIDTH }}
            />
            {ALL_COLUMNS.map((col) => {
              const actif = sort?.key === col.key
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => handleHeaderClick(col)}
                  className="text-center text-[11px] font-semibold text-white border-r border-[#DCDCDC] last:border-r-0 truncate hover:bg-[#003370] select-none"
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    padding: '3px 2px',
                    backgroundColor: actif ? '#003370' : undefined,
                    cursor: 'pointer',
                  }}
                  title={
                    col.key === 'ordre'
                      ? 'Revenir à l’ordre manuel'
                      : `Trier par ${col.label}`
                  }
                >
                  {col.label}
                  {actif && (
                    <span style={{ color: '#F2AB1B' }}>
                      {' '}
                      {sort?.dir === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Virtualized rows */}
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: 'calc(100% - 52px)' }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={affichees.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  width: GRID_WIDTH,
                  position: 'relative',
                }}
              >
                {virtualItems.map((virtualRow) => {
                  const soudure = affichees[virtualRow.index]
                  if (!soudure) return null
                  const isSelected = selectedId === soudure.id

                  return (
                    <SoudureContextMenu
                      key={soudure.id}
                      onInsertAbove={() => handleInsertAbove(soudure.id)}
                      onInsertBelow={() => handleInsertBelow(soudure.id)}
                      onSetYellow={() => handleSetCouleur(soudure.id, 'yellow')}
                      onSetRed={() => handleSetCouleur(soudure.id, 'red')}
                      onClearColor={() => handleSetCouleur(soudure.id, '')}
                      onDelete={() => handleDelete(soudure.id)}
                    >
                      <SortableRow
                        soudure={soudure}
                        top={virtualRow.start}
                        bg={getRowBg(soudure, virtualRow.index)}
                        isSelected={isSelected}
                        dragDisabled={dragDisabled}
                        onSelect={() => setSelectedId(soudure.id)}
                      >
                        {ALL_COLUMNS.map((col) => {
                          let strValue: string | null = null
                          if (col.key === 'ordre') {
                            strValue = String(virtualRow.index + 1)
                          } else {
                            const raw =
                              soudure[col.key as keyof SoudureAluminothermique]
                            if (raw instanceof Date) {
                              strValue = raw.toISOString()
                            } else if (typeof raw === 'string') {
                              strValue = raw
                            }
                          }

                          return (
                            <div
                              key={col.key}
                              className="border-r border-[#DCDCDC] last:border-r-0"
                              style={{
                                width: col.width,
                                minWidth: col.width,
                              }}
                            >
                              <SoudureCell
                                soudureId={soudure.id}
                                column={col}
                                value={strValue}
                                onUpdate={handleCellUpdate}
                              />
                            </div>
                          )
                        })}
                      </SortableRow>
                    </SoudureContextMenu>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <SouduresStatusBar soudures={affichees} />
    </div>
  )
}
