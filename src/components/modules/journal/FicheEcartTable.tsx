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
import { Plus, Download, Import, Trash2 } from 'lucide-react'
import {
  getLignesFicheEcart,
  createLigneFicheEcart,
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

type FieldKey =
  | 'etude'
  | 'prevuDCE'
  | 'phaseTransitoire'
  | 'exe'
  | 'impacts'
  | 'delaisImpactes'
  | 'coutImpactes'

const COLUMNS: { key: FieldKey; label: string }[] = [
  { key: 'etude', label: 'ETUDE' },
  { key: 'prevuDCE', label: 'Prevu au DCE' },
  { key: 'phaseTransitoire', label: 'Phase transitoire' },
  { key: 'exe', label: 'EXE' },
  { key: 'impacts', label: 'Impacts et consequences' },
  { key: 'delaisImpactes', label: 'Delais impactes' },
  { key: 'coutImpactes', label: 'Couts impactes' },
]

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

  const handleAddLine = () => {
    startTransition(async () => {
      const result = await createLigneFicheEcart(projetId)
      if (result.success) {
        await fetchLignes()
      }
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

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={handleAddLine}
          size="sm"
          disabled={isPending}
          style={{ backgroundColor: '#1565C0' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter une ligne
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
                  colSpan={8}
                  className="text-center text-gray-400 py-12"
                >
                  Aucune ligne. Cliquez sur "Ajouter une ligne" ou "Importer
                  depuis Journal".
                </td>
              </tr>
            )}
            {lignes.map((ligne, i) => (
              <tr
                key={ligne.id}
                style={
                  i % 2 !== 0 ? { backgroundColor: '#F5F7FA' } : undefined
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
            ))}
          </tbody>
        </table>
      </div>

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
