'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseHeure, formatDateFR } from '@/lib/utils'
import { createRapport, updateRapport } from '@/actions/rapports'
import { Save, FileText } from 'lucide-react'
import { RapportPDFButton } from './RapportPDFButton'

interface LigneDE {
  id: string
  code: string
  designation: string
  unite: string
  quantite: number
  prixUnitaire: number
  ordre: number
}

interface TravailRealise {
  ligneDeId: string
  code: string
  designation: string
  unite: string
  quantiteMarche: number
  quantiteRealisee: number
}

interface User {
  id: string
  name: string
  email: string
}

interface RapportData {
  id?: string
  date: Date
  nomChantier: string | null
  titre: string | null
  posteNuit: boolean
  heureDebutPrevue: string | null
  heureFinPrevue: string | null
  heureDebut: string | null
  heureFin: string | null
  heureRestituee: string | null
  production: string | null
  commentaire: string | null
  redacteurId: string | null
  dateRedaction: Date | null
  valide: boolean
  travaux: TravailRealise[]
  redacteur?: { id: string; name: string } | null
}

interface RapportFormProps {
  projetId: string
  projetName: string
  rapport?: RapportData | null
  lignesDE: LigneDE[]
  users: User[]
  isNew: boolean
}

function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return new Date().toISOString().split('T')[0]
  return new Date(d).toISOString().split('T')[0]
}

export function RapportForm({
  projetId,
  projetName,
  rapport,
  lignesDE,
  users,
  isNew,
}: RapportFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [nomChantier, setNomChantier] = useState(rapport?.nomChantier || projetName)
  const [titre, setTitre] = useState(rapport?.titre || '')
  const [date, setDate] = useState(toDateInputValue(rapport?.date))
  const [posteNuit, setPosteNuit] = useState(rapport?.posteNuit ?? true)
  const [heureDebut, setHeureDebut] = useState(rapport?.heureDebut || '')
  const [heureFin, setHeureFin] = useState(rapport?.heureFin || '')
  const [heureRestituee, setHeureRestituee] = useState(rapport?.heureRestituee || '')
  const [production, setProduction] = useState(rapport?.production || '')
  const [commentaire, setCommentaire] = useState(rapport?.commentaire || '')
  const [redacteurId, setRedacteurId] = useState(rapport?.redacteurId || '')
  const [dateRedaction, setDateRedaction] = useState(
    toDateInputValue(rapport?.dateRedaction || new Date())
  )
  const [valide, setValide] = useState(rapport?.valide || false)
  const [redacteurSearch, setRedacteurSearch] = useState(
    rapport?.redacteur?.name || ''
  )
  const [showRedacteurDropdown, setShowRedacteurDropdown] = useState(false)

  // Travaux state
  const existingTravaux = rapport?.travaux || []
  const [travaux, setTravaux] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    existingTravaux.forEach(t => {
      map[t.ligneDeId] = t.quantiteRealisee
    })
    return map
  })

  function handleHeureBlur(
    value: string,
    setter: (v: string) => void
  ) {
    if (!value) return
    const parsed = parseHeure(value)
    if (parsed) setter(parsed)
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(redacteurSearch.toLowerCase())
  )

  function buildFormData() {
    const travauxArray: TravailRealise[] = lignesDE
      .filter(l => (travaux[l.id] || 0) > 0)
      .map(l => ({
        ligneDeId: l.id,
        code: l.code,
        designation: l.designation,
        unite: l.unite,
        quantiteMarche: l.quantite,
        quantiteRealisee: travaux[l.id] || 0,
      }))

    return {
      date,
      nomChantier,
      titre,
      posteNuit,
      heureDebut: heureDebut || undefined,
      heureFin: heureFin || undefined,
      heureRestituee: heureRestituee || undefined,
      production: production || undefined,
      commentaire: commentaire || undefined,
      redacteurId: redacteurId || undefined,
      dateRedaction: dateRedaction || undefined,
      valide,
      travaux: travauxArray,
    }
  }

  const getCurrentFormData = useCallback(() => {
    const travauxArray: TravailRealise[] = lignesDE
      .filter(l => (travaux[l.id] || 0) > 0)
      .map(l => ({
        ligneDeId: l.id,
        code: l.code,
        designation: l.designation,
        unite: l.unite,
        quantiteMarche: l.quantite,
        quantiteRealisee: travaux[l.id] || 0,
      }))

    const redacteurName = users.find(u => u.id === redacteurId)?.name || ''

    return {
      nomChantier,
      titre,
      date,
      posteNuit,
      heureDebutPrevue: '',
      heureFinPrevue: '',
      heureDebut,
      heureFin,
      heureRestituee,
      production,
      commentaire,
      redacteurName,
      dateRedaction,
      valide,
      travaux: travauxArray,
    }
  }, [
    nomChantier, titre, date, posteNuit,
    heureDebut, heureFin, heureRestituee, production, commentaire,
    redacteurId, dateRedaction, valide, travaux, lignesDE, users,
  ])

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const formData = buildFormData()
      let result
      if (isNew) {
        result = await createRapport(projetId, formData)
      } else {
        result = await updateRapport(rapport!.id!, projetId, formData)
      }
      if (result.success) {
        router.push(`/projets/${projetId}/suivi/rapports`)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#263238]">
          {isNew ? 'Nouveau rapport journalier' : 'Modifier le rapport'}
        </h1>
        <div className="flex items-center gap-2">
          <RapportPDFButton
            projetName={projetName}
            getData={getCurrentFormData}
          />
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

      {/* SECTION: Contexte Administratif */}
      <div className="bg-white border border-[#ECEFF1] rounded-lg p-5">
        <h2 className="text-base font-bold text-[#263238] mb-4 pb-2 border-b border-[#ECEFF1]">
          Contexte Administratif
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nomChantier" className="text-sm font-medium">
              Nom du chantier
            </Label>
            <Input
              id="nomChantier"
              value={nomChantier}
              onChange={e => setNomChantier(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="titre" className="text-sm font-medium">
              Titre
            </Label>
            <Input
              id="titre"
              value={titre}
              onChange={e => setTitre(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* SECTION: Observations */}
      <div className="bg-white border border-[#ECEFF1] rounded-lg p-5">
        <h2 className="text-base font-bold text-[#263238] mb-4 pb-2 border-b border-[#ECEFF1]">
          Observations
        </h2>

        {/* Type de poste */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Type de poste</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPosteNuit(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                posteNuit
                  ? 'bg-[#1565C0] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {'\uD83C\uDF19'} Nuit
            </button>
            <button
              type="button"
              onClick={() => setPosteNuit(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !posteNuit
                  ? 'bg-[#1565C0] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {'\u2600\uFE0F'} Jour
            </button>
          </div>
        </div>

        {/* Heures */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-sm font-medium">Debut reelle</Label>
            <Input
              value={heureDebut}
              onChange={e => setHeureDebut(e.target.value)}
              onBlur={e => handleHeureBlur(e.target.value, setHeureDebut)}
              placeholder="HH:mm"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Fin reelle</Label>
            <Input
              value={heureFin}
              onChange={e => setHeureFin(e.target.value)}
              onBlur={e => handleHeureBlur(e.target.value, setHeureFin)}
              placeholder="HH:mm"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Heure restituee</Label>
            <Input
              value={heureRestituee}
              onChange={e => setHeureRestituee(e.target.value)}
              onBlur={e => handleHeureBlur(e.target.value, setHeureRestituee)}
              placeholder="HH:mm"
              className="mt-1"
            />
          </div>
        </div>

        {/* Production + Commentaire */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <Label className="text-sm font-medium">Production</Label>
            <textarea
              value={production}
              onChange={e => setProduction(e.target.value)}
              rows={4}
              className="mt-1 flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Commentaire</Label>
            <Input
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Redacteur + Date Redaction + Valide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Label className="text-sm font-medium">Redacteur</Label>
            <Input
              value={redacteurSearch}
              onChange={e => {
                setRedacteurSearch(e.target.value)
                setShowRedacteurDropdown(true)
              }}
              onFocus={() => setShowRedacteurDropdown(true)}
              placeholder="Rechercher un redacteur..."
              className="mt-1"
            />
            {showRedacteurDropdown && filteredUsers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
                {filteredUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#BBDEFB] hover:text-[#0D47A1]"
                    onClick={() => {
                      setRedacteurId(u.id)
                      setRedacteurSearch(u.name)
                      setShowRedacteurDropdown(false)
                    }}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium">Date de redaction</Label>
            <Input
              type="date"
              value={dateRedaction}
              onChange={e => setDateRedaction(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={valide}
                onChange={e => setValide(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Valide</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION: Travaux Realises */}
      {lignesDE.length > 0 && (
        <div className="bg-white border border-[#ECEFF1] rounded-lg p-5">
          <h2 className="text-base font-bold text-[#263238] mb-4 pb-2 border-b border-[#ECEFF1]">
            Travaux Realises
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#263238] text-white font-bold">
                  <th className="text-left px-3 py-2 border-r border-[#ECEFF1]/20">N° prix</th>
                  <th className="text-left px-3 py-2 border-r border-[#ECEFF1]/20">Intitule</th>
                  <th className="text-center px-3 py-2 border-r border-[#ECEFF1]/20">Unite</th>
                  <th className="text-right px-3 py-2 border-r border-[#ECEFF1]/20">Qte marche</th>
                  <th className="text-center px-3 py-2">Qte realisee ce jour</th>
                </tr>
              </thead>
              <tbody>
                {lignesDE.map((l, i) => (
                  <tr
                    key={l.id}
                    className={`border-t border-[#ECEFF1] ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F5F7FA]'
                    }`}
                  >
                    <td className="px-3 py-2 border-r border-[#ECEFF1] font-mono">
                      {l.code}
                    </td>
                    <td className="px-3 py-2 border-r border-[#ECEFF1]">
                      {l.designation}
                    </td>
                    <td className="px-3 py-2 border-r border-[#ECEFF1] text-center">
                      {l.unite}
                    </td>
                    <td className="px-3 py-2 border-r border-[#ECEFF1] text-right">
                      {l.quantite}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={travaux[l.id] || ''}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0
                          setTravaux(prev => ({ ...prev, [l.id]: val }))
                        }}
                        className="w-24 mx-auto text-center h-8"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
