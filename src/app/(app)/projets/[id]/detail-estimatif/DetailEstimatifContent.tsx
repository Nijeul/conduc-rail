'use client'

import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { Plus, Trash2, GripVertical, FileDown, Loader2 } from 'lucide-react'
import { formatNombreFR } from '@/lib/utils'
import {
  getLignesDE,
  createLigneDE,
  updateLigneDE,
  deleteLigneDE,
  reorderLignesDE,
} from '@/actions/detail-estimatif'
import type { LigneDE } from '@prisma/client'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const UNITES = ['ml', 'u', 'm²', 'm³', 't', 'kg', 'h', 'j', 'f', 'ens.', '%']

interface DetailEstimatifContentProps {
  projetId: string
  projetName: string
}

interface EditingCell {
  ligneId: string
  field: 'code' | 'designation' | 'unite' | 'quantite' | 'prixUnitaire'
}

function SortableRow({
  ligne,
  index,
  editingCell,
  editValue,
  onCellClick,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  onDelete,
  deletingId,
  onUniteCommit,
}: {
  ligne: LigneDE
  index: number
  editingCell: EditingCell | null
  editValue: string
  onCellClick: (ligneId: string, field: EditingCell['field'], value: string) => void
  onEditChange: (value: string) => void
  onEditBlur: () => void
  onEditKeyDown: (e: React.KeyboardEvent) => void
  onDelete: (id: string) => void
  deletingId: string | null
  onUniteCommit: (ligneId: string, value: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ligne.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging
      ? '#E5EFF8'
      : index % 2 === 0
      ? '#FFFFFF'
      : '#F0F0F0',
    borderBottom: '1px solid #DCDCDC',
    opacity: isDragging ? 0.8 : 1,
  }

  const total = ligne.quantite * ligne.prixUnitaire

  const isEditing = (field: EditingCell['field']) =>
    editingCell?.ligneId === ligne.id && editingCell?.field === field

  const [uniteCustom, setUniteCustom] = useState(false)

  const renderCell = (field: EditingCell['field'], value: string, align: string = 'left') => {
    if (isEditing(field)) {
      if (field === 'unite') {
        if (uniteCustom || (editValue && !UNITES.includes(editValue) && editValue !== '')) {
          return (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={() => {
                onUniteCommit(ligne.id, editValue)
                setUniteCustom(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUniteCommit(ligne.id, editValue)
                  setUniteCustom(false)
                } else if (e.key === 'Escape') {
                  onUniteCommit(ligne.id, ligne.unite)
                  setUniteCustom(false)
                }
              }}
              autoFocus
              placeholder="Unite..."
              className="w-full h-8 px-2 text-xs border border-blue-400 rounded bg-white focus:outline-none"
            />
          )
        }
        return (
          <div className="relative">
            <select
              value={UNITES.includes(editValue) ? editValue : ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '__custom__') {
                  setUniteCustom(true)
                  onEditChange('')
                  return
                }
                onUniteCommit(ligne.id, val)
              }}
              onBlur={() => {
                onUniteCommit(ligne.id, editValue)
              }}
              autoFocus
              className="w-full h-8 px-2 text-xs border border-blue-400 rounded bg-white focus:outline-none"
            >
              <option value="">--</option>
              {UNITES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
              <option value="__custom__">Autre...</option>
            </select>
          </div>
        )
      }
      return (
        <input
          type={field === 'quantite' || field === 'prixUnitaire' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditBlur}
          onKeyDown={onEditKeyDown}
          autoFocus
          step={field === 'prixUnitaire' ? '0.01' : field === 'quantite' ? '0.001' : undefined}
          min={field === 'quantite' || field === 'prixUnitaire' ? '0' : undefined}
          className="w-full h-8 px-2 text-xs border border-blue-400 rounded bg-white focus:outline-none"
          style={{ textAlign: align === 'right' ? 'right' : 'left' }}
        />
      )
    }

    return (
      <span
        className="block w-full px-2 py-1.5 cursor-text hover:bg-blue-50 rounded text-xs min-h-[28px]"
        style={{ textAlign: align === 'right' ? 'right' : 'left' }}
        onClick={() => onCellClick(ligne.id, field, value)}
      >
        {field === 'quantite' || field === 'prixUnitaire'
          ? formatNombreFR(Number(value), field === 'prixUnitaire' ? 2 : 3)
          : value || '\u00A0'}
      </span>
    )
  }

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="px-1 py-1 w-8">
        <button
          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      </td>
      <td className="px-1 py-1 w-[100px]">
        {renderCell('code', ligne.code)}
      </td>
      <td className="px-1 py-1">
        {renderCell('designation', ligne.designation)}
      </td>
      <td className="px-1 py-1 w-[70px]">
        {renderCell('unite', ligne.unite)}
      </td>
      <td className="px-1 py-1 w-[100px]">
        {renderCell('quantite', String(ligne.quantite), 'right')}
      </td>
      <td className="px-1 py-1 w-[110px]">
        {renderCell('prixUnitaire', String(ligne.prixUnitaire), 'right')}
      </td>
      <td className="px-1 py-1 w-[120px] text-right text-xs font-medium pr-3">
        {formatNombreFR(total, 2)} &euro;
      </td>
      <td className="px-1 py-1 w-8">
        <button
          onClick={() => onDelete(ligne.id)}
          disabled={deletingId === ligne.id}
          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  )
}

export function DetailEstimatifContent({ projetId, projetName }: DetailEstimatifContentProps) {
  const [lignes, setLignes] = useState<LigneDE[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef<{ ligneId: string; field: string; value: unknown } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Load data on mount
  useEffect(() => {
    setLoading(true)
    getLignesDE(projetId)
      .then((data) => setLignes(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [projetId])

  const flushSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    if (pendingSaveRef.current) {
      const { ligneId, field, value } = pendingSaveRef.current
      pendingSaveRef.current = null
      updateLigneDE(projetId, { id: ligneId, [field]: value }).catch(console.error)
    }
  }, [projetId])

  // Ctrl+S handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        flushSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flushSave])

  const scheduleAutoSave = useCallback(
    (ligneId: string, field: string, value: unknown) => {
      pendingSaveRef.current = { ligneId, field, value }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        flushSave()
      }, 500)
    },
    [flushSave]
  )

  const handleCellClick = (ligneId: string, field: EditingCell['field'], value: string) => {
    flushSave()
    setEditingCell({ ligneId, field })
    setEditValue(value)
  }

  const handleEditBlur = () => {
    if (!editingCell) return

    const ligne = lignes.find((l) => l.id === editingCell.ligneId)
    if (!ligne) {
      setEditingCell(null)
      return
    }

    const field = editingCell.field
    let newValue: string | number = editValue

    if (field === 'quantite' || field === 'prixUnitaire') {
      newValue = parseFloat(editValue) || 0
    }

    setLignes((prev) =>
      prev.map((l) =>
        l.id === editingCell.ligneId ? { ...l, [field]: newValue } : l
      )
    )

    scheduleAutoSave(editingCell.ligneId, field, newValue)
    setEditingCell(null)
  }

  const handleUniteCommit = useCallback(
    (ligneId: string, value: string) => {
      setLignes((prev) =>
        prev.map((l) => (l.id === ligneId ? { ...l, unite: value } : l))
      )
      scheduleAutoSave(ligneId, 'unite', value)
      setEditingCell(null)
    },
    [scheduleAutoSave]
  )

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditBlur()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
    }
  }

  const handleAddLine = () => {
    startTransition(async () => {
      const result = await createLigneDE(projetId, {
        code: '',
        designation: '',
        unite: '',
        quantite: 0,
        prixUnitaire: 0,
      })
      if (result.success) {
        setLignes((prev) => [
          ...prev,
          {
            id: result.data.id,
            projetId,
            code: '',
            designation: '',
            unite: '',
            quantite: 0,
            prixUnitaire: 0,
            ordre: prev.length,
            createdAt: new Date(),
          },
        ])
      }
    })
  }

  const handleDelete = (ligneId: string) => {
    if (!confirm('Supprimer cette ligne ?')) return

    setDeletingId(ligneId)
    startTransition(async () => {
      const result = await deleteLigneDE(projetId, ligneId)
      if (result.success) {
        setLignes((prev) => prev.filter((l) => l.id !== ligneId))
      }
      setDeletingId(null)
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setLignes((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id)
      const newIndex = prev.findIndex((l) => l.id === over.id)
      const newOrder = arrayMove(prev, oldIndex, newIndex)

      reorderLignesDE(
        projetId,
        newOrder.map((l) => l.id)
      ).catch(console.error)

      return newOrder
    })
  }

  const totalHT = lignes.reduce(
    (sum, l) => sum + l.quantite * l.prixUnitaire,
    0
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b shrink-0 flex items-center justify-between" style={{ borderColor: '#DCDCDC' }}>
        <h1 className="text-lg font-bold" style={{ color: '#004489' }}>
          Détail Estimatif - {projetName}
        </h1>
        <button
          onClick={() =>
            exportAvecGuard(async () => {
              const date = new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
              const fileName = `DE_${projetName.replace(/[^a-zA-Z0-9]/g, '_')}_${date.replace(/\//g, '-')}.pdf`

              const { pdf } = await import('@react-pdf/renderer')
              const { DetailEstimatifPDF } = await import('@/lib/pdf/detail-estimatif')
              const { createElement } = await import('react')

              const doc = createElement(DetailEstimatifPDF, {
                lignes,
                projetName,
                totalHT,
                userLogo: userLogo ?? undefined,
                nomSociete: nomSociete ?? undefined,
              })
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const blob = await pdf(doc as any).toBlob()
              const url = URL.createObjectURL(blob)

              const a = document.createElement('a')
              a.style.display = 'none'
              a.href = url
              a.download = fileName
              document.body.appendChild(a)
              a.click()
              setTimeout(() => {
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }, 100)
            })
          }
          disabled={isExporting}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#F0F0F0', color: '#000000', border: '1px solid #DCDCDC' }}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {isExporting ? 'Génération...' : 'Export PDF'}
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            Chargement...
          </div>
        ) : (
          <table className="w-full text-left" style={{ fontSize: '12px' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: '#004489' }}>
                <th className="px-1 py-2.5 w-8"></th>
                <th className="px-2 py-2.5 text-white font-semibold w-[100px]">N&deg; de prix</th>
                <th className="px-2 py-2.5 text-white font-semibold">Intitulé</th>
                <th className="px-2 py-2.5 text-white font-semibold w-[70px]">Unité</th>
                <th className="px-2 py-2.5 text-white font-semibold text-right w-[100px]">Qté marché</th>
                <th className="px-2 py-2.5 text-white font-semibold text-right w-[110px]">PU HT (&euro;)</th>
                <th className="px-2 py-2.5 text-white font-semibold text-right w-[120px]">Total HT (&euro;)</th>
                <th className="px-2 py-2.5 w-8"></th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lignes.map((l) => l.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {lignes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-sm">
                        Aucune ligne. Cliquez sur &quot;+ Ligne&quot; pour commencer.
                      </td>
                    </tr>
                  ) : (
                    lignes.map((ligne, i) => (
                      <SortableRow
                        key={ligne.id}
                        ligne={ligne}
                        index={i}
                        editingCell={editingCell}
                        editValue={editValue}
                        onCellClick={handleCellClick}
                        onEditChange={setEditValue}
                        onEditBlur={handleEditBlur}
                        onEditKeyDown={handleEditKeyDown}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                        onUniteCommit={handleUniteCommit}
                      />
                    ))
                  )}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t px-6 py-3 flex items-center justify-between" style={{ borderColor: '#DCDCDC' }}>
        <button
          onClick={handleAddLine}
          disabled={isPending}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#004489' }}
        >
          <Plus className="h-4 w-4" />
          Ligne
        </button>
        <div className="text-sm font-bold" style={{ color: '#004489' }}>
          Total HT : {formatNombreFR(totalHT, 2)} &euro;
        </div>
      </div>
    </div>
  )
}
