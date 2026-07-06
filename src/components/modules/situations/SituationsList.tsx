'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  createSituation,
  deleteSituation,
  type SituationResume,
} from '@/actions/situations'
import { formatMontant, formatDateFR } from '@/lib/utils'
import { labelMois } from '@/lib/mois'
import { Plus, Trash2, Eye, Pencil } from 'lucide-react'

interface Props {
  projetId: string
  situations: SituationResume[]
}

export function SituationsList({ projetId, situations }: Props) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [libelle, setLibelle] = useState('')
  const [moisInput, setMoisInput] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    const [annee, mois] = moisInput.split('-').map(Number)
    if (!annee || !mois) {
      setError('Veuillez choisir un mois')
      return
    }
    setCreating(true)
    setError(null)
    const res = await createSituation(projetId, {
      libelle: libelle.trim() || null,
      annee,
      mois,
    })
    setCreating(false)
    if (res.success) {
      setDialogOpen(false)
      router.push(`/projets/${projetId}/suivi/situations/${res.data.id}`)
    } else {
      setError(res.error)
    }
  }

  async function handleDelete(s: SituationResume) {
    if (!confirm(`Supprimer la situation n°${s.numero} ?`)) return
    const res = await deleteSituation(projetId, s.id)
    if (res.success) router.refresh()
    else alert(res.error)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            setLibelle('')
            setError(null)
            setDialogOpen(true)
          }}
          className="bg-[#004489] hover:bg-[#003370] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle situation
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold text-[12px]">
              <th className="px-2 py-2 text-left w-16">N°</th>
              <th className="px-2 py-2 text-left">Mois</th>
              <th className="px-2 py-2 text-left">Libellé</th>
              <th className="px-2 py-2 text-center">Statut</th>
              <th className="px-2 py-2 text-right">Montant situation HT</th>
              <th className="px-2 py-2 text-right">Cumul HT</th>
              <th className="px-2 py-2 text-left">Dernière modification</th>
              <th className="px-2 py-2 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {situations.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b border-[#DCDCDC] ${
                  i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                } hover:bg-[#E5EFF8] cursor-pointer`}
                onClick={() =>
                  router.push(`/projets/${projetId}/suivi/situations/${s.id}`)
                }
              >
                <td className="px-2 py-2 font-bold text-[#004489]">n°{s.numero}</td>
                <td className="px-2 py-2">{labelMois(s.mois, s.annee)}</td>
                <td className="px-2 py-2">{s.libelle || '—'}</td>
                <td className="px-2 py-2 text-center">
                  {s.statut === 'validee' ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8EFDA] text-[#5E8019]">
                      Validée
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF7D1] text-[#DD9412]">
                      Brouillon
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right font-medium">
                  {formatMontant(s.montantSituation)}
                </td>
                <td className="px-2 py-2 text-right">{formatMontant(s.montantCumule)}</td>
                <td className="px-2 py-2 text-[12px] text-[#5A5A5A]">
                  {formatDateFR(new Date(s.updatedAt))}
                </td>
                <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/projets/${projetId}/suivi/situations/${s.id}`}
                      className="p-1.5 rounded hover:bg-[#E5EFF8] text-[#004489]"
                      title={s.statut === 'validee' ? 'Consulter' : 'Modifier'}
                    >
                      {s.statut === 'validee' ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Link>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-1.5 rounded hover:bg-[#FDEAED] text-[#E20025]"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {situations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                  Aucune situation — cliquez sur « Nouvelle situation » pour créer la
                  première
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#004489]">Nouvelle situation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="sit-mois">Mois de la situation *</Label>
              <Input
                id="sit-mois"
                type="month"
                value={moisInput}
                onChange={(e) => setMoisInput(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sit-libelle">Libellé (optionnel)</Label>
              <Input
                id="sit-libelle"
                value={libelle}
                onChange={(e) => setLibelle(e.target.value)}
                placeholder="Ex : Situation d'août"
              />
            </div>
            {error && (
              <div className="bg-[#FDEAED] border border-[#E20025] text-[#E20025] px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-[#004489] text-[#004489]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="bg-[#004489] hover:bg-[#003370] text-white"
            >
              {creating ? 'Création...' : 'Créer la situation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
