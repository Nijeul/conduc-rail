'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MaterielTTx } from '@prisma/client'
import { TYPES_MATERIEL, COULEURS_TYPE_MATERIEL } from './constants'

interface MaterielSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  materiel?: MaterielTTx | null
  onSave: (data: {
    type: string
    designation: string
    imageUrl: string | null
    nbEssieux: number | null
    poidsEntrant: number | null
    poidsSortant: number | null
    longueur: number | null
    capTraction: number | null
    capEssieuxFreines: number | null
    commentaires: string | null
    estSysteme: boolean
  }) => Promise<void>
}

export function MaterielSheet({
  open,
  onOpenChange,
  materiel,
  onSave,
}: MaterielSheetProps) {
  const [type, setType] = useState('')
  const [designation, setDesignation] = useState('')
  const [nbEssieux, setNbEssieux] = useState('')
  const [poidsEntrant, setPoidsEntrant] = useState('')
  const [poidsSortant, setPoidsSortant] = useState('')
  const [longueur, setLongueur] = useState('')
  const [capTraction, setCapTraction] = useState('')
  const [capEssieuxFreines, setCapEssieuxFreines] = useState('')
  const [commentaires, setCommentaires] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!materiel
  const isSysteme = materiel?.estSysteme ?? false

  useEffect(() => {
    if (open) {
      if (materiel) {
        setType(materiel.type)
        setDesignation(materiel.designation)
        setNbEssieux(materiel.nbEssieux?.toString() ?? '')
        setPoidsEntrant(materiel.poidsEntrant?.toString() ?? '')
        setPoidsSortant(materiel.poidsSortant?.toString() ?? '')
        setLongueur(materiel.longueur?.toString() ?? '')
        setCapTraction(materiel.capTraction?.toString() ?? '')
        setCapEssieuxFreines(materiel.capEssieuxFreines?.toString() ?? '')
        setCommentaires(materiel.commentaires ?? '')
      } else {
        setType('Wagon')
        setDesignation('')
        setNbEssieux('')
        setPoidsEntrant('')
        setPoidsSortant('')
        setLongueur('')
        setCapTraction('')
        setCapEssieuxFreines('')
        setCommentaires('')
      }
      setError('')
    }
  }, [open, materiel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !designation.trim()) {
      setError('Type et designation sont obligatoires')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave({
        type,
        designation: designation.trim(),
        imageUrl: null,
        nbEssieux: nbEssieux ? parseFloat(nbEssieux) : null,
        poidsEntrant: poidsEntrant ? parseFloat(poidsEntrant) : null,
        poidsSortant: poidsSortant ? parseFloat(poidsSortant) : null,
        longueur: longueur ? parseFloat(longueur) : null,
        capTraction: capTraction ? parseFloat(capTraction) : null,
        capEssieuxFreines: capEssieuxFreines ? parseFloat(capEssieuxFreines) : null,
        commentaires: commentaires.trim() || null,
        estSysteme: isSysteme,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2'
  const disabledInputClass =
    'flex h-10 w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? 'Modifier le materiel' : 'Ajouter un materiel'}
            {isSysteme && (
              <span
                className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: '#1565C0' }}
              >
                Systeme
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Type <span className="text-red-500">*</span>
            </label>
            <Select value={type} onValueChange={setType} disabled={isSysteme}>
              <SelectTrigger>
                <SelectValue placeholder="Selectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES_MATERIEL.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{ backgroundColor: COULEURS_TYPE_MATERIEL[t] }}
                      />
                      {t}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className={isSysteme ? disabledInputClass : inputClass}
              placeholder="Ex: CC 56000"
              readOnly={isSysteme}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Essieux</label>
              <input
                type="number"
                step="any"
                value={nbEssieux}
                onChange={(e) => setNbEssieux(e.target.value)}
                className={isSysteme ? disabledInputClass : inputClass}
                placeholder="0"
                readOnly={isSysteme}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Cap. essieux freines
              </label>
              <input
                type="number"
                step="any"
                value={capEssieuxFreines}
                onChange={(e) => setCapEssieuxFreines(e.target.value)}
                className={isSysteme ? disabledInputClass : inputClass}
                placeholder="0"
                readOnly={isSysteme}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Poids Entrant (T)
              </label>
              <input
                type="number"
                step="any"
                value={poidsEntrant}
                onChange={(e) => setPoidsEntrant(e.target.value)}
                className={isSysteme ? disabledInputClass : inputClass}
                placeholder="0"
                readOnly={isSysteme}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Poids Sortant (T)
              </label>
              <input
                type="number"
                step="any"
                value={poidsSortant}
                onChange={(e) => setPoidsSortant(e.target.value)}
                className={isSysteme ? disabledInputClass : inputClass}
                placeholder="0"
                readOnly={isSysteme}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Longueur (m)</label>
              <input
                type="number"
                step="any"
                value={longueur}
                onChange={(e) => setLongueur(e.target.value)}
                className={isSysteme ? disabledInputClass : inputClass}
                placeholder="0"
                readOnly={isSysteme}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Cap. traction (T)
              </label>
              <input
                type="number"
                step="any"
                value={capTraction}
                onChange={(e) => setCapTraction(e.target.value)}
                className={isSysteme ? disabledInputClass : inputClass}
                placeholder="0"
                readOnly={isSysteme}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Commentaires</label>
            <textarea
              value={commentaires}
              onChange={(e) => setCommentaires(e.target.value)}
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 min-h-[80px]"
              placeholder="Commentaires..."
            />
          </div>

          <SheetFooter className="pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1565C0' }}
            >
              {saving ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter'}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
