'use client'

import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  updateSituation,
  saveLignesSituation,
  prefillDepuisRapports,
  type SituationDetail,
} from '@/actions/situations'
import { formatMontant, formatNombreFR } from '@/lib/utils'
import { labelMois } from '@/lib/mois'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Import,
  PencilLine,
  Save,
} from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

interface Props {
  projetId: string
  projetName: string
  initialDetail: SituationDetail
}

function parseQuantiteInput(value: string): number {
  const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function getAvancementStyle(avancement: number): string {
  if (avancement >= 100) return 'bg-[#E8EFDA] text-[#5E8019]'
  if (avancement >= 50) return 'bg-[#FFF7D1] text-[#DD9412]'
  return 'bg-[#FDEAED] text-[#E20025]'
}

export function SituationEditor({ projetId, projetName, initialDetail }: Props) {
  const router = useRouter()
  const detail = initialDetail

  const [statut, setStatut] = useState(detail.statut)
  const [libelle, setLibelle] = useState(detail.libelle || '')
  const [quantites, setQuantites] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const l of detail.lignes) {
      if (l.quantite !== 0) init[l.ligneDEId] = String(l.quantite)
    }
    return init
  })
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [prefilling, setPrefilling] = useState(false)

  const dirtyLignes = useRef<Set<string>>(new Set())
  const saveTimeout = useRef<NodeJS.Timeout>()
  const libelleTimeout = useRef<NodeJS.Timeout>()

  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  const estValidee = statut === 'validee'

  const flushSave = useCallback(async () => {
    if (dirtyLignes.current.size === 0) return
    const lignes = Array.from(dirtyLignes.current).map((ligneDEId) => ({
      ligneDEId,
      quantite: parseQuantiteInput(quantites[ligneDEId] ?? ''),
    }))
    dirtyLignes.current.clear()
    setSaveState('saving')
    const res = await saveLignesSituation(projetId, {
      situationId: detail.id,
      lignes,
    })
    if (res.success) {
      setSaveState('saved')
      setError(null)
    } else {
      setSaveState('error')
      setError(res.error)
    }
  }, [projetId, detail.id, quantites])

  // Sauvegarde différée à chaque modification
  useEffect(() => {
    if (dirtyLignes.current.size === 0) return
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(flushSave, 600)
    return () => clearTimeout(saveTimeout.current)
  }, [quantites, flushSave])

  // Ctrl+S force la sauvegarde
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        clearTimeout(saveTimeout.current)
        flushSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flushSave])

  function handleQuantiteChange(ligneDEId: string, value: string) {
    dirtyLignes.current.add(ligneDEId)
    setQuantites((prev) => ({ ...prev, [ligneDEId]: value }))
  }

  function handleLibelleChange(value: string) {
    setLibelle(value)
    clearTimeout(libelleTimeout.current)
    libelleTimeout.current = setTimeout(async () => {
      await updateSituation(projetId, { id: detail.id, libelle: value.trim() || null })
    }, 600)
  }

  async function handleStatut(nouveau: 'brouillon' | 'validee') {
    if (nouveau === 'validee') {
      clearTimeout(saveTimeout.current)
      await flushSave()
      if (!confirm(`Valider la situation n°${detail.numero} ? Elle passera en lecture seule.`))
        return
    }
    const res = await updateSituation(projetId, { id: detail.id, statut: nouveau })
    if (res.success) {
      setStatut(nouveau)
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  async function handlePrefill() {
    if (
      !confirm(
        `Pré-remplir les quantités depuis les rapports journaliers de ${labelMois(
          detail.mois,
          detail.annee
        )} ? Les quantités saisies seront remplacées pour les postes concernés.`
      )
    )
      return
    setPrefilling(true)
    const res = await prefillDepuisRapports(projetId, detail.id)
    setPrefilling(false)
    if (res.success) {
      if (res.data.lignes.length === 0) {
        alert('Aucun rapport journalier avec des quantités sur ce mois.')
        return
      }
      setQuantites((prev) => {
        const next = { ...prev }
        for (const l of res.data.lignes) {
          next[l.ligneDEId] = String(l.quantite)
          dirtyLignes.current.add(l.ligneDEId)
        }
        return next
      })
    } else {
      alert(res.error)
    }
  }

  const calculs = useMemo(() => {
    let totalSituation = 0
    let totalAnterieur = 0
    let totalMarche = 0
    const lignes = detail.lignes.map((l) => {
      const quantite = parseQuantiteInput(quantites[l.ligneDEId] ?? '')
      const montantSituation = quantite * l.prixUnitaire
      const quantiteCumulee = l.quantiteAnterieure + quantite
      const montantCumule = l.montantAnterieur + montantSituation
      const avancement =
        l.quantiteMarche > 0 ? (quantiteCumulee / l.quantiteMarche) * 100 : 0
      totalSituation += montantSituation
      totalAnterieur += l.montantAnterieur
      totalMarche += l.quantiteMarche * l.prixUnitaire
      return { ...l, quantite, montantSituation, quantiteCumulee, montantCumule, avancement }
    })
    const totalCumule = totalAnterieur + totalSituation
    return {
      lignes,
      totalSituation,
      totalAnterieur,
      totalCumule,
      totalMarche,
      avancementGlobal: totalMarche > 0 ? (totalCumule / totalMarche) * 100 : 0,
    }
  }, [detail.lignes, quantites])

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/projets/${projetId}/suivi/situations`}
              className="text-[#5A5A5A] hover:text-[#004489]"
              title="Retour aux situations"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h2 className="text-xl font-bold text-[#004489]">
              Situation n°{detail.numero} — {labelMois(detail.mois, detail.annee)}
            </h2>
            {estValidee ? (
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8EFDA] text-[#5E8019]">
                Validée
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF7D1] text-[#DD9412]">
                Brouillon
              </span>
            )}
          </div>
          <div className="mt-2 ml-8">
            <Input
              value={libelle}
              onChange={(e) => handleLibelleChange(e.target.value)}
              placeholder="Libellé de la situation (optionnel)"
              disabled={estValidee}
              className="w-80 h-8 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!estValidee && (
            <>
              <Button
                onClick={handlePrefill}
                disabled={prefilling}
                className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
              >
                <Import className="h-4 w-4 mr-1" />
                {prefilling ? 'Import...' : 'Pré-remplir depuis les rapports'}
              </Button>
              <Button
                onClick={() => {
                  clearTimeout(saveTimeout.current)
                  flushSave()
                }}
                className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
              >
                <Save className="h-4 w-4 mr-1" />
                Enregistrer
              </Button>
              <Button
                onClick={() => handleStatut('validee')}
                className="bg-[#004489] hover:bg-[#003370] text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Valider la situation
              </Button>
            </>
          )}
          {estValidee && (
            <Button
              onClick={() => handleStatut('brouillon')}
              className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
            >
              <PencilLine className="h-4 w-4 mr-1" />
              Repasser en brouillon
            </Button>
          )}
          <Button
            onClick={() =>
              exportAvecGuard(async () => {
                const { genererSituationPDF } = await import('./SituationPDFDownload')
                await genererSituationPDF(
                  projetName,
                  {
                    numero: detail.numero,
                    libelle: libelle || null,
                    annee: detail.annee,
                    mois: detail.mois,
                    statut,
                  },
                  calculs,
                  userLogo ?? undefined,
                  nomSociete ?? undefined
                )
              })
            }
            disabled={isExporting}
            className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
          >
            <FileText className="h-4 w-4 mr-1" />
            {isExporting ? 'Génération...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Indicateur de sauvegarde */}
      <div className="flex items-center gap-3 text-xs text-[#5A5A5A]">
        {!estValidee && (
          <span>
            {saveState === 'saving' && 'Enregistrement...'}
            {saveState === 'saved' && 'Modifications enregistrées'}
            {saveState === 'error' && (
              <span className="text-[#E20025]">{error || 'Erreur de sauvegarde'}</span>
            )}
            {saveState === 'idle' && 'Saisie enregistrée automatiquement (Ctrl+S pour forcer)'}
          </span>
        )}
        {estValidee && <span>Situation validée — lecture seule</span>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold text-[12px]">
              <th className="px-2 py-2 text-left">N° prix</th>
              <th className="px-2 py-2 text-left">Intitulé</th>
              <th className="px-2 py-2 text-center">Unité</th>
              <th className="px-2 py-2 text-right">PU HT</th>
              <th className="px-2 py-2 text-right">Qté marché</th>
              <th className="px-2 py-2 text-right">Qté cumul antérieur</th>
              <th className="px-2 py-2 text-right bg-[#003370] min-w-24">Qté situation</th>
              <th className="px-2 py-2 text-right">Montant situation</th>
              <th className="px-2 py-2 text-right">Qté cumulée</th>
              <th className="px-2 py-2 text-right">Avancement %</th>
            </tr>
          </thead>
          <tbody>
            {calculs.lignes.map((l, i) => (
              <tr
                key={l.ligneDEId}
                className={`border-b border-[#DCDCDC] ${
                  i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                }`}
              >
                <td className="px-2 py-1.5 font-mono text-[12px]">{l.code}</td>
                <td className="px-2 py-1.5 text-[12px]">{l.designation}</td>
                <td className="px-2 py-1.5 text-center text-[12px]">{l.unite}</td>
                <td className="px-2 py-1.5 text-right text-[12px]">
                  {formatMontant(l.prixUnitaire)}
                </td>
                <td className="px-2 py-1.5 text-right text-[12px]">
                  {formatNombreFR(l.quantiteMarche)}
                </td>
                <td className="px-2 py-1.5 text-right text-[12px] text-[#5A5A5A]">
                  {formatNombreFR(l.quantiteAnterieure)}
                </td>
                <td className="px-1 py-1 bg-[#E5EFF8]">
                  <input
                    inputMode="decimal"
                    value={quantites[l.ligneDEId] ?? ''}
                    onChange={(e) => handleQuantiteChange(l.ligneDEId, e.target.value)}
                    placeholder="—"
                    disabled={estValidee}
                    className="w-full text-right text-[12px] px-1.5 py-1 rounded border border-transparent bg-transparent hover:border-[#DCDCDC] focus:border-[#004489] focus:bg-white focus:outline-none disabled:text-[#5A5A5A]"
                  />
                </td>
                <td className="px-2 py-1.5 text-right text-[12px] font-medium">
                  {formatMontant(l.montantSituation)}
                </td>
                <td className="px-2 py-1.5 text-right text-[12px]">
                  {formatNombreFR(l.quantiteCumulee)}
                </td>
                <td
                  className={`px-2 py-1.5 text-right font-semibold text-[12px] ${getAvancementStyle(
                    l.avancement
                  )}`}
                >
                  {formatNombreFR(l.avancement, 1)} %
                </td>
              </tr>
            ))}
            {calculs.lignes.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-gray-400">
                  Aucune ligne dans le Détail Estimatif — renseignez d&apos;abord le Détail
                  Estimatif du projet
                </td>
              </tr>
            )}
          </tbody>
          {calculs.lignes.length > 0 && (
            <tfoot>
              <tr className="bg-[#003370] font-bold text-white text-[12px]">
                <td colSpan={6} className="px-2 py-3 text-right">
                  TOTAUX HT :
                </td>
                <td className="px-2 py-3 text-right text-[11px]">
                  Antérieur : {formatMontant(calculs.totalAnterieur)}
                </td>
                <td className="px-2 py-3 text-right text-[13px]">
                  {formatMontant(calculs.totalSituation)}
                </td>
                <td className="px-2 py-3 text-right text-[11px]">
                  Cumul : {formatMontant(calculs.totalCumule)}
                </td>
                <td className="px-2 py-3 text-right">
                  {formatNombreFR(calculs.avancementGlobal, 1)} %
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
