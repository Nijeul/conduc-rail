'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CategorieRow, CouleursCatMap } from './categories'
import {
  createEvenement,
  updateEvenement,
  addFichierEvenement,
  deleteFichierEvenement,
  createCategorie,
} from '@/actions/journal'
import { Upload, X, FileText, Image, Plus } from 'lucide-react'

const PALETTE_RAPIDE = [
  { bg: '#E8EFDA', border: '#7AA536', text: '#5E8019', point: '#7AA536' },
  { bg: '#E5F1F9', border: '#307BFF', text: '#0041B7', point: '#307BFF' },
  { bg: '#F9E9D9', border: '#C26A32', text: '#B24E25', point: '#C26A32' },
  { bg: '#FCE8FF', border: '#A152E5', text: '#7D18D6', point: '#A152E5' },
  { bg: '#FFF7D1', border: '#F2AB1B', text: '#DD9412', point: '#F2AB1B' },
  { bg: '#FFE8E8', border: '#F25799', text: '#C4007D', point: '#F25799' },
  { bg: '#B2D4FC', border: '#80B4FF', text: '#0041B7', point: '#307BFF' },
  { bg: '#C9E39E', border: '#7AA536', text: '#5E8019', point: '#A9D461' },
  { bg: '#F0F0F0', border: '#B5ABA1', text: '#5A5A5A', point: '#B5ABA1' },
]

interface FichierRow {
  id: string
  nom: string
  type: string
  taille: number
  isNew?: boolean
  contenu?: string
}

interface EvenementData {
  id?: string
  date: string
  titre: string
  description: string
  categorie: string
  categorieId?: string | null
  fichiers?: FichierRow[]
}

interface DialogEvenementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projetId: string
  evenement?: EvenementData | null
  categories?: CategorieRow[]
  couleursCat?: CouleursCatMap
}

export function DialogEvenement({
  open,
  onOpenChange,
  projetId,
  evenement,
  categories = [],
  couleursCat = {},
}: DialogEvenementProps) {
  const isEdit = !!evenement?.id
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(evenement?.date || new Date().toISOString().slice(0, 10))
  const [titre, setTitre] = useState(evenement?.titre || '')
  const [description, setDescription] = useState(evenement?.description || '')
  const [categorieId, setCategorieId] = useState(evenement?.categorieId || '')
  const [fichiers, setFichiers] = useState<FichierRow[]>(evenement?.fichiers || [])
  const [pendingFiles, setPendingFiles] = useState<FichierRow[]>([])

  // Creation mode
  const [modeCreation, setModeCreation] = useState(false)
  const [newCatNom, setNewCatNom] = useState('')
  const [newCatPaletteIdx, setNewCatPaletteIdx] = useState(0)
  const [newCatCustomBg, setNewCatCustomBg] = useState('')
  const [newCatCustomBorder, setNewCatCustomBorder] = useState('')

  const resetForm = useCallback(() => {
    setDate(evenement?.date || new Date().toISOString().slice(0, 10))
    setTitre(evenement?.titre || '')
    setDescription(evenement?.description || '')
    setCategorieId(evenement?.categorieId || '')
    setFichiers(evenement?.fichiers || [])
    setPendingFiles([])
    setError('')
    setModeCreation(false)
    setNewCatNom('')
    setNewCatPaletteIdx(0)
    setNewCatCustomBg('')
    setNewCatCustomBorder('')
  }, [evenement])

  // Resolve initial categorieId for existing events that only have legacy categorie string
  const getInitialCategorieId = useCallback(() => {
    if (categorieId) return categorieId
    // Try to find a matching category by legacy name mapping
    if (evenement?.categorie && categories.length > 0) {
      const legacyToNom: Record<string, string> = {
        contrat: 'Contrat', groupement: 'Groupement', alerte: 'Alerte',
        ebgc: 'EBGC', sos_terrain: 'SOS Terrain', etude_diffusion: 'Étude diffusion',
        visa_etude: 'VISA Étude', suivi_impact: 'Suivi/Impact', courrier: 'Courrier', autre: 'Autre',
      }
      const nom = legacyToNom[evenement.categorie]
      if (nom) {
        const found = categories.find(c => c.nom === nom)
        if (found) return found.id
      }
    }
    // Default to first category
    return categories.length > 0 ? categories[0].id : ''
  }, [categorieId, evenement, categories])

  const effectiveCategorieId = categorieId || getInitialCategorieId()

  // Get the selected category colors for preview
  const selectedCatColors = effectiveCategorieId && couleursCat[effectiveCategorieId]
    ? couleursCat[effectiveCategorieId]
    : null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const totalCount = fichiers.length + pendingFiles.length
    const remaining = 10 - totalCount

    Array.from(files).slice(0, remaining).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setError(`Le fichier "${file.name}" depasse 2MB`)
        return
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setError(`Le fichier "${file.name}" n'est pas un format accepte (PNG, JPG, PDF)`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setPendingFiles((prev) => [
          ...prev,
          {
            id: `new-${Date.now()}-${Math.random()}`,
            nom: file.name,
            type: file.type,
            taille: file.size,
            isNew: true,
            contenu: base64,
          },
        ])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePendingFile(id: string) {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function removeExistingFile(id: string) {
    startTransition(async () => {
      const result = await deleteFichierEvenement(projetId, id)
      if (result.success) {
        setFichiers((prev) => prev.filter((f) => f.id !== id))
      } else {
        setError(result.error)
      }
    })
  }

  async function handleCreateCategorie() {
    if (!newCatNom.trim()) {
      setError('Le nom de la categorie est requis')
      return
    }
    const palette = PALETTE_RAPIDE[newCatPaletteIdx]
    const couleurs = {
      couleurBg: newCatCustomBg || palette.bg,
      couleurBorder: newCatCustomBorder || palette.border,
      couleurText: palette.text,
      couleurPoint: newCatCustomBorder || palette.point,
    }

    const result = await createCategorie(projetId, {
      nom: newCatNom.trim(),
      ...couleurs,
    })

    if (result.success) {
      setCategorieId(result.data.id)
      setModeCreation(false)
      setNewCatNom('')
      setNewCatCustomBg('')
      setNewCatCustomBorder('')
    } else {
      setError(result.error)
    }
  }

  function handleSubmit() {
    if (!titre.trim()) {
      setError('Le titre est requis')
      return
    }
    if (!date) {
      setError('La date est requise')
      return
    }

    const finalCatId = effectiveCategorieId
    // Resolve categorie string from category name
    const catEntry = finalCatId && couleursCat[finalCatId]
    const categorieString = catEntry ? catEntry.label.toLowerCase().replace(/[éè]/g, 'e').replace(/\//g, '_').replace(/\s+/g, '_') : 'autre'

    setError('')
    startTransition(async () => {
      const payload = {
        ...(isEdit ? { id: evenement!.id } : {}),
        date,
        titre: titre.trim(),
        description: description.trim(),
        categorie: categorieString,
        categorieId: finalCatId || undefined,
      }

      const result = isEdit
        ? await updateEvenement(projetId, payload)
        : await createEvenement(projetId, payload)

      if (!result.success) {
        setError(result.error)
        return
      }

      // Upload pending files
      const evenementId = isEdit ? evenement!.id! : (result as { success: true; data: { id: string } }).data.id
      for (const pf of pendingFiles) {
        await addFichierEvenement(projetId, evenementId, {
          nom: pf.nom,
          type: pf.type,
          contenu: pf.contenu,
          taille: pf.taille,
        })
      }

      onOpenChange(false)
    })
  }

  const standardCats = categories.filter(c => c.estSysteme)
  const customCats = categories.filter(c => !c.estSysteme)

  // Preview colors for creation mode
  const previewPalette = PALETTE_RAPIDE[newCatPaletteIdx]
  const previewBg = newCatCustomBg || previewPalette.bg
  const previewBorder = newCatCustomBorder || previewPalette.border
  const previewText = previewPalette.text

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm()
        onOpenChange(val)
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier l\'evenement' : 'Ajouter un evenement'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
              {error}
            </div>
          )}

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Titre */}
          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Titre de l'evenement"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'evenement"
            />
          </div>

          {/* Categorie */}
          <div className="space-y-1.5">
            <Label>Categorie</Label>

            {!modeCreation ? (
              <>
                <Select value={effectiveCategorieId} onValueChange={setCategorieId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {standardCats.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs text-gray-400 uppercase tracking-wider">Standard</SelectLabel>
                        {standardCats.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.couleurPoint }}
                              />
                              {cat.nom}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {customCats.length > 0 && (
                      <SelectGroup>
                        <SelectLabel className="text-xs text-gray-400 uppercase tracking-wider">Mes categories</SelectLabel>
                        {customCats.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.couleurPoint }}
                              />
                              {cat.nom}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1.5"
                  onClick={() => setModeCreation(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Creer une categorie
                </Button>
              </>
            ) : (
              <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom de la categorie</Label>
                  <Input
                    value={newCatNom}
                    onChange={(e) => setNewCatNom(e.target.value)}
                    placeholder="Ex: Reunion MOA"
                    className="text-sm"
                  />
                </div>

                {/* Palette rapide */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Couleur</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PALETTE_RAPIDE.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-7 h-7 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: p.bg,
                          borderColor: newCatPaletteIdx === i ? p.border : 'transparent',
                          boxShadow: newCatPaletteIdx === i ? `0 0 0 2px ${p.border}` : 'none',
                        }}
                        onClick={() => {
                          setNewCatPaletteIdx(i)
                          setNewCatCustomBg('')
                          setNewCatCustomBorder('')
                        }}
                      >
                        <span
                          className="block w-3 h-3 rounded-full mx-auto"
                          style={{ backgroundColor: p.point }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom color pickers */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs whitespace-nowrap">Fond :</Label>
                    <input
                      type="color"
                      value={newCatCustomBg || PALETTE_RAPIDE[newCatPaletteIdx].bg}
                      onChange={(e) => setNewCatCustomBg(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs whitespace-nowrap">Bordure :</Label>
                    <input
                      type="color"
                      value={newCatCustomBorder || PALETTE_RAPIDE[newCatPaletteIdx].border}
                      onChange={(e) => setNewCatCustomBorder(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-1">
                  <Label className="text-xs">Apercu</Label>
                  <div
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: previewBg,
                      borderColor: previewBorder,
                      color: previewText,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: previewBorder }}
                    />
                    {newCatNom || 'Nouvelle categorie'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setModeCreation(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => startTransition(() => handleCreateCategorie())}
                    disabled={isPending || !newCatNom.trim()}
                    style={{ backgroundColor: '#004489' }}
                    className="text-white hover:opacity-90"
                  >
                    {isPending ? 'Creation...' : 'Creer'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Fichiers */}
          <div className="space-y-1.5">
            <Label>Fichiers (PNG, JPG, PDF - max 2MB - max 10)</Label>

            {/* Existing files */}
            {fichiers.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 text-sm bg-gray-50 rounded px-2 py-1"
              >
                {f.type.startsWith('image/') ? (
                  <Image className="h-3.5 w-3.5 text-gray-500" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-gray-500" />
                )}
                <span className="flex-1 truncate">{f.nom}</span>
                <button
                  type="button"
                  onClick={() => removeExistingFile(f.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Pending files */}
            {pendingFiles.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 text-sm bg-blue-50 rounded px-2 py-1"
              >
                {f.type.startsWith('image/') ? (
                  <Image className="h-3.5 w-3.5 text-blue-500" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span className="flex-1 truncate">{f.nom}</span>
                <button
                  type="button"
                  onClick={() => removePendingFile(f.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {fichiers.length + pendingFiles.length < 10 && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Ajouter fichier
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            style={{ backgroundColor: '#004489' }}
            className="text-white hover:opacity-90"
          >
            {isPending ? 'En cours...' : isEdit ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
