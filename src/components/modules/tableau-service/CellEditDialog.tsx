'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useTableauStore } from './use-tableau-store'
import { Search, User, FileText, X } from 'lucide-react'
import type { CelluleTS, PersonnelMap, PersonnelInfo } from './types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  ligneId: string
  colId: string
  current: CelluleTS | undefined
  personnelMap: PersonnelMap
}

export function CellEditDialog({ open, onOpenChange, ligneId, colId, current, personnelMap }: Props) {
  const { updateCellule, clearCellule } = useTableauStore()
  const [tab, setTab] = useState('personnel')
  const [query, setQuery] = useState('')
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelInfo | null>(null)
  const [texte, setTexte] = useState('')

  // Convert map to array once
  const allPersonnel = useMemo(() => Object.values(personnelMap), [personnelMap])

  // Filter personnel by query across prenom, nom, poste, telephone
  const filteredPersonnel = useMemo(() => {
    if (!query.trim()) return allPersonnel
    const q = query.toLowerCase().trim()
    return allPersonnel.filter((p) => {
      const fullName = `${p.prenom} ${p.nom}`.toLowerCase()
      const poste = p.poste.toLowerCase()
      const tel = (p.telephone || '').toLowerCase()
      return fullName.includes(q) || poste.includes(q) || tel.includes(q)
    })
  }, [allPersonnel, query])

  useEffect(() => {
    if (open) {
      setTexte(current?.texte || '')
      setQuery('')
      if (current?.personnelId && personnelMap[current.personnelId]) {
        setSelectedPersonnel(personnelMap[current.personnelId])
      } else if (current?.personnelId) {
        // Fallback: reconstruct from stored data
        setSelectedPersonnel({
          id: current.personnelId,
          prenom: current.personnelNom?.split(' ')[0] || '',
          nom: current.personnelNom?.split(' ').slice(1).join(' ') || '',
          poste: '',
          telephone: current.personnelTelephone || null,
          entreprise: null,
        })
      } else {
        setSelectedPersonnel(null)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleSave() {
    const personnelNom = selectedPersonnel
      ? `${selectedPersonnel.prenom} ${selectedPersonnel.nom}`
      : undefined

    const personnelTelephone = selectedPersonnel?.telephone || undefined

    if (!texte && !selectedPersonnel) {
      clearCellule(ligneId, colId)
    } else {
      updateCellule(
        ligneId,
        colId,
        texte,
        selectedPersonnel?.id,
        personnelNom,
        personnelTelephone
      )
    }
    onOpenChange(false)
  }

  function handleClear() {
    clearCellule(ligneId, colId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier la cellule</DialogTitle>
          <DialogDescription>
            Affecter un personnel ou saisir un texte libre.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personnel" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Personnel
            </TabsTrigger>
            <TabsTrigger value="texte" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Texte libre
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personnel" className="space-y-3">
            {/* Selected personnel */}
            {selectedPersonnel && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                <div>
                  <span className="text-sm font-medium text-blue-900">
                    {selectedPersonnel.prenom} {selectedPersonnel.nom}
                  </span>
                  {selectedPersonnel.telephone && (
                    <span className="text-xs text-blue-600 ml-2">
                      {'\u{1F4DE}'} {selectedPersonnel.telephone}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPersonnel(null)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom, poste ou telephone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {/* Results */}
            <div className="max-h-[240px] overflow-y-auto border border-slate-200 rounded-md divide-y divide-slate-100">
              {filteredPersonnel.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-slate-400">
                  Aucun personnel trouve
                </div>
              )}
              {filteredPersonnel.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPersonnel(p)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                    selectedPersonnel?.id === p.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {p.prenom} {p.nom}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {p.poste}
                    </span>
                  </div>
                  {p.telephone && (
                    <div className="text-xs text-[#546E7A] mt-0.5">
                      {'\u{1F4DE}'} {p.telephone}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="texte" className="space-y-3">
            <div className="space-y-2">
              <Label>Texte libre</Label>
              <textarea
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 resize-none"
                placeholder="Saisir un texte..."
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            Vider
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white"
          >
            Valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
