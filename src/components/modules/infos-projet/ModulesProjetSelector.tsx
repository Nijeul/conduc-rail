'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { updateModulesMasques } from '@/actions/infos-projet'
import { ONGLETS_PROJET } from '@/lib/modules-projet'
import { LayoutGrid } from 'lucide-react'

interface Props {
  projetId: string
  modulesMasques: string[]
}

export function ModulesProjetSelector({ projetId, modulesMasques }: Props) {
  const router = useRouter()
  const [masques, setMasques] = useState<string[]>(modulesMasques)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle(key: string, visible: boolean) {
    const nouveaux = visible
      ? masques.filter((k) => k !== key)
      : [...masques, key]
    setMasques(nouveaux)
    setSaving(true)
    setError(null)
    const res = await updateModulesMasques(projetId, nouveaux)
    setSaving(false)
    if (res.success) {
      router.refresh() // met à jour la barre de navigation immédiatement
    } else {
      setMasques(masques) // rollback
      setError(res.error)
    }
  }

  return (
    <div className="rounded-lg border border-[#DCDCDC] bg-white p-5">
      <div className="flex items-center gap-2 mb-1">
        <LayoutGrid className="h-4 w-4 text-[#004489]" />
        <h2 className="text-base font-semibold text-[#004489]">
          Modules du chantier
        </h2>
        {saving && <span className="text-xs text-[#5A5A5A]">Enregistrement...</span>}
      </div>
      <p className="text-sm text-[#5A5A5A] mb-4">
        Décochez les modules inutiles sur ce chantier : ils disparaissent de la
        navigation. Vous pouvez les réactiver à tout moment, aucune donnée n&apos;est
        supprimée.
      </p>

      {error && (
        <div className="bg-[#FDEAED] border border-[#E20025] text-[#E20025] px-3 py-2 rounded text-sm mb-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ONGLETS_PROJET.map((onglet) => (
          <div key={onglet.id}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#5A5A5A] border-b border-[#DCDCDC] pb-1.5 mb-2.5">
              {onglet.label}
            </p>
            <div className="space-y-2">
              {onglet.modules.map((m) => {
                const visible = !masques.includes(m.key)
                return (
                  <div key={m.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`module-${m.key}`}
                      checked={visible}
                      disabled={!m.toggleable}
                      onCheckedChange={(v) => handleToggle(m.key, v === true)}
                    />
                    <Label
                      htmlFor={`module-${m.key}`}
                      className={`cursor-pointer text-sm ${
                        !m.toggleable
                          ? 'text-[#B5ABA1]'
                          : visible
                            ? 'text-[#000000]'
                            : 'text-[#5A5A5A] line-through'
                      }`}
                    >
                      {m.label}
                      {!m.toggleable && (
                        <span className="ml-1 text-[10px] text-[#B5ABA1]">
                          (toujours visible)
                        </span>
                      )}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
