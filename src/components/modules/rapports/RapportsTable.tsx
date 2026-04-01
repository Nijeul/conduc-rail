'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateFR } from '@/lib/utils'
import { deleteRapport } from '@/actions/rapports'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface RapportRow {
  id: string
  date: Date
  titre: string | null
  posteNuit: boolean
  valide: boolean
  redacteur: { id: string; name: string; email: string } | null
}

interface RapportsTableProps {
  rapports: RapportRow[]
  projetId: string
}

export function RapportsTable({ rapports, projetId }: RapportsTableProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleRowClick(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
  }

  function handleRowDoubleClick(id: string) {
    router.push(`/projets/${projetId}/suivi/rapports/${id}`)
  }

  function handleNew() {
    router.push(`/projets/${projetId}/suivi/rapports/nouveau`)
  }

  function handleEdit() {
    if (selectedId) {
      router.push(`/projets/${projetId}/suivi/rapports/${selectedId}`)
    }
  }

  function handleDelete() {
    if (!selectedId) return
    setShowConfirm(true)
  }

  function confirmDelete() {
    if (!selectedId) return
    startTransition(async () => {
      await deleteRapport(selectedId, projetId)
      setSelectedId(null)
      setShowConfirm(false)
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-[#F0F0F0] border border-[#DCDCDC] rounded-t-lg">
        <Button
          onClick={handleNew}
          className="bg-[#004489] hover:bg-[#004489]/90 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau rapport
        </Button>
        <Button
          onClick={handleEdit}
          disabled={!selectedId}
          className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
          size="sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Modifier
        </Button>
        <Button
          onClick={handleDelete}
          disabled={!selectedId}
          className="bg-[#E20025] hover:bg-[#E20025]/90 text-white"
          size="sm"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-4">
              Etes-vous sur de vouloir supprimer ce rapport ? Cette action est irreversible.
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
                className="bg-[#E20025] hover:bg-[#E20025]/90 text-white"
                size="sm"
                onClick={confirmDelete}
                disabled={isPending}
              >
                {isPending ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-[#DCDCDC] rounded-b-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#004489] text-white font-bold">
              <th className="text-left px-4 py-3 border-r border-[#DCDCDC]/20">Date</th>
              <th className="text-left px-4 py-3 border-r border-[#DCDCDC]/20">Titre</th>
              <th className="text-left px-4 py-3 border-r border-[#DCDCDC]/20">Redacteur</th>
              <th className="text-center px-4 py-3 border-r border-[#DCDCDC]/20">Poste</th>
              <th className="text-center px-4 py-3">Valide</th>
            </tr>
          </thead>
          <tbody>
            {rapports.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">
                  Aucun rapport journalier. Cliquez sur &quot;Nouveau rapport&quot; pour commencer.
                </td>
              </tr>
            ) : (
              rapports.map((r, i) => {
                const isSelected = selectedId === r.id
                return (
                  <tr
                    key={r.id}
                    onClick={() => handleRowClick(r.id)}
                    onDoubleClick={() => handleRowDoubleClick(r.id)}
                    className={`cursor-pointer border-t border-[#DCDCDC] transition-colors ${
                      isSelected
                        ? 'bg-[#E5EFF8] text-[#003370]'
                        : i % 2 === 0
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-[#F0F0F0] hover:bg-gray-100'
                    }`}
                  >
                    <td className="px-4 py-2.5 border-r border-[#DCDCDC]">
                      {formatDateFR(new Date(r.date))}
                    </td>
                    <td className="px-4 py-2.5 border-r border-[#DCDCDC]">
                      {r.titre || '-'}
                    </td>
                    <td className="px-4 py-2.5 border-r border-[#DCDCDC]">
                      {r.redacteur?.name || '-'}
                    </td>
                    <td className="px-4 py-2.5 border-r border-[#DCDCDC] text-center text-lg">
                      {r.posteNuit ? '\uD83C\uDF19' : '\u2600\uFE0F'}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {r.valide ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Valide
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          Brouillon
                        </Badge>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
