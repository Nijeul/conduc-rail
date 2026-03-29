'use client'

import React, { useState, useCallback, useRef, useTransition } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { SoudureAluminothermique } from '@prisma/client'
import {
  COLUMN_GROUPS,
  ALL_COLUMNS,
  TOTAL_WIDTH,
  ROW_COLORS,
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
} from '@/actions/soudures'

interface SouduresTableProps {
  projetId: string
  projetName: string
  initialData: SoudureAluminothermique[]
}

const ROW_HEIGHT = 28

export function SouduresTable({
  projetId,
  projetName,
  initialData,
}: SouduresTableProps) {
  const [soudures, setSoudures] = useState<SoudureAluminothermique[]>(initialData)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const parentRef = useRef<HTMLDivElement>(null)
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const virtualizer = useVirtualizer({
    count: soudures.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

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
    return index % 2 === 0 ? '#FFFFFF' : '#F5F7FA'
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="flex flex-col h-full">
      <SouduresToolbar
        onAdd={handleAddSoudure}
        onDelete={handleDeleteSelected}
        hasSelection={!!selectedId}
        projetId={projetId}
        projetName={projetName}
        soudures={soudures}
        isPending={isPending}
      />

      <div className="flex-1 overflow-hidden border border-[#ECEFF1] rounded">
        {/* Fixed double-header */}
        <div
          style={{ minWidth: TOTAL_WIDTH }}
          className="sticky top-0 z-10"
        >
          {/* Row 1: Group headers */}
          <div className="flex">
            {COLUMN_GROUPS.map((group) => {
              const totalW = group.columns.reduce((s, c) => s + c.width, 0)
              return (
                <div
                  key={group.label}
                  className="text-center text-xs font-bold border-r border-[#ECEFF1] last:border-r-0"
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
          {/* Row 2: Column headers */}
          <div className="flex" style={{ backgroundColor: '#263238' }}>
            {ALL_COLUMNS.map((col) => (
              <div
                key={col.key}
                className="text-center text-[11px] font-semibold text-white border-r border-[#ECEFF1] last:border-r-0 truncate"
                style={{
                  width: col.width,
                  minWidth: col.width,
                  padding: '3px 2px',
                }}
                title={col.label}
              >
                {col.label}
              </div>
            ))}
          </div>
        </div>

        {/* Virtualized rows */}
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: 'calc(100% - 52px)' }}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: TOTAL_WIDTH,
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualRow) => {
              const soudure = soudures[virtualRow.index]
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
                  <div
                    className="flex items-center border-b border-[#ECEFF1] cursor-pointer"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: ROW_HEIGHT,
                      transform: `translateY(${virtualRow.start}px)`,
                      backgroundColor: getRowBg(soudure, virtualRow.index),
                      outline: isSelected
                        ? '2px solid #1565C0'
                        : 'none',
                      outlineOffset: '-2px',
                    }}
                    onClick={() => setSelectedId(soudure.id)}
                  >
                    {ALL_COLUMNS.map((col) => {
                      let strValue: string | null = null
                      if (col.key === 'ordre') {
                        strValue = String(virtualRow.index + 1)
                      } else {
                        const raw = soudure[col.key as keyof SoudureAluminothermique]
                        if (raw instanceof Date) {
                          strValue = raw.toISOString()
                        } else if (typeof raw === 'string') {
                          strValue = raw
                        }
                      }

                      return (
                        <div
                          key={col.key}
                          className="border-r border-[#ECEFF1] last:border-r-0"
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
                  </div>
                </SoudureContextMenu>
              )
            })}
          </div>
        </div>
      </div>

      <SouduresStatusBar soudures={soudures} />
    </div>
  )
}
