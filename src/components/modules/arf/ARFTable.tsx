'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  updateHeuresPrevues,
  updateLigneARFManuelle,
  createLigneARFManuelle,
  deleteLigneARFManuelle,
  type ARFRow,
} from '@/actions/arf'
import {
  formatDateFR,
  calcDureeMinutes,
  formatDuree,
} from '@/lib/utils'
import { FileText, Plus, Pencil, Trash2, ClipboardList } from 'lucide-react'
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

  const matchColon = trimmed.match(/^(\d{1,2})[h:.](\d{2})$/)
  if (matchColon) {
    const h = parseInt(matchColon[1], 10)
    const m = parseInt(matchColon[2], 10)
    if (h < 0 || h > 23 || m < 0 || m > 59) return null
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const matchNum = trimmed.match(/^(\d{1,4})$/)
  if (matchNum) {
    const num = matchNum[1]
    if (num.length <= 2) {
      const h = parseInt(num, 10)
      if (h < 0 || h > 23) return null
      return `${h.toString().padStart(2, '0')}:00`
    }
    const padded = num.padStart(4, '0')
    const h = parseInt(padded.slice(0, 2), 10)
    const m = parseInt(padded.slice(2, 4), 10)
    if (h < 0 || h > 23 || m < 0 || m > 59) return null
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  return null
}

type EditableHeureField = 'heureDebutPrevue' | 'heureFinPrevue' | 'heureFinAccordee' | 'heureDebut' | 'heureFin' | 'heureRestituee'

/** Numéro de semaine ISO (S1 à S53) */
function numeroSemaine(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const jour = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - jour)
  const debutAnnee = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - debutAnnee.getTime()) / 86400000 + 1) / 7)
}

function computeRow(row: ARFRow) {
  const finReelle = row.heureRestituee || row.heureFin
  let dureeReelleMin: number | null = null
  let dureePrevueMin: number | null = null
  let pourcentTemps: number | null = null

  // Réel comptabilisé : du début réel au plus tardif entre la fin ACCORDÉE du
  // jour et la restitution effective. Le prévu est la fenêtre ITC du marché ;
  // le % compare le réel accordé au prévu marché.
  if (row.heureDebut && (finReelle || row.heureFinAccordee)) {
    const fins: number[] = []
    if (finReelle) fins.push(calcDureeMinutes(row.heureDebut, finReelle, row.posteNuit))
    if (row.heureFinAccordee)
      fins.push(calcDureeMinutes(row.heureDebut, row.heureFinAccordee, row.posteNuit))
    dureeReelleMin = Math.max(...fins)
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
    field: EditableHeureField
  } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [vue, setVue] = useState<'voies' | 'liste'>('voies')
  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  // Auto-save debounced for manual lines
  const saveRef = useRef<NodeJS.Timeout>()
  const scheduleSaveManuelle = useCallback(
    (ligneId: string, data: Record<string, unknown>) => {
      clearTimeout(saveRef.current)
      saveRef.current = setTimeout(() => {
        updateLigneARFManuelle(ligneId, projetId, data)
      }, 500)
    },
    [projetId]
  )

  const handleStartEdit = (
    rowId: string,
    field: EditableHeureField,
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

    // Build updated row
    const updatedRow = { ...row, [editingCell.field]: parsed }

    // Optimistic update
    setRows((prev) =>
      prev.map((r) => (r.id === editingCell.rowId ? updatedRow : r))
    )
    setEditingCell(null)

    if (row.source === 'rapport') {
      // Only heureDebutPrevue and heureFinPrevue are editable for rapport rows
      const newDebutPrevue =
        editingCell.field === 'heureDebutPrevue' ? parsed : row.heureDebutPrevue
      const newFinPrevue =
        editingCell.field === 'heureFinPrevue' ? parsed : row.heureFinPrevue

      await updateHeuresPrevues(projetId, {
        rapportId: editingCell.rowId,
        heureDebutPrevue: newDebutPrevue,
        heureFinPrevue: newFinPrevue,
      })
    } else {
      // Manual line: auto-save debounced
      scheduleSaveManuelle(row.id, { [editingCell.field]: parsed })
    }
  }, [editingCell, editValue, rows, projetId, scheduleSaveManuelle])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  const handleDeleteManuelle = async (ligneId: string) => {
    // Optimistic removal
    setRows((prev) => prev.filter((r) => r.id !== ligneId))
    await deleteLigneARFManuelle(ligneId, projetId)
  }

  const handleAddManuelle = async (formData: {
    date: string
    posteNuit: boolean
    voie: string | null
    typeFermeture: 'voie' | 'catenaire'
    heureDebutPrevue: string | null
    heureFinPrevue: string | null
    heureFinAccordee: string | null
    heureDebut: string | null
    heureFin: string | null
    heureRestituee: string | null
    commentaire: string | null
  }) => {
    const result = await createLigneARFManuelle(projetId, formData)
    if (result.success && result.data) {
      // Add the row optimistically
      const newRow: ARFRow = {
        id: result.data.id,
        source: 'manuelle',
        date: new Date(formData.date).toISOString(),
        posteNuit: formData.posteNuit,
        voie: formData.voie,
        typeFermeture: formData.typeFermeture,
        heureDebutPrevue: formData.heureDebutPrevue,
        heureFinPrevue: formData.heureFinPrevue,
        heureFinAccordee: formData.heureFinAccordee,
        heureDebut: formData.heureDebut,
        heureFin: formData.heureFin,
        heureRestituee: formData.heureRestituee,
        commentaire: formData.commentaire,
      }
      setRows((prev) => {
        const updated = [...prev, newRow]
        updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return updated
      })
      setShowAddDialog(false)
    }
  }

  // Compute totals
  let totalMinutes = 0
  for (const row of rows) {
    const { dureeReelleMin } = computeRow(row)
    if (dureeReelleMin !== null) totalMinutes += dureeReelleMin
  }

  const isEditableField = (row: ARFRow, field: EditableHeureField): boolean => {
    if (row.source === 'manuelle') return true
    return field === 'heureDebutPrevue' || field === 'heureFinPrevue'
  }

  const renderHeureCell = (
    row: ARFRow,
    field: EditableHeureField,
    editable: boolean
  ) => {
    const isEditing =
      editingCell?.rowId === row.id && editingCell?.field === field

    if (isEditing) {
      return (
        <input
          type="text"
          className="w-20 px-1 py-0.5 text-center text-[13px] border border-[#004489] rounded bg-white focus:outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      )
    }

    const value = row[field]
    if (editable) {
      const bgClass =
        row.source === 'manuelle'
          ? 'bg-[#F0F0F0] hover:bg-[#E0E0E0]'
          : 'bg-[#FFF7D1] hover:bg-[#FFF1B0]'
      return (
        <span
          className={`inline-block w-20 px-1 py-0.5 rounded cursor-pointer ${bgClass}`}
          onClick={() => handleStartEdit(row.id, field, value ?? null)}
        >
          {value || '\u2014'}
        </span>
      )
    }

    return <>{value || '\u2014'}</>
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-[#004489] hover:bg-[#003370] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter une ligne
        </Button>
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
        <div className="flex rounded-md border border-[#DCDCDC] overflow-hidden ml-auto">
          <button
            onClick={() => setVue('voies')}
            className={`px-3 py-1.5 text-sm font-medium ${
              vue === 'voies'
                ? 'bg-[#004489] text-white'
                : 'bg-white text-[#5A5A5A] hover:text-[#004489]'
            }`}
          >
            Par voie
          </button>
          <button
            onClick={() => setVue('liste')}
            className={`px-3 py-1.5 text-sm font-medium ${
              vue === 'liste'
                ? 'bg-[#004489] text-white'
                : 'bg-white text-[#5A5A5A] hover:text-[#004489]'
            }`}
          >
            Liste (saisie)
          </button>
        </div>
      </div>

      {vue === 'voies' && <VueParVoie rows={rows} />}

      {/* Table liste détaillée (saisie) */}
      {vue === 'liste' && (
      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold">
              <th className="px-2 py-2 text-center">Sem.</th>
              <th className="px-3 py-2 text-left">Jour</th>
              <th className="px-3 py-2 text-center">Poste</th>
              <th className="px-3 py-2 text-center">Voie</th>
              <th className="px-3 py-2 text-center">Type</th>
              <th className="px-3 py-2 text-center">Debut prevu</th>
              <th className="px-3 py-2 text-center">Fin prevue</th>
              <th className="px-3 py-2 text-center">Fin accordee</th>
              <th className="px-3 py-2 text-center">Debut reel</th>
              <th className="px-3 py-2 text-center">Fin reelle</th>
              <th className="px-3 py-2 text-center">Restitution</th>
              <th className="px-3 py-2 text-right">Duree</th>
              <th className="px-3 py-2 text-right">% temps</th>
              <th className="px-3 py-2 text-center w-12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const { dureeReelleMin, pourcentTemps } = computeRow(row)
              const isManuelle = row.source === 'manuelle'
              const rowBg = isManuelle
                ? 'bg-[#FFFDE7]'
                : i % 2 === 0
                  ? 'bg-white'
                  : 'bg-[#F0F0F0]'

              return (
                <tr
                  key={row.id}
                  className={`border-b border-[#DCDCDC] ${rowBg}`}
                >
                  <td className="px-2 py-2 text-center font-semibold text-[#004489]">
                    S{numeroSemaine(new Date(row.date))}
                  </td>
                  <td className="px-3 py-2">
                    {isManuelle && (
                      <Pencil className="inline h-3 w-3 mr-1 text-[#F2AB1B]" />
                    )}
                    {formatDateFR(new Date(row.date))}
                  </td>
                  <td className="px-3 py-2 text-center text-lg">
                    {row.posteNuit ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
                  </td>

                  {/* Voie (groupement de voies) */}
                  <td className="px-3 py-1 text-center">
                    {isManuelle ? (
                      <input
                        type="text"
                        defaultValue={row.voie ?? ''}
                        placeholder="V1/VZ"
                        onBlur={(e) => {
                          const v = e.target.value.trim() || null
                          if (v !== (row.voie ?? null)) {
                            setRows((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, voie: v } : r))
                            )
                            scheduleSaveManuelle(row.id, { voie: v })
                          }
                        }}
                        className="w-20 px-1 py-0.5 text-center text-[13px] font-semibold rounded bg-[#F0F0F0] hover:bg-[#E0E0E0] border border-transparent focus:border-[#004489] focus:bg-white focus:outline-none"
                      />
                    ) : (
                      <span className="font-semibold">{row.voie || '\u2014'}</span>
                    )}
                  </td>

                  {/* Type : fermeture de voie ou consignation catenaire */}
                  <td className="px-3 py-1 text-center">
                    {isManuelle ? (
                      <button
                        onClick={() => {
                          const next = row.typeFermeture === 'catenaire' ? 'voie' : 'catenaire'
                          setRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, typeFermeture: next } : r
                            )
                          )
                          scheduleSaveManuelle(row.id, { typeFermeture: next })
                        }}
                        title="Basculer Voie / Catenaire"
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          row.typeFermeture === 'catenaire'
                            ? 'bg-[#FFF7D1] text-[#DD9412]'
                            : 'bg-[#E5EFF8] text-[#004489]'
                        }`}
                      >
                        {row.typeFermeture === 'catenaire' ? 'Catenaire' : 'Voie'}
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E5EFF8] text-[#004489]">
                        Voie
                      </span>
                    )}
                  </td>

                  {/* Debut prevu */}
                  <td className="px-3 py-1 text-center">
                    {renderHeureCell(row, 'heureDebutPrevue', isEditableField(row, 'heureDebutPrevue'))}
                  </td>

                  {/* Fin prevue */}
                  <td className="px-3 py-1 text-center">
                    {renderHeureCell(row, 'heureFinPrevue', isEditableField(row, 'heureFinPrevue'))}
                  </td>

                  {/* Fin accordee */}
                  <td className="px-3 py-1 text-center">
                    {row.source === 'manuelle'
                      ? renderHeureCell(row, 'heureFinAccordee', true)
                      : '\u2014'}
                  </td>

                  {/* Debut reel */}
                  <td className="px-3 py-1 text-center">
                    {renderHeureCell(row, 'heureDebut', isEditableField(row, 'heureDebut'))}
                  </td>

                  {/* Fin reelle */}
                  <td className="px-3 py-1 text-center">
                    {renderHeureCell(row, 'heureFin', isEditableField(row, 'heureFin'))}
                  </td>

                  {/* Restitution */}
                  <td className="px-3 py-1 text-center">
                    {renderHeureCell(row, 'heureRestituee', isEditableField(row, 'heureRestituee'))}
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

                  {/* Actions */}
                  <td className="px-3 py-2 text-center">
                    {isManuelle ? (
                      <button
                        onClick={() => handleDeleteManuelle(row.id)}
                        className="text-[#E20025] hover:text-[#B8001E] p-1"
                        title="Supprimer la ligne"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <a
                        href={`/projets/${projetId}/suivi/rapports`}
                        className="text-[#004489] hover:text-[#003370] p-1 inline-block"
                        title="Voir le rapport"
                      >
                        <ClipboardList className="h-4 w-4" />
                      </a>
                    )}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={14}
                  className="px-3 py-8 text-center text-gray-400"
                >
                  Aucun rapport journalier
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#F0F0F0] font-bold border-t-2 border-[#004489]">
              <td colSpan={11} className="px-3 py-3 text-right">
                Total cumule :
              </td>
              <td className="px-3 py-3 text-right text-[#004489]">
                {formatDuree(totalMinutes)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
      )}

      {/* Dialog d'ajout de ligne manuelle */}
      {showAddDialog && (
        <AddLigneDialog
          onClose={() => setShowAddDialog(false)}
          onSubmit={handleAddManuelle}
        />
      )}
    </div>
  )
}


// ---------------------------------------------------------------------------
// Vue « suivi » type Excel : une ligne par voie et par jour ouvré,
// bloc Prévu marché (ITC) en bleu, bloc Réel en orange, Delta en %.
// Réel restitution = plus tardif entre fin accordée et restitution effective.
// ---------------------------------------------------------------------------

const ORDRE_VOIES_PREF = ['V1/VZ', 'V2/V4', 'VT']

function finComptabilisee(e: ARFRow): string | null {
  const finReelle = e.heureRestituee || e.heureFin
  if (finReelle && e.heureFinAccordee)
    return e.heureFinAccordee > finReelle ? e.heureFinAccordee : finReelle
  return finReelle || e.heureFinAccordee || null
}

function VueParVoie({ rows }: { rows: ARFRow[] }) {
  const avecVoie = rows.filter((r) => r.voie)

  if (avecVoie.length === 0) {
    return (
      <div className="rounded-lg border border-[#DCDCDC] bg-white px-3 py-8 text-center text-gray-400 text-sm">
        Aucune ligne avec une voie renseignée — passez en vue « Liste (saisie) »
        pour renseigner la colonne Voie
      </div>
    )
  }

  // Tous les jours ouvrés entre la première et la dernière date
  const datesAvecDonnees = avecVoie.map((r) => r.date.slice(0, 10)).sort()
  const dates: string[] = []
  {
    const d = new Date(datesAvecDonnees[0] + 'T00:00:00Z')
    const fin = new Date(datesAvecDonnees[datesAvecDonnees.length - 1] + 'T00:00:00Z')
    while (d <= fin) {
      const jour = d.getUTCDay()
      if (jour !== 0 && jour !== 6) dates.push(d.toISOString().slice(0, 10))
      d.setUTCDate(d.getUTCDate() + 1)
    }
  }

  const parDate = new Map<string, ARFRow[]>()
  for (const r of avecVoie) {
    const cle = r.date.slice(0, 10)
    const liste = parDate.get(cle) || []
    liste.push(r)
    parDate.set(cle, liste)
  }
  for (const liste of Array.from(parDate.values())) {
    liste.sort((a: ARFRow, b: ARFRow) => {
      const ta = a.typeFermeture === 'catenaire' ? 1 : 0
      const tb = b.typeFermeture === 'catenaire' ? 1 : 0
      if (ta !== tb) return ta - tb
      const ia = ORDRE_VOIES_PREF.indexOf(a.voie as string)
      const ib = ORDRE_VOIES_PREF.indexOf(b.voie as string)
      return (
        (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) ||
        (a.heureDebut || '').localeCompare(b.heureDebut || '')
      )
    })
  }

  // Groupes par semaine pour le rowSpan
  const semaines: { num: number; dates: string[] }[] = []
  for (const d of dates) {
    const num = numeroSemaine(new Date(d))
    const dernier = semaines[semaines.length - 1]
    if (dernier && dernier.num === num) dernier.dates.push(d)
    else semaines.push({ num, dates: [d] })
  }
  const lignesParDate = (d: string) => Math.max(parDate.get(d)?.length ?? 1, 1)

  // Totaux
  let totalPrevu = 0
  let totalReel = 0
  for (const r of avecVoie) {
    const { dureeReelleMin, dureePrevueMin } = computeRow(r)
    if (dureePrevueMin !== null) totalPrevu += dureePrevueMin
    if (dureeReelleMin !== null) totalReel += dureeReelleMin
  }

  const cellPrevu = 'px-2 py-1 text-center bg-[#E5EFF8] text-[#003370]'
  const cellReel = 'px-2 py-1 text-center bg-[#F9E9D9]'

  return (
    <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-white font-bold">
            <th rowSpan={2} className="px-2 py-1.5 bg-[#5A5A5A]">Semaine</th>
            <th rowSpan={2} className="px-2 py-1.5 bg-[#5A5A5A]">Date</th>
            <th rowSpan={2} className="px-2 py-1.5 bg-[#5A5A5A]">Voie</th>
            <th colSpan={3} className="px-2 py-1.5 bg-[#004489] border-l-2 border-white">
              Prévu marché (ITC)
            </th>
            <th colSpan={3} className="px-2 py-1.5 bg-[#C26A32] border-l-2 border-white">
              Réel
            </th>
            <th rowSpan={2} className="px-2 py-1.5 bg-[#5A5A5A] border-l-2 border-white">
              Delta
            </th>
          </tr>
          <tr className="text-white font-bold text-[12px]">
            <th className="px-2 py-1 bg-[#0056B3] border-l-2 border-white">Obtention</th>
            <th className="px-2 py-1 bg-[#0056B3]">Restitution</th>
            <th className="px-2 py-1 bg-[#0056B3]">Temps total</th>
            <th className="px-2 py-1 bg-[#DD9412] border-l-2 border-white">Obtention</th>
            <th className="px-2 py-1 bg-[#DD9412]">Restitution</th>
            <th className="px-2 py-1 bg-[#DD9412]">Temps total</th>
          </tr>
        </thead>
        <tbody>
          {semaines.map((sem) =>
            sem.dates.map((d, iJour) => {
              const entrees = parDate.get(d) || []
              const nb = lignesParDate(d)
              const lignes = entrees.length > 0 ? entrees : [null]
              return lignes.map((e, iLigne) => {
                const calc = e ? computeRow(e) : null
                const finCompta = e ? finComptabilisee(e) : null
                const bordSemaine =
                  iJour === 0 && iLigne === 0 ? 'border-t-2 border-t-[#004489]' : ''
                return (
                  <tr
                    key={`${d}-${e?.id ?? 'vide'}`}
                    className={`border-b border-[#DCDCDC] ${bordSemaine}`}
                  >
                    {iJour === 0 && iLigne === 0 && (
                      <td
                        rowSpan={sem.dates.reduce((s2, dd) => s2 + lignesParDate(dd), 0)}
                        className={`px-2 py-1 text-center font-bold text-[#004489] bg-white border-r border-[#DCDCDC] ${bordSemaine}`}
                      >
                        S{sem.num}
                      </td>
                    )}
                    {iLigne === 0 && (
                      <td
                        rowSpan={nb}
                        className={`px-2 py-1 text-center whitespace-nowrap bg-white border-r border-[#DCDCDC] ${bordSemaine}`}
                      >
                        {formatDateFR(new Date(d))}
                      </td>
                    )}
                    <td
                      className="px-2 py-1 text-center font-semibold whitespace-nowrap"
                      title={e?.commentaire || undefined}
                    >
                      {e ? (
                        <>
                          {e.voie}
                          {e.typeFermeture === 'catenaire' && (
                            <span className="ml-1 px-1 py-0.5 rounded text-[10px] font-semibold bg-[#FFF7D1] text-[#DD9412]">
                              Cat.
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[#DCDCDC]">—</span>
                      )}
                    </td>
                    <td className={cellPrevu}>{e?.heureDebutPrevue || '—'}</td>
                    <td className={cellPrevu}>{e?.heureFinPrevue || '—'}</td>
                    <td className={`${cellPrevu} font-semibold`}>
                      {calc?.dureePrevueMin != null
                        ? formatDuree(calc.dureePrevueMin)
                        : '—'}
                    </td>
                    <td className={cellReel}>{e?.heureDebut || ''}</td>
                    <td className={cellReel} title={
                      e && finCompta && (e.heureRestituee || e.heureFin) !== finCompta
                        ? `rendu ${e.heureRestituee || e.heureFin}`
                        : undefined
                    }>
                      {finCompta || ''}
                    </td>
                    <td className={`${cellReel} font-bold text-[#E20025]`}>
                      {calc?.dureeReelleMin != null
                        ? formatDuree(calc.dureeReelleMin)
                        : '0h'}
                    </td>
                    <td className="px-2 py-1 text-center font-bold">
                      {calc?.pourcentTemps != null
                        ? `${calc.pourcentTemps.toFixed(0)} %`
                        : '0 %'}
                    </td>
                  </tr>
                )
              })
            })
          )}
        </tbody>
        <tfoot>
          <tr className="bg-[#003370] text-white font-bold border-t-2 border-[#004489]">
            <td colSpan={3} className="px-2 py-2 text-right">TOTAL :</td>
            <td colSpan={3} className="px-2 py-2 text-center">
              {formatDuree(totalPrevu)}
            </td>
            <td colSpan={3} className="px-2 py-2 text-center">
              {formatDuree(totalReel)}
            </td>
            <td className="px-2 py-2 text-center">
              {totalPrevu > 0 ? `${((totalReel / totalPrevu) * 100).toFixed(0)} %` : '—'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dialog d'ajout
// ---------------------------------------------------------------------------

function AddLigneDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: {
    date: string
    posteNuit: boolean
    voie: string | null
    typeFermeture: 'voie' | 'catenaire'
    heureDebutPrevue: string | null
    heureFinPrevue: string | null
    heureFinAccordee: string | null
    heureDebut: string | null
    heureFin: string | null
    heureRestituee: string | null
    commentaire: string | null
  }) => void
}) {
  const [date, setDate] = useState('')
  const [posteNuit, setPosteNuit] = useState(true)
  const [voie, setVoie] = useState('')
  const [typeFermeture, setTypeFermeture] = useState<'voie' | 'catenaire'>('voie')
  const [heureDebutPrevue, setHeureDebutPrevue] = useState('')
  const [heureFinPrevue, setHeureFinPrevue] = useState('')
  const [heureFinAccordee, setHeureFinAccordee] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [heureRestituee, setHeureRestituee] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!date) return
    setSubmitting(true)
    const parse = (v: string) => (v.trim() ? parseHeureFlexible(v) : null)
    await onSubmit({
      date,
      posteNuit,
      voie: voie.trim() || null,
      typeFermeture,
      heureDebutPrevue: parse(heureDebutPrevue),
      heureFinPrevue: parse(heureFinPrevue),
      heureFinAccordee: parse(heureFinAccordee),
      heureDebut: parse(heureDebut),
      heureFin: parse(heureFin),
      heureRestituee: parse(heureRestituee),
      commentaire: commentaire.trim() || null,
    })
    setSubmitting(false)
  }

  // Moved parseHeureFlexible to module scope so it can be reused here
  function parseHeureFlexible(input: string): string | null {
    const trimmed = input.trim()
    if (!trimmed) return null
    const matchColon = trimmed.match(/^(\d{1,2})[h:.](\d{2})$/)
    if (matchColon) {
      const h = parseInt(matchColon[1], 10)
      const m = parseInt(matchColon[2], 10)
      if (h < 0 || h > 23 || m < 0 || m > 59) return null
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }
    const matchNum = trimmed.match(/^(\d{1,4})$/)
    if (matchNum) {
      const num = matchNum[1]
      if (num.length <= 2) {
        const h = parseInt(num, 10)
        if (h < 0 || h > 23) return null
        return `${h.toString().padStart(2, '0')}:00`
      }
      const padded = num.padStart(4, '0')
      const h = parseInt(padded.slice(0, 2), 10)
      const m = parseInt(padded.slice(2, 4), 10)
      if (h < 0 || h > 23 || m < 0 || m > 59) return null
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-[#004489] mb-4">
          Ajouter une ligne ARF manuelle
        </h3>

        <div className="space-y-3">
          {/* Date */}
          <div>
            <label className="text-sm font-medium text-[#000000]">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
            />
          </div>

          {/* Poste */}
          <div>
            <label className="text-sm font-medium text-[#000000]">Poste</label>
            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setPosteNuit(true)}
                className={`flex-1 py-2 rounded text-sm font-medium border ${
                  posteNuit
                    ? 'bg-[#004489] text-white border-[#004489]'
                    : 'bg-white text-[#000000] border-[#DCDCDC]'
                }`}
              >
                Nuit
              </button>
              <button
                type="button"
                onClick={() => setPosteNuit(false)}
                className={`flex-1 py-2 rounded text-sm font-medium border ${
                  !posteNuit
                    ? 'bg-[#004489] text-white border-[#004489]'
                    : 'bg-white text-[#000000] border-[#DCDCDC]'
                }`}
              >
                Jour
              </button>
            </div>
          </div>

          {/* Voie + type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-[#000000]">Voie</label>
              <input
                type="text"
                value={voie}
                onChange={(e) => setVoie(e.target.value)}
                placeholder="Ex : V1/VZ, V2/V4"
                className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#000000]">Type</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setTypeFermeture('voie')}
                  className={`flex-1 py-2 rounded text-sm font-medium border ${
                    typeFermeture === 'voie'
                      ? 'bg-[#004489] text-white border-[#004489]'
                      : 'bg-white text-[#000000] border-[#DCDCDC]'
                  }`}
                >
                  Voie
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFermeture('catenaire')}
                  className={`flex-1 py-2 rounded text-sm font-medium border ${
                    typeFermeture === 'catenaire'
                      ? 'bg-[#F2AB1B] text-white border-[#F2AB1B]'
                      : 'bg-white text-[#000000] border-[#DCDCDC]'
                  }`}
                >
                  Catenaire
                </button>
              </div>
            </div>
          </div>

          {/* Heures */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-[#000000]">Debut prevu</label>
              <input
                type="text"
                value={heureDebutPrevue}
                onChange={(e) => setHeureDebutPrevue(e.target.value)}
                placeholder="22:00"
                className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#000000]">Fin prevue</label>
              <input
                type="text"
                value={heureFinPrevue}
                onChange={(e) => setHeureFinPrevue(e.target.value)}
                placeholder="06:00"
                className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-[#000000]">Fin accordee (du jour)</label>
              <input
                type="text"
                value={heureFinAccordee}
                onChange={(e) => setHeureFinAccordee(e.target.value)}
                placeholder="15:55"
                className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#000000]">Debut reel</label>
              <input
                type="text"
                value={heureDebut}
                onChange={(e) => setHeureDebut(e.target.value)}
                placeholder="22:15"
                className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#000000]">Fin reelle</label>
              <input
                type="text"
                value={heureFin}
                onChange={(e) => setHeureFin(e.target.value)}
                placeholder="05:45"
                className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-[#000000]">Restitution</label>
              <input
                type="text"
                value={heureRestituee}
                onChange={(e) => setHeureRestituee(e.target.value)}
                placeholder="06:00"
                className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Commentaire */}
          <div>
            <label className="text-sm font-medium text-[#000000]">Commentaire</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={2}
              className="mt-1 w-full px-3 py-2 border border-[#DCDCDC] rounded focus:border-[#004489] focus:outline-none text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onClose}
            className="bg-white hover:bg-[#F0F0F0] text-[#004489] border border-[#004489]"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!date || submitting}
            className="bg-[#004489] hover:bg-[#003370] text-white"
          >
            {submitting ? 'Ajout...' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </div>
  )
}
