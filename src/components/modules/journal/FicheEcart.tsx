'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateFR } from '@/lib/utils'
import { CAT, type CategorieKey } from './categories'
import { DialogEvenement } from './DialogEvenement'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, FileText, Download, Image } from 'lucide-react'
import dynamic from 'next/dynamic'

const PDFDownloadButton = dynamic(
  () => import('./FicheEcartPDFButton').then((m) => m.FicheEcartPDFButton),
  { ssr: false, loading: () => <Button size="sm" variant="outline" disabled>Chargement PDF...</Button> }
)

interface FichierRow {
  id: string
  nom: string
  type: string
  taille: number
  contenu: string
}

interface EvenementRow {
  id: string
  date: Date
  titre: string
  description: string | null
  categorie: string
  fichiers: FichierRow[]
}

interface FicheEcartProps {
  evenements: EvenementRow[]
  projetId: string
  projetName: string
}

export function FicheEcart({ evenements, projetId, projetName }: FicheEcartProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Sort by date ascending and number them
  const sorted = [...evenements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  function getRowBg(categorie: string): string | undefined {
    if (categorie === 'alerte') return '#FFEBEE'
    return undefined
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={() => setDialogOpen(true)}
          size="sm"
          style={{ backgroundColor: '#004489' }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter une ligne manuelle
        </Button>

        <PDFDownloadButton
          evenements={sorted}
          projetName={projetName}
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#004489' }}>
              <th className="text-left text-white font-medium px-4 py-2.5 w-[100px]">
                Date
              </th>
              <th className="text-center text-white font-medium px-4 py-2.5 w-[60px]">
                N&deg;
              </th>
              <th className="text-left text-white font-medium px-4 py-2.5">
                Etape / Description
              </th>
              <th className="text-center text-white font-medium px-4 py-2.5 w-[100px]">
                Fichiers
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-12">
                  Aucun evenement
                </td>
              </tr>
            )}
            {sorted.map((ev, i) => {
              const rowBg = getRowBg(ev.categorie)
              return (
                <tr
                  key={ev.id}
                  style={
                    rowBg
                      ? { backgroundColor: rowBg }
                      : i % 2 !== 0
                      ? { backgroundColor: '#F0F0F0' }
                      : undefined
                  }
                >
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {formatDateFR(new Date(ev.date))}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono text-xs">
                    {String(i + 1).padStart(3, '0')}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{ev.titre}</div>
                    {ev.description && (
                      <div className="text-gray-500 text-xs mt-0.5">
                        {ev.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {ev.fichiers.length > 0 ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs">
                            <FileText className="h-3.5 w-3.5" />
                            {ev.fichiers.length}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                          <div className="space-y-1">
                            {ev.fichiers.map((f) => (
                              <a
                                key={f.id}
                                href={f.contenu}
                                download={f.nom}
                                className="flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-gray-50 text-blue-600"
                              >
                                {f.type.startsWith('image/') ? (
                                  <Image className="h-3 w-3" />
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                <span className="truncate flex-1">{f.nom}</span>
                                <Download className="h-3 w-3 opacity-50" />
                              </a>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <DialogEvenement
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projetId={projetId}
        evenement={null}
      />
    </div>
  )
}
