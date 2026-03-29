'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useTableauStore } from './use-tableau-store'
import { TableauTabs } from './TableauTabs'
import { TableauGrid } from './TableauGrid'
import { CreateTableauDialog } from './CreateTableauDialog'
import type { TableauServiceData, PersonnelMap } from './types'

// Dynamic import for PDF to avoid SSR issues
const PdfDownloadButton = dynamic(
  () => import('./PdfDownloadButton').then((m) => ({ default: m.PdfDownloadButton })),
  { ssr: false }
)

interface Props {
  projetId: string
  projetNom: string
  initialTableaux: TableauServiceData[]
  personnelMap: PersonnelMap
}

export function TableauServiceModule({ projetId, projetNom, initialTableaux, personnelMap }: Props) {
  const [tableaux, setTableaux] = useState<TableauServiceData[]>(initialTableaux)
  const [activeId, setActiveId] = useState<string | null>(
    initialTableaux.length > 0 ? initialTableaux[0].id : null
  )
  const [showCreate, setShowCreate] = useState(false)

  const init = useTableauStore((s) => s.init)
  const colonnes = useTableauStore((s) => s.colonnes)
  const lignes = useTableauStore((s) => s.lignes)
  const cellules = useTableauStore((s) => s.cellules)

  // Initialize store when active tableau changes
  useEffect(() => {
    if (activeId) {
      const t = tableaux.find((tab) => tab.id === activeId)
      if (t) init(projetId, t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, projetId])

  const handleCreated = useCallback(async (id: string) => {
    // Re-fetch tableaux from server
    const { getTableauxByProjet } = await import('@/actions/tableau-service')
    const fresh = await getTableauxByProjet(projetId)
    setTableaux(fresh as unknown as TableauServiceData[])
    setActiveId(id)
  }, [projetId])

  const handleDeleted = useCallback(async () => {
    const { getTableauxByProjet } = await import('@/actions/tableau-service')
    const fresh = await getTableauxByProjet(projetId)
    setTableaux(fresh as unknown as TableauServiceData[])
    if (fresh.length > 0) {
      setActiveId(fresh[0].id)
    } else {
      setActiveId(null)
    }
  }, [projetId])

  const activeTableau = tableaux.find((t) => t.id === activeId)

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <TableauTabs
        projetId={projetId}
        tableaux={tableaux}
        activeId={activeId}
        onSelect={setActiveId}
        onAdd={() => setShowCreate(true)}
        onDeleted={handleDeleted}
      />

      {/* Content */}
      {activeId && activeTableau ? (
        <>
          {/* Tableau metadata bar */}
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border-b border-[#ECEFF1] text-[12px] text-slate-500">
            <span>
              <strong>Semaine {activeTableau.semaine}</strong> / {activeTableau.annee}
            </span>
            {activeTableau.entreprise && (
              <span>Entreprise : {activeTableau.entreprise}</span>
            )}
          </div>
          <TableauGrid
            exportPdfButton={
              <PdfDownloadButton
                titre={activeTableau.titre}
                entreprise={activeTableau.entreprise}
                semaine={activeTableau.semaine}
                annee={activeTableau.annee}
                projetNom={projetNom}
                colonnes={colonnes}
                lignes={lignes}
                cellules={cellules}
              />
            }
            personnelMap={personnelMap}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <p className="text-lg font-medium mb-1">Aucun tableau</p>
            <p className="text-sm mb-4">
              Cliquez sur &quot;+&quot; pour creer votre premier tableau de service.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1565C0] text-white text-sm font-medium rounded-md hover:bg-[#1565C0]/90 transition-colors"
            >
              Creer un tableau
            </button>
          </div>
        </div>
      )}

      {/* Create dialog */}
      <CreateTableauDialog
        projetId={projetId}
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />

    </div>
  )
}
