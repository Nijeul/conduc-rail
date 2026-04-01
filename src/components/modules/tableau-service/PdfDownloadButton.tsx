'use client'

import { pdf } from '@react-pdf/renderer'
import { TableauServicePdf } from '@/lib/pdf/tableau-service'
import { useProfilStore } from '@/stores/profil'
import { useExportPDF } from '@/hooks/useExportPDF'
import { getAllPersonnelForMap } from '@/actions/tableau-service'
import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ColonneTS, LigneTS, CellulesTS, PersonnelMap } from './types'

interface Props {
  titre: string
  entreprise: string | null
  semaine: number
  annee: number
  projetNom: string
  colonnes: ColonneTS[]
  lignes: LigneTS[]
  cellules: CellulesTS
}

export function PdfDownloadButton({
  titre,
  entreprise,
  semaine,
  annee,
  projetNom,
  colonnes,
  lignes,
  cellules,
}: Props) {
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)
  const { exportAvecGuard, isExporting } = useExportPDF()

  const handleExport = () => {
    exportAvecGuard(async () => {
      try {
        // Charger le personnel pour la map id -> infos (telephone)
        const allPersonnel = await getAllPersonnelForMap()
        const personnelMap: PersonnelMap = {}
        for (const p of allPersonnel) {
          personnelMap[p.id] = {
            id: p.id,
            prenom: p.prenom,
            nom: p.nom,
            poste: p.poste,
            telephone: p.telephone,
            entreprise: p.entreprise,
          }
        }

        const blob = await pdf(
          <TableauServicePdf
            titre={titre}
            entreprise={entreprise}
            semaine={semaine}
            annee={annee}
            projetNom={projetNom}
            colonnes={colonnes}
            lignes={lignes}
            cellules={cellules}
            personnelMap={personnelMap}
            userLogo={userLogo ?? undefined}
            nomSociete={nomSociete ?? undefined}
          />
        ).toBlob()

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `tableau-service-S${semaine}-${annee}.pdf`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }, 100)
      } catch (err) {
        console.error('PDF generation error:', err)
      }
    })
  }

  return (
    <Button
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="bg-[#F0F0F0] border border-[#DCDCDC] hover:bg-[#F0F0F0] border border-[#DCDCDC]/90 text-[#000000] gap-1.5"
    >
      <FileDown className="h-3.5 w-3.5" />
      {isExporting ? 'Generation...' : 'Export PDF'}
    </Button>
  )
}
