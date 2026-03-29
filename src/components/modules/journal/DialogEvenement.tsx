'use client'

import { useState, useTransition, useRef } from 'react'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CAT, type CategorieKey } from './categories'
import {
  createEvenement,
  updateEvenement,
  addFichierEvenement,
  deleteFichierEvenement,
} from '@/actions/journal'
import { Upload, X, FileText, Image } from 'lucide-react'

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
  fichiers?: FichierRow[]
}

interface DialogEvenementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projetId: string
  evenement?: EvenementData | null
}

export function DialogEvenement({
  open,
  onOpenChange,
  projetId,
  evenement,
}: DialogEvenementProps) {
  const isEdit = !!evenement?.id
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(evenement?.date || new Date().toISOString().slice(0, 10))
  const [titre, setTitre] = useState(evenement?.titre || '')
  const [description, setDescription] = useState(evenement?.description || '')
  const [categorie, setCategorie] = useState(evenement?.categorie || 'autre')
  const [fichiers, setFichiers] = useState<FichierRow[]>(evenement?.fichiers || [])
  const [pendingFiles, setPendingFiles] = useState<FichierRow[]>([])

  // Reset form when opening with new data
  const resetForm = () => {
    setDate(evenement?.date || new Date().toISOString().slice(0, 10))
    setTitre(evenement?.titre || '')
    setDescription(evenement?.description || '')
    setCategorie(evenement?.categorie || 'autre')
    setFichiers(evenement?.fichiers || [])
    setPendingFiles([])
    setError('')
  }

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

  function handleSubmit() {
    if (!titre.trim()) {
      setError('Le titre est requis')
      return
    }
    if (!date) {
      setError('La date est requise')
      return
    }

    setError('')
    startTransition(async () => {
      const payload = {
        ...(isEdit ? { id: evenement!.id } : {}),
        date,
        titre: titre.trim(),
        description: description.trim(),
        categorie,
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

  const catEntry = CAT[categorie as CategorieKey]

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm()
        onOpenChange(val)
      }}
    >
      <DialogContent className="max-w-lg">
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
            <Select value={categorie} onValueChange={setCategorie}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CAT).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.point }}
                      />
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            style={{ backgroundColor: '#1565C0' }}
            className="text-white hover:opacity-90"
          >
            {isPending ? 'En cours...' : isEdit ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
