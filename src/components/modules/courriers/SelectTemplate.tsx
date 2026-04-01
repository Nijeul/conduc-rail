'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import { TEMPLATES_COURRIERS } from '@/lib/courriers-templates'

interface ProjetInfos {
  name?: string | null
  numeroAffaire?: string | null
  dateDebut?: Date | null
}

interface SelectTemplateProps {
  projetInfos: ProjetInfos
  onSelect: (objet: string, corps: string) => void
}

function substituteVars(text: string, infos: ProjetInfos): string {
  const today = new Date().toLocaleDateString('fr-FR')
  const dateDebut = infos.dateDebut
    ? new Date(infos.dateDebut).toLocaleDateString('fr-FR')
    : '[date de debut]'

  return text
    .replace(/\{\{date\}\}/g, today)
    .replace(/\{\{dateAlerte\}\}/g, '[date alerte]')
    .replace(/\{\{dateConstatation\}\}/g, today)
    .replace(/\{\{nomChantier\}\}/g, infos.name || '[nom du chantier]')
    .replace(/\{\{numeroAffaire\}\}/g, infos.numeroAffaire || '[n° affaire]')
    .replace(/\{\{dateDebut\}\}/g, dateDebut)
}

export function SelectTemplate({ projetInfos, onSelect }: SelectTemplateProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="border-[#004489] text-[#004489]"
      >
        <FileText className="h-4 w-4 mr-2" />
        Utiliser un modele
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-md shadow-lg py-1 z-30 min-w-[280px]">
          {Object.entries(TEMPLATES_COURRIERS).map(([key, tpl]) => (
            <button
              key={key}
              type="button"
              className="block w-full text-left px-4 py-2 text-sm text-text-main hover:bg-[#F0F0F0] transition-colors"
              onClick={() => {
                onSelect(
                  substituteVars(tpl.objet, projetInfos),
                  substituteVars(tpl.corps, projetInfos)
                )
                setOpen(false)
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
