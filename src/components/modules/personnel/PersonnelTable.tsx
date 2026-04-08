'use client'

import { useState, useMemo, useTransition } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import type { Personnel } from '@prisma/client'
import { PersonnelDialog } from './PersonnelDialog'
import {
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} from '@/actions/personnel'

interface PersonnelTableProps {
  initialData: Personnel[]
}

export function PersonnelTable({ initialData }: PersonnelTableProps) {
  const [data, setData] = useState<Personnel[]>(initialData)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (p) =>
        p.prenom.toLowerCase().includes(q) ||
        p.nom.toLowerCase().includes(q) ||
        p.poste.toLowerCase().includes(q) ||
        (p.telephone && p.telephone.toLowerCase().includes(q)) ||
        (p.entreprise && p.entreprise.toLowerCase().includes(q))
    )
  }, [data, search])

  const handleSave = async (formData: {
    prenom: string
    nom: string
    poste: string
    telephone: string | null
    entreprise: string | null
  }) => {
    if (editingPersonnel) {
      const result = await updatePersonnel(editingPersonnel.id, formData)
      if (!result.success) throw new Error(result.error)
      setData((prev) =>
        prev.map((p) =>
          p.id === editingPersonnel.id ? { ...p, ...formData } : p
        )
      )
    } else {
      const result = await createPersonnel(formData)
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

  const handleDelete = (personnel: Personnel) => {
    if (!confirm(`Supprimer ${personnel.prenom} ${personnel.nom} ?`)) return

    setDeletingId(personnel.id)
    startTransition(async () => {
      const result = await deletePersonnel(personnel.id)
      if (result.success) {
        setData((prev) => prev.filter((p) => p.id !== personnel.id))
      }
      setDeletingId(null)
    })
  }

  const openAdd = () => {
    setEditingPersonnel(null)
    setDialogOpen(true)
  }

  const openEdit = (personnel: Personnel) => {
    setEditingPersonnel(personnel)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap px-6 py-3 border-b" style={{ borderColor: '#DCDCDC' }}>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors hover:opacity-90"
          style={{ backgroundColor: '#004489' }}
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom, poste, entreprise...)"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left" style={{ fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#004489' }}>
              <th className="px-4 py-3 text-white font-semibold">Prenom</th>
              <th className="px-4 py-3 text-white font-semibold">Nom</th>
              <th className="px-4 py-3 text-white font-semibold">Poste</th>
              <th className="px-4 py-3 text-white font-semibold">Telephone</th>
              <th className="px-4 py-3 text-white font-semibold">Entreprise</th>
              <th className="px-4 py-3 text-white font-semibold w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                  {search ? 'Aucun resultat' : 'Aucun personnel enregistre'}
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <tr
                  key={p.id}
                  onDoubleClick={() => openEdit(p)}
                  className="cursor-pointer hover:!bg-[#E5EFF8] hover:!text-[#003370] transition-colors"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F0F0F0',
                    borderBottom: '1px solid #DCDCDC',
                  }}
                >
                  <td className="px-4 py-2.5">{p.prenom}</td>
                  <td className="px-4 py-2.5 font-medium">{p.nom}</td>
                  <td className="px-4 py-2.5">{p.poste}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {p.telephone || '-'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {p.entreprise || '-'}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(p)
                      }}
                      disabled={deletingId === p.id || isPending}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-6 py-2 border-t text-xs text-slate-500" style={{ borderColor: '#DCDCDC' }}>
        {filtered.length} personnel{filtered.length > 1 ? 's' : ''}{' '}
        {search && data.length !== filtered.length && `(sur ${data.length} total)`}
      </div>

      <PersonnelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        personnel={editingPersonnel}
        onSave={handleSave}
      />
    </div>
  )
}
