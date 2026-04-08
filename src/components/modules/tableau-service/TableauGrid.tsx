'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTableauStore } from './use-tableau-store'
import { TYPES_LIGNES, COULEURS_COLONNES, type ColonneTS, type PersonnelMap } from './types'
import { SortableRow } from './SortableRow'
import { CellEditDialog } from './CellEditDialog'

interface Props {
  exportPdfButton: React.ReactNode
  personnelMap: PersonnelMap
}

export function TableauGrid({ exportPdfButton, personnelMap }: Props) {
  const {
    colonnes,
    lignes,
    cellules,
    saving,
    dirty,
    addColonne,
    renameColonne,
    changeColonneCouleur,
    removeColonne,
    addLigne,
    renameLigne,
    changeLigneType,
    removeLigne,
    reorderLignes,
  } = useTableauStore()

  // Cell edit dialog
  const [cellEdit, setCellEdit] = useState<{ ligneId: string; colId: string } | null>(null)

  // Column context menu
  const [colMenu, setColMenu] = useState<{ x: number; y: number; col: ColonneTS } | null>(null)
  const [colRenaming, setColRenaming] = useState<string | null>(null)
  const [colRenameValue, setColRenameValue] = useState('')
  const [colColorPicking, setColColorPicking] = useState<string | null>(null)
  const [customHex, setCustomHex] = useState('')

  // Ligne context menu
  const [ligneMenu, setLigneMenu] = useState<{ x: number; y: number; ligneId: string } | null>(null)
  const [ligneRenaming, setLigneRenaming] = useState<string | null>(null)
  const [ligneRenameValue, setLigneRenameValue] = useState('')
  const [ligneTypeChanging, setLigneTypeChanging] = useState<string | null>(null)

  // Add ligne dialog
  const [showAddLigne, setShowAddLigne] = useState(false)
  const [newLigneType, setNewLigneType] = useState<string>(TYPES_LIGNES[0].type)

  // Add colonne
  const [showAddCol, setShowAddCol] = useState(false)
  const [newColNom, setNewColNom] = useState('')

  const colMenuRef = useRef<HTMLDivElement>(null)
  const ligneMenuRef = useRef<HTMLDivElement>(null)
  const colRenameRef = useRef<HTMLInputElement>(null)
  const ligneRenameRef = useRef<HTMLInputElement>(null)

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenu(null)
        setColColorPicking(null)
      }
      if (ligneMenuRef.current && !ligneMenuRef.current.contains(e.target as Node)) {
        setLigneMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (colRenaming && colRenameRef.current) {
      colRenameRef.current.focus()
      colRenameRef.current.select()
    }
  }, [colRenaming])

  useEffect(() => {
    if (ligneRenaming && ligneRenameRef.current) {
      ligneRenameRef.current.focus()
      ligneRenameRef.current.select()
    }
  }, [ligneRenaming])

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = lignes.findIndex((l) => l.id === active.id)
    const newIndex = lignes.findIndex((l) => l.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newLignes = [...lignes]
    const [moved] = newLignes.splice(oldIndex, 1)
    newLignes.splice(newIndex, 0, moved)
    reorderLignes(newLignes)
  }

  // Column context menu handler
  const handleColContextMenu = useCallback((e: React.MouseEvent, col: ColonneTS) => {
    e.preventDefault()
    setLigneMenu(null)
    setColMenu({ x: e.clientX, y: e.clientY, col })
    setColColorPicking(null)
  }, [])

  // Ligne context menu handler
  const handleLigneContextMenu = useCallback((e: React.MouseEvent, ligneId: string) => {
    e.preventDefault()
    setColMenu(null)
    setLigneMenu({ x: e.clientX, y: e.clientY, ligneId })
  }, [])

  function handleAddColonne() {
    if (!newColNom.trim()) return
    addColonne(newColNom.trim())
    setNewColNom('')
    setShowAddCol(false)
  }

  function handleAddLigne() {
    // Use the type name as libelle automatically
    addLigne(newLigneType, newLigneType)
    setNewLigneType(TYPES_LIGNES[0].type)
    setShowAddLigne(false)
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap px-4 py-2 bg-white border-b border-[#DCDCDC]">
        <div className="flex items-center gap-2">
          {exportPdfButton}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {saving && (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Sauvegarde...
            </span>
          )}
          {!saving && dirty && (
            <span className="flex items-center gap-1">
              <Save className="h-3 w-3" />
              Non sauvegarde
            </span>
          )}
          {!saving && !dirty && (
            <span className="text-green-600">Sauvegarde</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="overflow-x-auto">
          <table className="border-collapse min-w-full">
            <thead>
              <tr>
                {/* Poste column header */}
                <th className="border border-[#DCDCDC] bg-[#004489] text-white text-[12px] font-bold px-3 py-2 text-left" style={{ width: 180, minWidth: 180, maxWidth: 180 }}>
                  Poste
                </th>
                {colonnes.map((col) => (
                  <th
                    key={col.id}
                    className="border border-[#DCDCDC] text-white text-[12px] font-bold px-3 py-2 text-center cursor-context-menu select-none"
                    style={{ minWidth: 150, backgroundColor: col.couleur }}
                    onContextMenu={(e) => handleColContextMenu(e, col)}
                  >
                    {colRenaming === col.id ? (
                      <input
                        ref={colRenameRef}
                        value={colRenameValue}
                        onChange={(e) => setColRenameValue(e.target.value)}
                        onBlur={() => {
                          if (colRenameValue.trim()) renameColonne(col.id, colRenameValue.trim())
                          setColRenaming(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (colRenameValue.trim()) renameColonne(col.id, colRenameValue.trim())
                            setColRenaming(null)
                          }
                          if (e.key === 'Escape') setColRenaming(null)
                        }}
                        className="w-full bg-white/20 text-white text-[12px] px-1 py-0 border border-white/40 rounded outline-none text-center"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      col.nom
                    )}
                  </th>
                ))}
                {/* Add column button header */}
                <th className="border border-[#DCDCDC] bg-slate-50 px-2 py-2 w-10">
                  <button
                    onClick={() => setShowAddCol(true)}
                    className="flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors mx-auto"
                    title="Ajouter une colonne"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={lignes.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {lignes.map((ligne, idx) => (
                    <SortableRow
                      key={ligne.id}
                      ligne={ligne}
                      colonnes={colonnes}
                      cellules={cellules}
                      personnelMap={personnelMap}
                      onCellDoubleClick={(ligneId, colId) => setCellEdit({ ligneId, colId })}
                      onLigneContextMenu={handleLigneContextMenu}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>

          {/* Add ligne button */}
          <button
            onClick={() => setShowAddLigne(true)}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            + Ligne
          </button>
        </div>

        {/* Empty state */}
        {colonnes.length === 0 && lignes.length === 0 && (
          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>Ce tableau est vide.</p>
            <p className="mt-1">
              Commencez par ajouter des colonnes (activites/equipes) puis des lignes (postes).
            </p>
          </div>
        )}
      </div>

      {/* Column context menu */}
      {colMenu && (
        <div
          ref={colMenuRef}
          className="fixed z-50 bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[180px]"
          style={{ left: colMenu.x, top: colMenu.y }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100"
            onClick={() => {
              setColRenameValue(colMenu.col.nom)
              setColRenaming(colMenu.col.id)
              setColMenu(null)
            }}
          >
            Renommer
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100"
            onClick={() => setColColorPicking(colMenu.col.id)}
          >
            Changer la couleur
          </button>
          <div className="h-px bg-slate-200 my-1" />
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-[#E20025] hover:bg-red-50"
            onClick={() => {
              removeColonne(colMenu.col.id)
              setColMenu(null)
            }}
          >
            Supprimer
          </button>

          {/* Color picker sub-panel */}
          {colColorPicking && (
            <div className="border-t border-slate-200 mt-1 pt-2 px-3 pb-2">
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {COULEURS_COLONNES.map((c) => (
                  <button
                    key={c}
                    className="w-6 h-6 rounded border border-slate-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      changeColonneCouleur(colColorPicking, c)
                      setColMenu(null)
                      setColColorPicking(null)
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="#hex"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded px-2 py-1"
                />
                <button
                  className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200"
                  onClick={() => {
                    if (/^#[0-9a-fA-F]{6}$/.test(customHex)) {
                      changeColonneCouleur(colColorPicking, customHex)
                      setColMenu(null)
                      setColColorPicking(null)
                      setCustomHex('')
                    }
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ligne context menu */}
      {ligneMenu && (
        <div
          ref={ligneMenuRef}
          className="fixed z-50 bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[200px]"
          style={{ left: ligneMenu.x, top: ligneMenu.y }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100"
            onClick={() => {
              const l = lignes.find((li) => li.id === ligneMenu.ligneId)
              setLigneRenameValue(l?.libelle || '')
              setLigneRenaming(ligneMenu.ligneId)
              setLigneMenu(null)
            }}
          >
            Renommer
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-slate-100"
            onClick={() => {
              setLigneTypeChanging(ligneMenu.ligneId)
              setLigneMenu(null)
            }}
          >
            Changer le type
          </button>
          <div className="h-px bg-slate-200 my-1" />
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-[#E20025] hover:bg-red-50"
            onClick={() => {
              removeLigne(ligneMenu.ligneId)
              setLigneMenu(null)
            }}
          >
            Supprimer
          </button>
        </div>
      )}

      {/* Ligne rename inline */}
      {ligneRenaming && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center" onClick={() => setLigneRenaming(null)}>
          <div className="bg-white rounded-lg shadow-lg p-4 min-w-[300px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium mb-2">Renommer la ligne</h3>
            <Input
              ref={ligneRenameRef}
              value={ligneRenameValue}
              onChange={(e) => setLigneRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (ligneRenameValue.trim()) renameLigne(ligneRenaming, ligneRenameValue.trim())
                  setLigneRenaming(null)
                }
                if (e.key === 'Escape') setLigneRenaming(null)
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => setLigneRenaming(null)}>
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-[#004489] hover:bg-[#004489]/90 text-white"
                onClick={() => {
                  if (ligneRenameValue.trim()) renameLigne(ligneRenaming, ligneRenameValue.trim())
                  setLigneRenaming(null)
                }}
              >
                Renommer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change type dialog */}
      {ligneTypeChanging && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center" onClick={() => setLigneTypeChanging(null)}>
          <div className="bg-white rounded-lg shadow-lg p-4 min-w-[340px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium mb-3">Changer le type de la ligne</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {TYPES_LIGNES.map((tl) => (
                <button
                  key={tl.type}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-sm text-left"
                  onClick={() => {
                    changeLigneType(ligneTypeChanging, tl.type)
                    setLigneTypeChanging(null)
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-sm border border-slate-200 shrink-0"
                    style={{ backgroundColor: tl.bg }}
                  />
                  <span>{tl.type}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <Button size="sm" variant="outline" onClick={() => setLigneTypeChanging(null)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add colonne dialog */}
      {showAddCol && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center" onClick={() => setShowAddCol(false)}>
          <div className="bg-white rounded-lg shadow-lg p-4 min-w-[300px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium mb-2">Nouvelle colonne</h3>
            <Input
              value={newColNom}
              onChange={(e) => setNewColNom(e.target.value)}
              placeholder="Nom de la colonne"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddColonne()
                if (e.key === 'Escape') setShowAddCol(false)
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => setShowAddCol(false)}>
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-[#004489] hover:bg-[#004489]/90 text-white"
                onClick={handleAddColonne}
                disabled={!newColNom.trim()}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add ligne dialog — minimal: type select only */}
      {showAddLigne && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center" onClick={() => setShowAddLigne(false)}>
          <div className="bg-white rounded-lg shadow-lg p-4 min-w-[340px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium mb-3">Nouvelle ligne</h3>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Type de poste</label>
              <Select value={newLigneType} onValueChange={setNewLigneType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_LIGNES.map((tl) => (
                    <SelectItem key={tl.type} value={tl.type}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm border border-slate-200 inline-block shrink-0"
                          style={{ backgroundColor: tl.bg }}
                        />
                        {tl.type}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => setShowAddLigne(false)}>
                Annuler
              </Button>
              <Button
                size="sm"
                className="bg-[#004489] hover:bg-[#004489]/90 text-white"
                onClick={handleAddLigne}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cell edit dialog */}
      {cellEdit && (
        <CellEditDialog
          open={!!cellEdit}
          onOpenChange={(open) => { if (!open) setCellEdit(null) }}
          ligneId={cellEdit.ligneId}
          colId={cellEdit.colId}
          current={cellules[`${cellEdit.ligneId}|${cellEdit.colId}`]}
          personnelMap={personnelMap}
        />
      )}
    </div>
  )
}
