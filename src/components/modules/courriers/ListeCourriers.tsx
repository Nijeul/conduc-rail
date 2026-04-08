'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteCourrier, duplicateCourrier } from '@/actions/courriers'
import { Plus, Pencil, Copy, Trash2 } from 'lucide-react'

interface Courrier {
  id: string
  reference: string
  objet: string
  type: string
  dateEnvoi: Date | null
  statut: string
}

interface ListeCourriersProps {
  courriers: Courrier[]
  projetId: string
}

export function ListeCourriers({ courriers, projetId }: ListeCourriersProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce courrier ?')) return
    setDeleting(id)
    await deleteCourrier(projetId, id)
    setDeleting(null)
    router.refresh()
  }

  async function handleDuplicate(id: string) {
    const result = await duplicateCourrier(projetId, id)
    if (result.success) {
      router.push(`/projets/${projetId}/courriers/${result.data.id}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={() => router.push(`/projets/${projetId}/courriers/nouveau`)}
          className="bg-[#004489] hover:bg-[#004489]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau courrier
        </Button>
        <h2 className="text-lg font-semibold text-[#004489]">Courriers de chantier</h2>
      </div>

      {/* Table */}
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#004489] text-white">
              <th className="text-left px-4 py-3 font-medium">Reference</th>
              <th className="text-left px-4 py-3 font-medium">Objet</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Date d&apos;envoi</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courriers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                  Aucun courrier pour ce projet.
                </td>
              </tr>
            )}
            {courriers.map((c, i) => (
              <tr
                key={c.id}
                className={i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'}
              >
                <td className="px-4 py-3 font-mono text-xs">{c.reference}</td>
                <td className="px-4 py-3">{c.objet}</td>
                <td className="px-4 py-3 capitalize">{c.type}</td>
                <td className="px-4 py-3">
                  {c.dateEnvoi
                    ? new Date(c.dateEnvoi).toLocaleDateString('fr-FR')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {c.statut === 'envoye' ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Envoye
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      Brouillon
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/projets/${projetId}/courriers/${c.id}`)
                      }
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicate(c.id)}
                      title="Dupliquer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      title="Supprimer"
                      className="text-[#E20025] hover:text-[#E20025] hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
