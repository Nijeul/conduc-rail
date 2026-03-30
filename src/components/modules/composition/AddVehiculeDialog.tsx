'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMaterielTTx } from '@/hooks/useMaterielTTx'
import { TYPES_MATERIEL } from '../materiel/constants'

interface AddVehiculeResult {
  materielId: string
  type: string
  designation: string
  nombre: number
  nbEssieux: number
  capEssieuxFreines: number
  poidsEntrant: number
  poidsSortant: number
  longueur: number
  capTraction: number
  commentaires: string
}

interface AddVehiculeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: AddVehiculeResult) => void
}

export function AddVehiculeDialog({
  open,
  onOpenChange,
  onAdd,
}: AddVehiculeDialogProps) {
  const { materiels, isLoading } = useMaterielTTx()
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedMaterielId, setSelectedMaterielId] = useState<string>('')
  const [nombre, setNombre] = useState(1)

  const filteredMateriels = useMemo(() => {
    if (!selectedType) return []
    return materiels.filter((m) => m.type === selectedType)
  }, [materiels, selectedType])

  const selectedMateriel = useMemo(() => {
    if (!selectedMaterielId) return null
    return materiels.find((m) => m.id === selectedMaterielId) ?? null
  }, [materiels, selectedMaterielId])

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setSelectedMaterielId('')
  }

  const handleSubmit = () => {
    if (!selectedMateriel) return
    onAdd({
      materielId: selectedMateriel.id,
      type: selectedMateriel.type,
      designation: selectedMateriel.designation,
      nombre,
      nbEssieux: selectedMateriel.nbEssieux ?? 0,
      capEssieuxFreines: selectedMateriel.capEssieuxFreines ?? 0,
      poidsEntrant: selectedMateriel.poidsEntrant ?? 0,
      poidsSortant: selectedMateriel.poidsSortant ?? 0,
      longueur: selectedMateriel.longueur ?? 0,
      capTraction: selectedMateriel.capTraction ?? 0,
      commentaires: selectedMateriel.commentaires ?? '',
    })
    // Reset state
    setSelectedType('')
    setSelectedMaterielId('')
    setNombre(1)
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedType('')
      setSelectedMaterielId('')
      setNombre(1)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Ajouter un vehicule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isLoading ? (
            <p className="text-sm text-slate-400">Chargement du catalogue...</p>
          ) : (
            <>
              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_MATERIEL.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: t.couleur }} />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedMaterielId}
                  onValueChange={setSelectedMaterielId}
                  disabled={!selectedType}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedType
                          ? 'Choisir un type d\'abord'
                          : filteredMateriels.length === 0
                          ? 'Aucun materiel pour ce type'
                          : 'Selectionner un materiel'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMateriels.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.designation} — {m.nbEssieux ?? 0} essieux — {m.longueur ?? 0}m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <input
                  type="number"
                  min={1}
                  value={nombre}
                  onChange={(e) => setNombre(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                />
              </div>

              {/* Apercu */}
              {selectedMateriel && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-medium text-slate-700">Apercu :</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span>Essieux : {selectedMateriel.nbEssieux ?? '-'}</span>
                    <span>Cap. ess. freines : {selectedMateriel.capEssieuxFreines ?? '-'}</span>
                    <span>Poids entrant : {selectedMateriel.poidsEntrant ?? '-'} T</span>
                    <span>Poids sortant : {selectedMateriel.poidsSortant ?? '-'} T</span>
                    <span>Longueur : {selectedMateriel.longueur ?? '-'} m</span>
                    <span>Cap. traction : {selectedMateriel.capTraction ?? '-'} T</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedMateriel}
            className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#1565C0' }}
          >
            Ajouter
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
