'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Download, Import, Trash2, ChevronDown } from 'lucide-react'
import {
  getLignesFicheEcart,
  createLigneFicheEcart,
  createChapitreFicheEcart,
  createLigneSousChapitre,
  renommerChapitre,
  deleteChapitreFicheEcart,
  updateLigneFicheEcart,
  deleteLigneFicheEcart,
  importerDepuisJournal,
} from '@/actions/fiche-ecart'
import dynamic from 'next/dynamic'

const FicheEcartTablePDFButton = dynamic(
  () =>
    import('./FicheEcartTablePDFButton').then((m) => m.FicheEcartTablePDFButton),
  {
    ssr: false,
    loading: () => (
      <Button size="sm" variant="outline" disabled>
        Chargement PDF...
      </Button>
    ),
  }
)

interface LigneFicheEcart {
  id: string
  projetId: string
  evenementId: string | null
  etude: string
  prevuDCE: string
  phaseTransitoire: string
  exe: string
  impacts: string
  delaisImpactes: string
  coutImpactes: string
  ordre: number
  chapitre: string
  estChapitre: boolean
}

interface EvenementRow {
  id: string
  date: Date
  titre: string
  description: string | null
  categorie: string
}

interface FicheEcartTableProps {
  projetId: string
  projetName: string
  evenements: EvenementRow[]
}

// Auto-resize textarea cell
function CellTextarea({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      className="w-full bg-transparent border-0 outline-none resize-none text-sm px-1 py-0.5 focus:ring-1 focus:ring-blue-300 rounded"
      style={{ minHeight: '28px' }}
    />
  )
}

// Inline editable chapter name
function ChapitreNameEditor({
  nom,
  onSave,
}: {
  nom: string
  onSave: (newNom: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(nom)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(nom)
  }, [nom])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSave = () => {
    setEditing(false)
    const trimmed = value.trim()
    if (trimmed && trimmed !== nom) {
      onSave(trimmed)
    } else {
      setValue(nom)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') {
            setValue(nom)
            setEditing(false)
          }
        }}
        className="bg-white/20 text-white font-semibold text-sm px-2 py-0.5 rounded border border-white/30 outline-none"
        style={{ minWidth: '120px' }}
      />
    )
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      className="cursor-pointer font-semibold text-sm select-none"
      title="Double-cliquez pour renommer"
    >
      <ChevronDown className="h-3.5 w-3.5 inline mr-1.5" />
      {nom}
    </span>
  )
}

type FieldKey =
  | 'prevuDCE'
  | 'phaseTransitoire'
  | 'exe'
  | 'impacts'
  | 'delaisImpactes'
  | 'coutImpactes'

const COLUMNS: { key: FieldKey; label: string }[] = [
  { key: 'prevuDCE', label: 'Prevu au DCE' },
  { key: 'phaseTransitoire', label: 'Phase transitoire' },
  { key: 'exe', label: 'EXE' },
  { key: 'impacts', label: 'Impacts et consequences' },
  { key: 'delaisImpactes', label: 'Delais impactes' },
  { key: 'coutImpactes', label: 'Couts impactes' },
]

const TOTAL_COLS = COLUMNS.length + 1 // +1 for delete button column

export function FicheEcartTable({
  projetId,
  projetName,
  evenements,
}: FicheEcartTableProps) {
  const [lignes, setLignes] = useState<LigneFicheEcart[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [deleteChapitreConfirm, setDeleteChapitreConfirm] = useState<string | null>(null)

  // Debounce timers
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({})

  const fetchLignes = useCallback(async () => {
    try {
      const data = await getLignesFicheEcart(projetId)
      setLignes(data as LigneFicheEcart[])
    } catch (err) {
      console.error('Fetch lignes error:', err)
    } finally {
      setLoading(false)
    }
  }, [projetId])

  useEffect(() => {
    fetchLignes()
  }, [fetchLignes])

  const handleCellChange = (
    ligneId: string,
    field: FieldKey,
    value: string
  ) => {
    // Optimistic update
    setLignes((prev) =>
      prev.map((l) => (l.id === ligneId ? { ...l, [field]: value } : l))
    )

    // Debounced save
    const timerKey = `${ligneId}-${field}`
    if (debounceTimers.current[timerKey]) {
      clearTimeout(debounceTimers.current[timerKey])
    }
    debounceTimers.current[timerKey] = setTimeout(async () => {
      await updateLigneFicheEcart(projetId, ligneId, { [field]: value })
    }, 500)
  }

  const handleAddChapitre = () => {
    startTransition(async () => {
      const result = await createChapitreFicheEcart(projetId)
      if (result.success) {
        await fetchLignes()
      }
    })
  }

  const handleAddLigneSousChapitre = (chapitreNom: string) => {
    startTransition(async () => {
      const result = await createLigneSousChapitre(projetId, chapitreNom)
      if (result.success) {
        await fetchLignes()
      }
    })
  }

  const handleRenommerChapitre = (ligneId: string, newNom: string) => {
    // Optimistic update
    setLignes((prev) => {
      const chapitre = prev.find((l) => l.id === ligneId)
      if (!chapitre) return prev
      const ancienNom = chapitre.chapitre
      return prev.map((l) => {
        if (l.id === ligneId) return { ...l, chapitre: newNom }
        if (l.chapitre === ancienNom && !l.estChapitre)
          return { ...l, chapitre: newNom }
        return l
      })
    })

    startTransition(async () => {
      await renommerChapitre(projetId, ligneId, newNom)
    })
  }

  const handleDeleteChapitre = (ligneId: string) => {
    startTransition(async () => {
      const result = await deleteChapitreFicheEcart(projetId, ligneId)
      if (result.success) {
        await fetchLignes()
      }
      setDeleteChapitreConfirm(null)
    })
  }

  const handleDeleteLine = (ligneId: string) => {
    startTransition(async () => {
      const result = await deleteLigneFicheEcart(projetId, ligneId)
      if (result.success) {
        setLignes((prev) => prev.filter((l) => l.id !== ligneId))
      }
    })
  }

  // Import dialog: filter out already-imported events
  const importedEventIds = new Set(
    lignes.filter((l) => l.evenementId).map((l) => l.evenementId!)
  )
  const availableEvents = evenements.filter(
    (ev) => !importedEventIds.has(ev.id)
  )

  const handleImport = () => {
    if (selectedEventIds.length === 0) return
    startTransition(async () => {
      const result = await importerDepuisJournal(projetId, selectedEventIds)
      if (result.success) {
        setImportDialogOpen(false)
        setSelectedEventIds([])
        await fetchLignes()
      }
    })
  }

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        Chargement...
      </div>
    )
  }

  // Group lines: iterate in order, render chapter headers and data rows
  let dataRowIndex = 0

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={handleAddChapitre}
          size="sm"
          disabled={isPending}
          style={{ backgroundColor: '#1565C0' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter un chapitre
        </Button>

        <Button
          onClick={() => {
            setSelectedEventIds([])
            setImportDialogOpen(true)
          }}
          size="sm"
          variant="outline"
          disabled={isPending}
        >
          <Import className="h-4 w-4 mr-1.5" />
          Importer depuis Journal
        </Button>

        <FicheEcartTablePDFButton lignes={lignes} projetName={projetName} />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '900px' }}>
          <thead>
            <tr style={{ backgroundColor: '#263238' }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-white font-medium px-3 py-2.5 text-xs"
                >
                  {col.label}
                </th>
              ))}
              <th className="text-center text-white font-medium px-2 py-2.5 w-[50px] text-xs">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {lignes.length === 0 && (
              <tr>
                <td
                  colSpan={TOTAL_COLS}
                  className="text-center text-gray-400 py-12"
                >
                  Aucune ligne. Cliquez sur &quot;Ajouter un chapitre&quot; ou
                  &quot;Importer depuis Journal&quot;.
                </td>
              </tr>
            )}
            {lignes.map((ligne) => {
              if (ligne.estChapitre) {
                // Chapter header row
                return (
                  <tr key={ligne.id}>
                    <td
                      colSpan={TOTAL_COLS}
                      style={{ backgroundColor: '#1A237E' }}
                      className="text-white px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <ChapitreNameEditor
                          nom={ligne.chapitre}
                          onSave={(newNom) =>
                            handleRenommerChapitre(ligne.id, newNom)
                          }
                        />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleAddLigneSousChapitre(ligne.chapitre)
                            }
                            disabled={isPending}
                            className="text-white/80 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Ligne
                          </button>
                          <button
                            onClick={() =>
                              setDeleteChapitreConfirm(ligne.id)
                            }
                            className="text-white/60 hover:text-red-300 transition-colors p-1"
                            title="Supprimer le chapitre"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              }

              // Data row
              const rowIdx = dataRowIndex++
              return (
                <tr
                  key={ligne.id}
                  style={
                    rowIdx % 2 !== 0
                      ? { backgroundColor: '#F5F7FA' }
                      : undefined
                  }
                >
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-2 py-1 align-top">
                      <CellTextarea
                        value={ligne[col.key]}
                        onChange={(val) =>
                          handleCellChange(ligne.id, col.key, val)
                        }
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center align-top">
                    <button
                      onClick={() => handleDeleteLine(ligne.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Chapter Confirmation Dialog */}
      <Dialog
        open={deleteChapitreConfirm !== null}
        onOpenChange={() => setDeleteChapitreConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le chapitre ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Cette action supprimera le chapitre et toutes ses lignes. Cette
            action est irreversible.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteChapitreConfirm(null)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (deleteChapitreConfirm) {
                  handleDeleteChapitre(deleteChapitreConfirm)
                }
              }}
              disabled={isPending}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importer depuis le Journal</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-1 py-2">
            {availableEvents.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                Tous les evenements ont deja ete importes.
              </p>
            ) : (
              availableEvents.map((ev) => {
                const dateStr = new Date(ev.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
                const isSelected = selectedEventIds.includes(ev.id)
                return (
                  <label
                    key={ev.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEventSelection(ev.id)}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {ev.titre}
                      </div>
                      <div className="text-xs text-gray-500">{dateStr}</div>
                    </div>
                  </label>
                )
              })
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImportDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={selectedEventIds.length === 0 || isPending}
              style={{ backgroundColor: '#1565C0' }}
              className="text-white hover:opacity-90"
            >
              Importer ({selectedEventIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
