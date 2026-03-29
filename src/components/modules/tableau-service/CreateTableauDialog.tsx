'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createTableau } from '@/actions/tableau-service'

interface Props {
  projetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (id: string) => void
}

function getCurrentWeek(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 604800000
  return Math.ceil((diff / oneWeek + start.getDay() / 7))
}

export function CreateTableauDialog({ projetId, open, onOpenChange, onCreated }: Props) {
  const [titre, setTitre] = useState('')
  const [entreprise, setEntreprise] = useState('')
  const [semaine, setSemaine] = useState(getCurrentWeek())
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createTableau(projetId, {
      titre,
      entreprise: entreprise || undefined,
      semaine,
      annee,
    })

    setLoading(false)

    if (result.success) {
      setTitre('')
      setEntreprise('')
      onOpenChange(false)
      onCreated(result.data.id)
    } else {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau tableau de service</DialogTitle>
          <DialogDescription>
            Creer un nouveau tableau pour le suivi des affectations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titre">Titre *</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Tableau Semaine 14"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entreprise">Entreprise</Label>
            <Input
              id="entreprise"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              placeholder="Ex: SNCF Reseau"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semaine">Semaine</Label>
              <Input
                id="semaine"
                type="number"
                min={1}
                max={53}
                value={semaine}
                onChange={(e) => setSemaine(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annee">Annee</Label>
              <Input
                id="annee"
                type="number"
                min={2020}
                max={2100}
                value={annee}
                onChange={(e) => setAnnee(parseInt(e.target.value) || 2024)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !titre}
              className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white"
            >
              {loading ? 'Creation...' : 'Creer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
