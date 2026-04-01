'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateFR } from '@/lib/utils'
import { deleteEvenement, toggleAfficherFrise } from '@/actions/journal'
import { resolveCatColors, type CategorieRow, type CouleursCatMap } from './categories'
import { DialogEvenement } from './DialogEvenement'
import { Plus, Pencil, Trash2, FileText, Image, Eye, EyeOff } from 'lucide-react'

interface FichierRow {
  id: string
  nom: string
  type: string
  taille: number
  contenu?: string
}

interface CategorieRefRow {
  id: string
  nom: string
  couleurBg: string
  couleurBorder: string
  couleurText: string
  couleurPoint: string
  estSysteme: boolean
}

interface EvenementRow {
  id: string
  date: Date
  titre: string
  description: string | null
  categorie: string
  categorieId: string | null
  afficherFrise: boolean
  fichiers: FichierRow[]
  categorieRef: CategorieRefRow | null
}

interface JournalListeProps {
  evenements: EvenementRow[]
  categories: CategorieRow[]
  couleursCat: CouleursCatMap
  projetId: string
}

export function JournalListe({ evenements, categories, couleursCat, projetId }: JournalListeProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState<{
    id: string
    date: string
    titre: string
    description: string
    categorie: string
    categorieId: string | null
    fichiers: FichierRow[]
  } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

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
      categorieId: ev.categorieId,
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

  function handleToggleFrise(e: React.MouseEvent, evId: string) {
    e.stopPropagation()
    startTransition(async () => {
      await toggleAfficherFrise(evId, projetId)
    })
  }

  function handleFichierClick(e: React.MouseEvent, fichier: FichierRow) {
    e.stopPropagation()
    if (fichier.type.startsWith('image/') && fichier.contenu) {
      setLightboxSrc(fichier.contenu)
    } else if (fichier.type === 'application/pdf' && fichier.contenu) {
      // Open PDF in new tab
      const win = window.open()
      if (win) {
        win.document.write(`<iframe src="${fichier.contenu}" width="100%" height="100%" style="border:none;position:absolute;inset:0;"></iframe>`)
        win.document.title = fichier.nom
      }
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={handleNew}
          size="sm"
          style={{ backgroundColor: '#004489' }}
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
              style={{ backgroundColor: '#F0F0F0', color: '#000000', border: '1px solid #DCDCDC' }}
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
            <tr style={{ backgroundColor: '#004489' }}>
              <th className="text-left text-white font-medium px-4 py-2.5 w-[100px]">Date</th>
              <th className="text-left text-white font-medium px-4 py-2.5 w-[140px]">Categorie</th>
              <th className="text-left text-white font-medium px-4 py-2.5">Titre</th>
              <th className="text-left text-white font-medium px-4 py-2.5">Description</th>
              <th className="text-center text-white font-medium px-4 py-2.5 w-[100px]">Fichiers</th>
              <th className="text-center text-white font-medium px-4 py-2.5 w-[50px]">Frise</th>
            </tr>
          </thead>
          <tbody>
            {evenements.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-12">
                  Aucun evenement enregistre
                </td>
              </tr>
            )}
            {evenements.map((ev, i) => {
              const cat = resolveCatColors(ev, couleursCat)
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
                      ? { backgroundColor: '#F0F0F0' }
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
                  <td className="px-4 py-2.5">
                    {ev.fichiers.length > 0 && (
                      <div className="flex items-center gap-1 justify-center flex-wrap">
                        {ev.fichiers.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={(e) => handleFichierClick(e, f)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs border hover:bg-gray-100 transition-colors"
                            style={{ borderColor: '#DCDCDC' }}
                            title={f.nom}
                          >
                            {f.type.startsWith('image/') ? (
                              <Image className="h-3 w-3 text-gray-500" />
                            ) : (
                              <FileText className="h-3 w-3 text-red-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFrise(e, ev.id)}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title={ev.afficherFrise ? 'Masquer de la frise' : 'Afficher dans la frise'}
                    >
                      {ev.afficherFrise ? (
                        <Eye className="h-4 w-4 text-[#004489]" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
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

      {/* Lightbox for images */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={lightboxSrc}
              alt="Piece jointe"
              className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl"
            />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Dialog */}
      <DialogEvenement
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projetId={projetId}
        evenement={editData}
        categories={categories}
        couleursCat={couleursCat}
      />
    </div>
  )
}
