'use client'

import React, { useMemo } from 'react'
import type { SoudureAluminothermique } from '@prisma/client'

interface SouduresStatusBarProps {
  soudures: SoudureAluminothermique[]
}

export function SouduresStatusBar({ soudures }: SouduresStatusBarProps) {
  const stats = useMemo(() => {
    const total = soudures.length
    const ok = soudures.filter((s) => s.reception === 'OK').length
    const hs = soudures.filter((s) => s.reception === 'HS').length
    return { total, ok, hs }
  }, [soudures])

  return (
    <div
      className="flex items-center gap-6 px-4 py-2 mt-1 rounded text-xs font-medium"
      style={{ backgroundColor: '#263238', color: '#FFFFFF' }}
    >
      <span>{stats.total} soudures</span>
      <span>{stats.ok} OK</span>
      <span>{stats.hs} HS</span>
    </div>
  )
}
