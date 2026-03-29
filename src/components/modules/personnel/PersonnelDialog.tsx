'use client'

import { useState, useEffect } from 'react'
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
import type { Personnel } from '@prisma/client'

const POSTES = [
  'Conducteur travaux principal',
  'Conducteur travaux',
  'Responsable qualite',
  'RCE / Chef de chantier',
  'Controleur qualite',
  "Chef d'equipe",
  'Poseur',
  'Soudeur',
  'Aide Soudeur',
  "Conducteur d'engin",
  'Chef de machine BML',
  'Operateur BML',
  'Manuscopiste',
  'Autre',
]

interface PersonnelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personnel?: Personnel | null
  onSave: (data: {
    prenom: string
    nom: string
    poste: string
    telephone: string | null
    entreprise: string | null
  }) => Promise<void>
}

export function PersonnelDialog({
  open,
  onOpenChange,
  personnel,
  onSave,
}: PersonnelDialogProps) {
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [poste, setPoste] = useState('')
  const [telephone, setTelephone] = useState('')
  const [entreprise, setEntreprise] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!personnel

  useEffect(() => {
    if (open) {
      if (personnel) {
        setPrenom(personnel.prenom)
        setNom(personnel.nom)
        setPoste(personnel.poste)
        setTelephone(personnel.telephone || '')
        setEntreprise(personnel.entreprise || '')
      } else {
        setPrenom('')
        setNom('')
        setPoste('')
        setTelephone('')
        setEntreprise('')
      }
      setError('')
    }
  }, [open, personnel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prenom.trim() || !nom.trim() || !poste) {
      setError('Prenom, nom et poste sont obligatoires')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onSave({
        prenom: prenom.trim(),
        nom: nom.trim(),
        poste,
        telephone: telephone.trim() || null,
        entreprise: entreprise.trim() || null,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier le personnel' : 'Ajouter du personnel'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Prenom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                placeholder="Prenom"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Poste <span className="text-red-500">*</span>
            </label>
            <Select value={poste} onValueChange={setPoste}>
              <SelectTrigger>
                <SelectValue placeholder="Selectionner un poste" />
              </SelectTrigger>
              <SelectContent>
                {POSTES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Telephone
            </label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Entreprise
            </label>
            <input
              type="text"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
              placeholder="Nom de l'entreprise"
            />
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
