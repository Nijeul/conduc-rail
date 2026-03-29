'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { ColumnDef } from './columns'
import { RECEPTION_COLORS } from './columns'
import { formatDateFR } from '@/lib/utils'

interface SoudureCellProps {
  soudureId: string
  column: ColumnDef
  value: string | null
  onUpdate: (id: string, field: string, value: string | null) => void
}

export function SoudureCell({
  soudureId,
  column,
  value,
  onUpdate,
}: SoudureCellProps) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value ?? '')
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  useEffect(() => {
    setLocalValue(value ?? '')
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [editing])

  const commitValue = useCallback(
    (newValue: string) => {
      const finalValue = newValue.trim() || null
      if (finalValue !== (value ?? null)) {
        onUpdate(soudureId, column.key, finalValue)
      }
      setEditing(false)
    },
    [soudureId, column.key, value, onUpdate]
  )

  // Read-only for N column
  if (column.key === 'ordre') {
    return (
      <div
        className="px-1 py-0.5 text-center text-xs tabular-nums"
        style={{ width: column.width, minWidth: column.width }}
      >
        {value}
      </div>
    )
  }

  // Background color for reception cells
  let cellBg = 'transparent'
  if (column.key === 'reception' && value && RECEPTION_COLORS[value]) {
    cellBg = RECEPTION_COLORS[value]
  }

  // Date display
  const displayValue =
    column.key === 'date' && value
      ? formatDateFR(new Date(value))
      : value ?? ''

  if (editing) {
    if (column.type === 'select') {
      return (
        <div
          style={{
            width: column.width,
            minWidth: column.width,
            backgroundColor: cellBg,
          }}
        >
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value)
              commitValue(e.target.value)
            }}
            onBlur={() => setEditing(false)}
            className="w-full h-full bg-transparent text-xs border-none outline-none px-1 py-0.5"
          >
            {column.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt || '—'}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (column.type === 'date') {
      return (
        <div
          style={{
            width: column.width,
            minWidth: column.width,
            backgroundColor: cellBg,
          }}
        >
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="date"
            value={localValue ? localValue.slice(0, 10) : ''}
            onChange={(e) => {
              setLocalValue(e.target.value)
              commitValue(e.target.value)
            }}
            onBlur={() => setEditing(false)}
            className="w-full h-full bg-transparent text-xs border-none outline-none px-1 py-0.5"
          />
        </div>
      )
    }

    // Default text input
    return (
      <div
        style={{
          width: column.width,
          minWidth: column.width,
          backgroundColor: cellBg,
        }}
      >
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => commitValue(localValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitValue(localValue)
            if (e.key === 'Escape') {
              setLocalValue(value ?? '')
              setEditing(false)
            }
          }}
          className="w-full h-full bg-transparent text-xs border-none outline-none px-1 py-0.5"
        />
      </div>
    )
  }

  // Display mode
  return (
    <div
      onClick={() => setEditing(true)}
      className="px-1 py-0.5 text-xs truncate cursor-pointer hover:bg-blue-50 transition-colors"
      style={{
        width: column.width,
        minWidth: column.width,
        backgroundColor: cellBg,
      }}
      title={displayValue}
    >
      {displayValue || '\u00A0'}
    </div>
  )
}
