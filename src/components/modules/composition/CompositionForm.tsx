'use client'

import { useState, useTransition, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatNombreFR } from '@/lib/utils'
import { createComposition, updateComposition } from '@/actions/composition'
import type { Vehicule } from '@/actions/composition'
import { Save, Plus, Trash2 } from 'lucide-react'
import { RameVisual } from './RameVisual'
import { CompositionPDFButton } from './CompositionPDFButton'
import { AddVehiculeDialog } from './AddVehiculeDialog'
import { TYPES_MATERIEL } from '../materiel/constants'

interface CompositionData {
  id?: string
  titre: string | null
  date: Date | null
  sens: string
  vehicules: Vehicule[]
}

interface CompositionFormProps {
  projetId: string
  projetName: string
  composition?: CompositionData | null
  isNew: boolean
}

const VEHICLE_TYPES = TYPES_MATERIEL

const PROPERTIES = [
  { key: 'type', label: 'Type', inputType: 'select' },
  { key: 'designation', label: 'Designation', inputType: 'text' },
  { key: 'nombre', label: 'Nombre', inputType: 'number' },
  { key: 'capEssieuxFreines', label: 'Cap. essieux freines', inputType: 'number' },
  { key: 'nbEssieux', label: 'Nb Essieux', inputType: 'number' },
  { key: 'poidsEntrant', label: 'Poids Entrant (T)', inputType: 'number' },
  { key: 'poidsSortant', label: 'Poids Sortant (T)', inputType: 'number' },
  { key: 'longueur', label: 'Longueur (m)', inputType: 'number' },
  { key: 'capTraction', label: 'Capacite traction (T)', inputType: 'number' },
  { key: 'commentaires', label: 'Commentaires', inputType: 'text' },
] as const

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function createEmptyVehicule(): Vehicule {
  return {
    id: generateId(),
    materielId: '',
    type: 'Wagon',
    designation: '',
    nombre: 1,
    capEssieuxFreines: 0,
    nbEssieux: 0,
    poidsEntrant: 0,
    poidsSortant: 0,
    longueur: 0,
    capTraction: 0,
    commentaires: '',
  }
}

export function CompositionForm({
  projetId,
  projetName,
  composition,
  isNew,
}: CompositionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [titre, setTitre] = useState(composition?.titre || '')
  const [date, setDate] = useState(
    composition?.date
      ? new Date(composition.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [sens, setSens] = useState(composition?.sens || 'Paris → Province')
  const [vehicules, setVehicules] = useState<Vehicule[]>(
    composition?.vehicules && Array.isArray(composition.vehicules) && composition.vehicules.length > 0
      ? composition.vehicules
      : [createEmptyVehicule()]
  )
  const [selectedVehiculeIdx, setSelectedVehiculeIdx] = useState<number | null>(null)

  // Summary calculations
  const summary = useMemo(() => {
    const capEssieux = vehicules.reduce((s, v) => s + v.capEssieuxFreines * v.nombre, 0)
    const nbEssieux = vehicules.reduce((s, v) => s + v.nbEssieux * v.nombre, 0)
    const capTraction = vehicules.reduce((s, v) => s + v.capTraction, 0)
    const poidsEntrant = vehicules.reduce((s, v) => s + v.poidsEntrant * v.nombre, 0)
    const poidsSortant = vehicules.reduce((s, v) => s + v.poidsSortant * v.nombre, 0)
    const longueur = vehicules.reduce((s, v) => s + v.longueur * v.nombre, 0)

    const freinageOk = capEssieux >= nbEssieux
    const tractionOk = capTraction >= poidsSortant

    return { capEssieux, nbEssieux, capTraction, poidsEntrant, poidsSortant, longueur, freinageOk, tractionOk }
  }, [vehicules])

  function updateVehicule(index: number, key: string, value: string | number) {
    setVehicules(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  function handleAddFromCatalog(data: {
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
  }) {
    const newVehicule: Vehicule = {
      id: generateId(),
      materielId: data.materielId,
      type: data.type as Vehicule['type'],
      designation: data.designation,
      nombre: data.nombre,
      nbEssieux: data.nbEssieux,
      capEssieuxFreines: data.capEssieuxFreines,
      poidsEntrant: data.poidsEntrant,
      poidsSortant: data.poidsSortant,
      longueur: data.longueur,
      capTraction: data.capTraction,
      commentaires: data.commentaires,
    }
    setVehicules(prev => {
      // If the only vehicule is the default empty one, replace it
      if (prev.length === 1 && !prev[0].designation && !prev[0].materielId) {
        return [newVehicule]
      }
      return [...prev, newVehicule]
    })
  }

  function removeVehicule() {
    if (selectedVehiculeIdx === null || vehicules.length <= 1) return
    setVehicules(prev => prev.filter((_, i) => i !== selectedVehiculeIdx))
    setSelectedVehiculeIdx(null)
  }

  const getCurrentData = useCallback(() => {
    return { titre, date, sens, vehicules, summary }
  }, [titre, date, sens, vehicules, summary])

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const formData = { titre, date, sens, vehicules }
      let result
      if (isNew) {
        result = await createComposition(projetId, formData)
      } else {
        result = await updateComposition(composition!.id!, projetId, formData)
      }
      if (result.success) {
        router.push(`/projets/${projetId}/composition`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#263238]">
          {isNew ? 'Nouvelle composition TTx' : 'Modifier la composition'}
        </h1>
        <div className="flex items-center gap-2">
          <CompositionPDFButton projetName={projetName} getData={getCurrentData} />
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* En-tete form */}
      <div className="bg-white border border-[#ECEFF1] rounded-lg p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Titre</Label>
            <Input
              value={titre}
              onChange={e => setTitre(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Sens</Label>
            <Select value={sens} onValueChange={setSens}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paris → Province">Paris → Province</SelectItem>
                <SelectItem value="Province → Paris">Province → Paris</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Rame visuelle */}
      <div className="bg-white border border-[#ECEFF1] rounded-lg p-5">
        <h2 className="text-sm font-bold text-[#263238] mb-3">Visuel de la rame</h2>
        <RameVisual vehicules={vehicules} selectedIdx={selectedVehiculeIdx} onSelect={setSelectedVehiculeIdx} />
      </div>

      {/* Main content: Summary sidebar + Transposed table */}
      <div className="flex gap-6">
        {/* Summary sidebar */}
        <div className="w-64 shrink-0 bg-[#F5F7FA] border border-[#ECEFF1] rounded-lg p-4 space-y-3 self-start">
          <h3 className="text-sm font-bold text-[#263238] border-b border-[#ECEFF1] pb-2">Resume</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#546E7A]">Cap. essieux freines :</span>
              <span className="font-medium">{formatNombreFR(summary.capEssieux, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#546E7A]">Nb essieux rame :</span>
              <span className="font-medium">{formatNombreFR(summary.nbEssieux, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#546E7A]">Cap. traction (T) :</span>
              <span className="font-medium">{formatNombreFR(summary.capTraction, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#546E7A]">Poids Entrant (T) :</span>
              <span className="font-medium">{formatNombreFR(summary.poidsEntrant, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#546E7A]">Poids Sortant (T) :</span>
              <span className="font-medium">{formatNombreFR(summary.poidsSortant, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#546E7A]">Longueur rame (m) :</span>
              <span className="font-medium">{formatNombreFR(summary.longueur, 0)}</span>
            </div>
            <div className="border-t border-[#ECEFF1] pt-2 mt-2 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#546E7A]">Freinage :</span>
                {summary.freinageOk ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">assure</span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">insuffisant</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#546E7A]">Traction :</span>
                {summary.tractionOk ? (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">suffisante</span>
                ) : (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">insuffisante</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transposed table */}
        <div className="flex-1 bg-white border border-[#ECEFF1] rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 p-3 bg-[#37474F]">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              + Vehicule
            </Button>
            <Button
              onClick={removeVehicule}
              disabled={selectedVehiculeIdx === null || vehicules.length <= 1}
              className="bg-[#B71C1C] hover:bg-[#B71C1C]/90 text-white"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer vehicule
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#263238]">
                  <th className="text-left px-3 py-2.5 text-white font-bold border-r border-[#ECEFF1]/20 min-w-[160px]">
                    Propriete
                  </th>
                  {vehicules.map((v, i) => (
                    <th
                      key={v.id}
                      className={`text-center px-2 py-2.5 font-bold border-r border-[#ECEFF1]/20 min-w-[130px] cursor-pointer ${
                        selectedVehiculeIdx === i
                          ? 'bg-[#BBDEFB] text-[#0D47A1]'
                          : 'text-white'
                      }`}
                      onClick={() =>
                        setSelectedVehiculeIdx(prev => (prev === i ? null : i))
                      }
                    >
                      V{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROPERTIES.map((prop, rowIdx) => (
                  <tr
                    key={prop.key}
                    className={`border-t border-[#ECEFF1] ${
                      rowIdx % 2 !== 0 ? 'bg-[#F5F7FA]' : 'bg-white'
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-[#37474F] bg-gray-50 border-r border-[#ECEFF1]">
                      {prop.label}
                    </td>
                    {vehicules.map((v, colIdx) => (
                      <td
                        key={v.id}
                        className={`px-1.5 py-1 border-r border-[#ECEFF1] ${
                          selectedVehiculeIdx === colIdx ? 'bg-[#BBDEFB]/30' : ''
                        }`}
                      >
                        {prop.inputType === 'select' ? (
                          <Select
                            value={v.type}
                            onValueChange={val => updateVehicule(colIdx, 'type', val)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VEHICLE_TYPES.map(t => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : prop.inputType === 'number' ? (
                          <Input
                            type="number"
                            min={prop.key === 'nombre' ? 1 : 0}
                            step="any"
                            value={v[prop.key as keyof Vehicule] as number}
                            onChange={e =>
                              updateVehicule(
                                colIdx,
                                prop.key,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-8 text-xs text-center"
                          />
                        ) : (
                          <Input
                            type="text"
                            value={v[prop.key as keyof Vehicule] as string}
                            onChange={e =>
                              updateVehicule(colIdx, prop.key, e.target.value)
                            }
                            className="h-8 text-xs"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Vehicule Dialog */}
      <AddVehiculeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddFromCatalog}
      />
    </div>
  )
}
