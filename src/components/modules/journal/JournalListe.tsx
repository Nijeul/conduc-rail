'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateFR } from '@/lib/utils'
import { deleteEvenement } from '@/actions/journal'
import { CAT, type CategorieKey } from './categories'
import { DialogEvenement } from './DialogEvenement'
import { Plus, Pencil, Trash2, FileText, Image } from 'lucide-react'

interface FichierRow {
  id: string
  nom: string
  type: string
  taille: number
}

interface EvenementRow {
  id: string
  date: Date
  titre: string
  description: string | null
  categorie: string
  fichiers: FichierRow[]
}

interface JournalListeProps {
  evenements: EvenementRow[]
  projetId: string
}

export function JournalListe({ evenements, projetId }: JournalListeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<{
    id: string
    date: string
    titre: string
    description: string
    categorie: string
    fichiers: FichierRow[]
  } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleNew() {
    setEditData(null)
    setDialogOpen(true)
  }

  function openEdit(ev: EvenementRow) {
    setEditData({
      id: ev.id,
      date: new Date(ev.date).toISOString().slice(0, 10),
      titre: ev.titre,
      description: ev.description || '',
      categorie: ev.categorie,
      fichiers: ev.fichiers,
    })
    setDialogOpen(true)
  }

  function handleRowDoubleClick(ev: EvenementRow) {
    openEdit(ev)
  }

  function handleDelete() {
    if (!selectedId) return
    setShowConfirm(true)
  }

  function confirmDelete() {
    if (!selectedId) return
    startTransition(async () => {
      await deleteEvenement(projetId, selectedId)
      setSelectedId(null)
      setShowConfirm(false)
    })
  }

  const catInfo = (cat: string) => CAT[cat as CategorieKey] || CAT.autre

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={handleNew}
          size="sm"
          style={{ backgroundColor: '#1565C0' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter un evenement
        </Button>

        {selectedId && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const ev = evenements.find((e) => e.id === selectedId)
                if (ev) openEdit(ev)
              }}
              style={{ backgroundColor: '#37474F', color: 'white' }}
              className="hover:opacity-90"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Supprimer
            </Button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#263238' }}>
              <th className="text-left text-white font-medium px-4 py-2.5 w-[100px]">Date</th>
              <th className="text-left text-white font-medium px-4 py-2.5 w-[140px]">Categorie</th>
              <th className="text-left text-white font-medium px-4 py-2.5">Titre</th>
              <th className="text-left text-white font-medium px-4 py-2.5">Description</th>
              <th className="text-center text-white font-medium px-4 py-2.5 w-[80px]">Fichiers</th>
            </tr>
          </thead>
          <tbody>
            {evenements.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-12">
                  Aucun evenement enregistre
                </td>
              </tr>
            )}
            {evenements.map((ev, i) => {
              const cat = catInfo(ev.categorie)
              const isSelected = selectedId === ev.id
              return (
                <tr
                  key={ev.id}
                  onClick={() => setSelectedId(isSelected ? null : ev.id)}
                  onDoubleClick={() => handleRowDoubleClick(ev)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 ring-1 ring-inset ring-blue-200'
                      : i % 2 === 0
                      ? 'bg-white hover:bg-gray-50'
                      : 'hover:bg-gray-100'
                  }`}
                  style={
                    !isSelected && i % 2 !== 0
                      ? { backgroundColor: '#F5F7FA' }
                      : undefined
                  }
                >
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {formatDateFR(new Date(ev.date))}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      className="text-xs font-medium border"
                      style={{
                        backgroundColor: cat.bg,
                        borderColor: cat.border,
                        color: cat.text,
                      }}
                    >
                      {cat.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 font-medium">{ev.titre}</td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {ev.description
                      ? ev.description.length > 80
                        ? ev.description.slice(0, 80) + '...'
                        : ev.description
                      : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {ev.fichiers.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        {ev.fichiers.some((f) => f.type.startsWith('image/')) && (
                          <Image className="h-3.5 w-3.5" />
                        )}
                        {ev.fichiers.some((f) => f.type === 'application/pdf') && (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs">({ev.fichiers.length})</span>
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Confirm delete dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <p className="text-sm mb-4">
              Supprimer cet evenement et tous ses fichiers ?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={confirmDelete}
                disabled={isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isPending ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      <DialogEvenement
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projetId={projetId}
        evenement={editData}
      />
    </div>
  )
}
