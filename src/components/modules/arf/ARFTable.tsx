'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { updateHeuresPrevues, type ARFRow } from '@/actions/arf'
import {
  formatDateFR,
  calcDureeMinutes,
  formatDuree,
} from '@/lib/utils'
import { FileText } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

interface Props {
  projetId: string
  projetName: string
  initialData: ARFRow[]
}

/**
 * Parse flexible hour input:
 * "6" -> "06:00", "630" -> "06:30", "21:30" -> "21:30", "21h30" -> "21:30"
 */
function parseHeureFlexible(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Already HH:MM or H:MM
  const matchColon = trimmed.match(/^(\d{1,2})[h:.](\d{2})$/)
  if (matchColon) {
    const h = parseInt(matchColon[1], 10)
    const m = parseInt(matchColon[2], 10)
    if (h < 0 || h > 23 || m < 0 || m > 59) return null
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  // Pure number: 1-2 digits = hours, 3-4 digits = HHMM
  const matchNum = trimmed.match(/^(\d{1,4})$/)
  if (matchNum) {
    const num = matchNum[1]
    if (num.length <= 2) {
      const h = parseInt(num, 10)
      if (h < 0 || h > 23) return null
      return `${h.toString().padStart(2, '0')}:00`
    }
    // 3 or 4 digits: HMM or HHMM
    const padded = num.padStart(4, '0')
    const h = parseInt(padded.slice(0, 2), 10)
    const m = parseInt(padded.slice(2, 4), 10)
    if (h < 0 || h > 23 || m < 0 || m > 59) return null
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  return null
}

function computeRow(row: ARFRow) {
  const finEffective = row.heureRestituee || row.heureFin
  let dureeReelleMin: number | null = null
  let dureePrevueMin: number | null = null
  let pourcentTemps: number | null = null

  if (row.heureDebut && finEffective) {
    dureeReelleMin = calcDureeMinutes(row.heureDebut, finEffective, row.posteNuit)
  }

  if (row.heureDebutPrevue && row.heureFinPrevue) {
    dureePrevueMin = calcDureeMinutes(
      row.heureDebutPrevue,
      row.heureFinPrevue,
      row.posteNuit
    )
  }

  if (dureeReelleMin !== null && dureePrevueMin !== null && dureePrevueMin > 0) {
    pourcentTemps = (dureeReelleMin / dureePrevueMin) * 100
  }

  return { dureeReelleMin, dureePrevueMin, pourcentTemps }
}

function getDureeBg(minutes: number | null): string {
  if (minutes === null) return ''
  if (minutes > 12 * 60) return 'bg-[#FDEAED]'
  if (minutes > 10 * 60) return 'bg-[#FFF7D1]'
  return ''
}

function getPourcentColor(pct: number | null): string {
  if (pct === null) return ''
  if (pct >= 95) return 'text-[#7AA536]'
  if (pct >= 90) return 'text-[#F2AB1B]'
  return 'text-[#E20025]'
}

export function ARFTable({ projetId, projetName, initialData }: Props) {
  const [rows, setRows] = useState<ARFRow[]>(initialData)
  const [editingCell, setEditingCell] = useState<{
    rowId: string
    field: 'heureDebutPrevue' | 'heureFinPrevue'
  } | null>(null)
  const [editValue, setEditValue] = useState('')
  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  const handleStartEdit = (
    rowId: string,
    field: 'heureDebutPrevue' | 'heureFinPrevue',
    currentValue: string | null
  ) => {
    setEditingCell({ rowId, field })
    setEditValue(currentValue || '')
  }

  const handleSaveEdit = useCallback(async () => {
    if (!editingCell) return

    const parsed = editValue.trim() ? parseHeureFlexible(editValue) : null
    const row = rows.find((r) => r.id === editingCell.rowId)
    if (!row) {
      setEditingCell(null)
      return
    }

    const newDebutPrevue =
      editingCell.field === 'heureDebutPrevue'
        ? parsed
        : row.heureDebutPrevue
    const newFinPrevue =
      editingCell.field === 'heureFinPrevue'
        ? parsed
        : row.heureFinPrevue

    // Optimistic update
    setRows((prev) =>
      prev.map((r) =>
        r.id === editingCell.rowId
          ? {
              ...r,
              heureDebutPrevue: newDebutPrevue,
              heureFinPrevue: newFinPrevue,
            }
          : r
      )
    )
    setEditingCell(null)

    // Server action
    await updateHeuresPrevues(projetId, {
      rapportId: editingCell.rowId,
      heureDebutPrevue: newDebutPrevue,
      heureFinPrevue: newFinPrevue,
    })
  }, [editingCell, editValue, rows, projetId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  // Compute totals
  let totalMinutes = 0
  for (const row of rows) {
    const { dureeReelleMin } = computeRow(row)
    if (dureeReelleMin !== null) totalMinutes += dureeReelleMin
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            exportAvecGuard(async () => {
              try {
                const { generateARFPDF } = await import('./ARFPDFDownload')
                await generateARFPDF(projetName, rows, totalMinutes, userLogo ?? undefined, nomSociete ?? undefined)
              } catch (err) {
                console.error('PDF generation error:', err)
              }
            })
          }}
          disabled={isExporting}
          className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
        >
          <FileText className="h-4 w-4 mr-1" />
          {isExporting ? 'Generation...' : 'Export PDF'}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold">
              <th className="px-3 py-2 text-left">Jour</th>
              <th className="px-3 py-2 text-center">Poste</th>
              <th className="px-3 py-2 text-center">Debut prevu</th>
              <th className="px-3 py-2 text-center">Fin prevue</th>
              <th className="px-3 py-2 text-center">Debut reel</th>
              <th className="px-3 py-2 text-center">Fin reelle</th>
              <th className="px-3 py-2 text-center">Restitution</th>
              <th className="px-3 py-2 text-right">Duree</th>
              <th className="px-3 py-2 text-right">% temps</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const { dureeReelleMin, pourcentTemps } = computeRow(row)
              const isEditing = (field: 'heureDebutPrevue' | 'heureFinPrevue') =>
                editingCell?.rowId === row.id && editingCell?.field === field

              return (
                <tr
                  key={row.id}
                  className={`border-b border-[#DCDCDC] ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                  }`}
                >
                  <td className="px-3 py-2">
                    {formatDateFR(new Date(row.date))}
                  </td>
                  <td className="px-3 py-2 text-center text-lg">
                    {row.posteNuit ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
                  </td>

                  {/* Debut prevu - editable */}
                  <td className="px-3 py-1 text-center">
                    {isEditing('heureDebutPrevue') ? (
                      <input
                        type="text"
                        className="w-20 px-1 py-0.5 text-center text-[13px] border border-[#004489] rounded bg-white focus:outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="inline-block w-20 px-1 py-0.5 rounded cursor-pointer bg-[#FFF7D1] hover:bg-[#FFF1B0]"
                        onClick={() =>
                          handleStartEdit(
                            row.id,
                            'heureDebutPrevue',
                            row.heureDebutPrevue
                          )
                        }
                      >
                        {row.heureDebutPrevue || '\u2014'}
                      </span>
                    )}
                  </td>

                  {/* Fin prevue - editable */}
                  <td className="px-3 py-1 text-center">
                    {isEditing('heureFinPrevue') ? (
                      <input
                        type="text"
                        className="w-20 px-1 py-0.5 text-center text-[13px] border border-[#004489] rounded bg-white focus:outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="inline-block w-20 px-1 py-0.5 rounded cursor-pointer bg-[#FFF7D1] hover:bg-[#FFF1B0]"
                        onClick={() =>
                          handleStartEdit(
                            row.id,
                            'heureFinPrevue',
                            row.heureFinPrevue
                          )
                        }
                      >
                        {row.heureFinPrevue || '\u2014'}
                      </span>
                    )}
                  </td>

                  {/* Readonly fields */}
                  <td className="px-3 py-2 text-center">
                    {row.heureDebut || '\u2014'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {row.heureFin || '\u2014'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {row.heureRestituee || '\u2014'}
                  </td>

                  {/* Duree */}
                  <td
                    className={`px-3 py-2 text-right ${getDureeBg(dureeReelleMin)}`}
                  >
                    {dureeReelleMin !== null
                      ? formatDuree(dureeReelleMin)
                      : '\u2014'}
                  </td>

                  {/* % temps */}
                  <td
                    className={`px-3 py-2 text-right font-semibold ${getPourcentColor(
                      pourcentTemps
                    )}`}
                  >
                    {pourcentTemps !== null
                      ? `${pourcentTemps.toFixed(1)} %`
                      : '\u2014'}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-gray-400"
                >
                  Aucun rapport journalier
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#F0F0F0] font-bold border-t-2 border-[#004489]">
              <td colSpan={7} className="px-3 py-3 text-right">
                Total cumule :
              </td>
              <td className="px-3 py-3 text-right text-[#004489]">
                {formatDuree(totalMinutes)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  )
}
