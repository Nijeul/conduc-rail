'use client'

import { useState, useMemo, useTransition } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import type { MaterielTTx } from '@prisma/client'
import { MaterielSheet } from './MaterielSheet'
import { COULEURS_TYPE_MATERIEL } from './constants'
import {
  createMateriel,
  updateMateriel,
  deleteMateriel,
} from '@/actions/materiel'
import { formatNombreFR } from '@/lib/utils'

interface MaterielTableProps {
  initialData: MaterielTTx[]
}

export function MaterielTable({ initialData }: MaterielTableProps) {
  const [data, setData] = useState<MaterielTTx[]>(initialData)
  const [search, setSearch] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingMateriel, setEditingMateriel] = useState<MaterielTTx | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (m) =>
        m.type.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        (m.commentaires && m.commentaires.toLowerCase().includes(q))
    )
  }, [data, search])

  const handleSave = async (formData: {
    type: string
    designation: string
    imageUrl: string | null
    nbEssieux: number | null
    poidsEntrant: number | null
    poidsSortant: number | null
    longueur: number | null
    capTraction: number | null
    capEssieuxFreines: number | null
    commentaires: string | null
    estSysteme: boolean
  }) => {
    if (editingMateriel) {
      const result = await updateMateriel(editingMateriel.id, formData)
      if (!result.success) throw new Error(result.error)
      setData((prev) =>
        prev.map((m) =>
          m.id === editingMateriel.id ? { ...m, ...formData } : m
        )
      )
    } else {
      const result = await createMateriel(formData)
      if (!result.success) throw new Error(result.error)
      setData((prev) => [
        ...prev,
        {
          id: result.data.id,
          ...formData,
          createdAt: new Date(),
        },
      ])
    }
  }

  const handleDelete = (materiel: MaterielTTx) => {
    if (materiel.estSysteme) return
    if (!confirm(`Supprimer ${materiel.designation} ?`)) return

    setDeletingId(materiel.id)
    startTransition(async () => {
      const result = await deleteMateriel(materiel.id)
      if (result.success) {
        setData((prev) => prev.filter((m) => m.id !== materiel.id))
      }
      setDeletingId(null)
    })
  }

  const openAdd = () => {
    setEditingMateriel(null)
    setSheetOpen(true)
  }

  const openEdit = (materiel: MaterielTTx) => {
    setEditingMateriel(materiel)
    setSheetOpen(true)
  }

  const fmtNum = (val: number | null | undefined) =>
    val != null ? formatNombreFR(val, 1) : '-'

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-3 border-b"
        style={{ borderColor: '#ECEFF1' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (type, designation...)"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors hover:opacity-90"
          style={{ backgroundColor: '#1565C0' }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un materiel
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left" style={{ fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#263238' }}>
              <th className="px-4 py-3 text-white font-semibold">Type</th>
              <th className="px-4 py-3 text-white font-semibold">Designation</th>
              <th className="px-4 py-3 text-white font-semibold text-right">Essieux</th>
              <th className="px-4 py-3 text-white font-semibold text-right">P.entrant</th>
              <th className="px-4 py-3 text-white font-semibold text-right">P.sortant</th>
              <th className="px-4 py-3 text-white font-semibold text-right">Longueur</th>
              <th className="px-4 py-3 text-white font-semibold text-right">Cap.traction</th>
              <th className="px-4 py-3 text-white font-semibold text-center">Systeme</th>
              <th className="px-4 py-3 text-white font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-slate-400 text-sm"
                >
                  {search ? 'Aucun resultat' : 'Aucun materiel enregistre'}
                </td>
              </tr>
            ) : (
              filtered.map((m, i) => (
                <tr
                  key={m.id}
                  onDoubleClick={() => openEdit(m)}
                  className="cursor-pointer hover:!bg-[#BBDEFB] hover:!text-[#0D47A1] transition-colors"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F5F7FA',
                    borderBottom: '1px solid #ECEFF1',
                  }}
                >
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block shrink-0"
                        style={{
                          backgroundColor:
                            COULEURS_TYPE_MATERIEL[m.type] || '#546E7A',
                        }}
                      />
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium">{m.designation}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {fmtNum(m.nbEssieux)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {fmtNum(m.poidsEntrant)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {fmtNum(m.poidsSortant)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {fmtNum(m.longueur)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {fmtNum(m.capTraction)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {m.estSysteme && (
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: '#1565C0' }}
                      >
                        Systeme
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {!m.estSysteme && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(m)
                        }}
                        disabled={deletingId === m.id || isPending}
                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div
        className="px-6 py-2 border-t text-xs text-slate-500"
        style={{ borderColor: '#ECEFF1' }}
      >
        {filtered.length} materiel{filtered.length > 1 ? 's' : ''}{' '}
        {search &&
          data.length !== filtered.length &&
          `(sur ${data.length} total)`}
      </div>

      <MaterielSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        materiel={editingMateriel}
        onSave={handleSave}
      />
    </div>
  )
}
