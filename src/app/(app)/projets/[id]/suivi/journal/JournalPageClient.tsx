'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { JournalListe } from '@/components/modules/journal/JournalListe'
import { FriseChronologique } from '@/components/modules/journal/FriseChronologique'
import { FicheEcartTable } from '@/components/modules/journal/FicheEcartTable'
import { List, Calendar, ClipboardList } from 'lucide-react'

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

interface JournalPageClientProps {
  evenements: EvenementRow[]
  projetId: string
  projetName: string
}

export function JournalPageClient({
  evenements,
  projetId,
  projetName,
}: JournalPageClientProps) {
  const [vue, setVue] = useState<'liste' | 'frise' | 'fiche-ecart'>('liste')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Journal de Chantier
        </h1>
      </div>

      {/* Toggle vue */}
      <div className="flex items-center border rounded-md overflow-hidden mb-4">
        <button
          onClick={() => setVue('liste')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
            vue === 'liste'
              ? 'bg-[#37474F] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          Liste
        </button>
        <button
          onClick={() => setVue('frise')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l ${
            vue === 'frise'
              ? 'bg-[#37474F] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Frise
        </button>
        <button
          onClick={() => setVue('fiche-ecart')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l ${
            vue === 'fiche-ecart'
              ? 'bg-[#37474F] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Fiche Ecart
        </button>
      </div>

      {/* Content */}
      {vue === 'liste' ? (
        <JournalListe evenements={evenements} projetId={projetId} />
      ) : vue === 'frise' ? (
        <FriseChronologique evenements={evenements} projetId={projetId} />
      ) : (
        <FicheEcartTable
          projetId={projetId}
          projetName={projetName}
          evenements={evenements}
        />
      )}
    </div>
  )
}
