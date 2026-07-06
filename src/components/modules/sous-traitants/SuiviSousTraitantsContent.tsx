'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  upsertFacturation,
  type SousTraitantComplet,
  type SousTraitantsData,
} from '@/actions/sous-traitants'
import { formatMontant, formatNombreFR } from '@/lib/utils'
import { labelMoisCourt } from '@/lib/mois'
import { moisPresents, nouveauMontantMarche } from './calculs'
import { CalendarPlus, FileText } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

interface Props {
  projetId: string
  projetName: string
  initialData: SousTraitantsData
}

interface MoisCle {
  annee: number
  mois: number
}

function cleCellule(stId: string, m: MoisCle): string {
  return `${stId}|${m.annee}-${m.mois}`
}

function parseMontantInput(value: string): number {
  const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function getAvancementStyle(avancement: number): string {
  if (avancement >= 100) return 'bg-[#E8EFDA] text-[#5E8019]'
  if (avancement >= 50) return 'bg-[#FFF7D1] text-[#DD9412]'
  return 'bg-[#FDEAED] text-[#E20025]'
}

export function SuiviSousTraitantsContent({ projetId, projetName, initialData }: Props) {
  const { sousTraitants, montantMarcheTotal } = initialData

  const [montants, setMontants] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const st of sousTraitants) {
      for (const f of st.facturations) {
        init[cleCellule(st.id, f)] = String(f.montant)
      }
    }
    return init
  })
  const [moisAjoutes, setMoisAjoutes] = useState<MoisCle[]>([])
  const [nouveauMois, setNouveauMois] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  const colonnes = useMemo<MoisCle[]>(() => {
    const set = new Map<string, MoisCle>()
    for (const m of [...moisPresents(sousTraitants), ...moisAjoutes]) {
      set.set(`${m.annee}-${m.mois}`, m)
    }
    return Array.from(set.values()).sort(
      (a, b) => a.annee - b.annee || a.mois - b.mois
    )
  }, [sousTraitants, moisAjoutes])

  function montantCellule(stId: string, m: MoisCle): number {
    return parseMontantInput(montants[cleCellule(stId, m)] ?? '')
  }

  function cumulST(st: SousTraitantComplet): number {
    return colonnes.reduce((sum, m) => sum + montantCellule(st.id, m), 0)
  }

  function handleChange(st: SousTraitantComplet, m: MoisCle, value: string) {
    const cle = cleCellule(st.id, m)
    setMontants((prev) => ({ ...prev, [cle]: value }))

    const timeouts = saveTimeouts.current
    clearTimeout(timeouts.get(cle))
    timeouts.set(
      cle,
      setTimeout(async () => {
        const res = await upsertFacturation(projetId, {
          sousTraitantId: st.id,
          annee: m.annee,
          mois: m.mois,
          montant: parseMontantInput(value),
        })
        setSaveError(res.success ? null : res.error)
      }, 500)
    )
  }

  function handleAjouterMois() {
    if (!nouveauMois) return
    const [annee, mois] = nouveauMois.split('-').map(Number)
    if (!annee || !mois) return
    setMoisAjoutes((prev) =>
      prev.some((m) => m.annee === annee && m.mois === mois)
        ? prev
        : [...prev, { annee, mois }]
    )
    setNouveauMois('')
  }

  const totaux = useMemo(() => {
    const parMois = colonnes.map((m) =>
      sousTraitants.reduce((sum, st) => sum + montantCellule(st.id, m), 0)
    )
    const cumulTotal = sousTraitants.reduce((sum, st) => sum + cumulST(st), 0)
    const marcheTotal = sousTraitants.reduce((sum, st) => sum + nouveauMontantMarche(st), 0)
    return { parMois, cumulTotal, marcheTotal, reste: marcheTotal - cumulTotal }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colonnes, sousTraitants, montants])

  if (sousTraitants.length === 0) {
    return (
      <div className="rounded-lg border border-[#DCDCDC] bg-white p-8 text-center text-gray-400">
        Aucun sous-traitant sur ce projet.{' '}
        <Link
          href={`/projets/${projetId}/sous-traitants`}
          className="text-[#004489] underline font-medium"
        >
          Créer les sous-traitants dans le poste contractuel
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={nouveauMois}
            onChange={(e) => setNouveauMois(e.target.value)}
            className="w-44"
          />
          <Button
            onClick={handleAjouterMois}
            disabled={!nouveauMois}
            className="bg-[#004489] hover:bg-[#003370] text-white"
          >
            <CalendarPlus className="h-4 w-4 mr-1" />
            Ajouter un mois
          </Button>
        </div>
        <Button
          onClick={() =>
            exportAvecGuard(async () => {
              const { genererSousTraitantsPDF } = await import('./SousTraitantsPDFDownload')
              await genererSousTraitantsPDF(
                projetName,
                initialData,
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
        <p className="text-xs text-[#5A5A5A]">
          Saisie enregistrée automatiquement — montants HT acceptés par mois
        </p>
      </div>

      {saveError && (
        <div className="bg-[#FDEAED] border border-[#E20025] text-[#E20025] px-4 py-2 rounded text-sm">
          {saveError}
        </div>
      )}

      {/* Grille de facturation */}
      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold text-[12px]">
              <th className="px-2 py-2 text-left sticky left-0 bg-[#004489] min-w-40">
                Sous-traitant
              </th>
              <th className="px-2 py-2 text-right">Nouveau montant marché</th>
              {colonnes.map((m) => (
                <th key={`${m.annee}-${m.mois}`} className="px-2 py-2 text-right min-w-28">
                  {labelMoisCourt(m.mois, m.annee)}
                </th>
              ))}
              <th className="px-2 py-2 text-right">Cumul facturé</th>
              <th className="px-2 py-2 text-right">Avancement %</th>
              <th className="px-2 py-2 text-right">Reste à facturer</th>
            </tr>
          </thead>
          <tbody>
            {sousTraitants.map((st, i) => {
              const nouveau = nouveauMontantMarche(st)
              const cumul = cumulST(st)
              const avancement = nouveau > 0 ? (cumul / nouveau) * 100 : 0
              return (
                <tr
                  key={st.id}
                  className={`border-b border-[#DCDCDC] ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                  }`}
                >
                  <td
                    className={`px-2 py-1.5 font-medium sticky left-0 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                    }`}
                  >
                    {st.nom}
                  </td>
                  <td className="px-2 py-1.5 text-right">{formatMontant(nouveau)}</td>
                  {colonnes.map((m) => {
                    const cle = cleCellule(st.id, m)
                    return (
                      <td key={cle} className="px-1 py-1">
                        <input
                          inputMode="decimal"
                          value={montants[cle] ?? ''}
                          onChange={(e) => handleChange(st, m, e.target.value)}
                          placeholder="—"
                          className="w-full text-right text-[12px] px-1.5 py-1 rounded border border-transparent bg-transparent hover:border-[#DCDCDC] focus:border-[#004489] focus:bg-white focus:outline-none"
                        />
                      </td>
                    )
                  })}
                  <td className="px-2 py-1.5 text-right font-semibold">
                    {formatMontant(cumul)}
                  </td>
                  <td
                    className={`px-2 py-1.5 text-right font-semibold ${getAvancementStyle(
                      avancement
                    )}`}
                  >
                    {formatNombreFR(avancement, 1)} %
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {formatMontant(nouveau - cumul)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-[#003370] font-bold text-white text-[12px]">
              <td className="px-2 py-3 sticky left-0 bg-[#003370]">TOTAL S/T</td>
              <td className="px-2 py-3 text-right">{formatMontant(totaux.marcheTotal)}</td>
              {totaux.parMois.map((t, i) => (
                <td key={i} className="px-2 py-3 text-right">
                  {formatMontant(t)}
                </td>
              ))}
              <td className="px-2 py-3 text-right">{formatMontant(totaux.cumulTotal)}</td>
              <td className="px-2 py-3 text-right">
                {totaux.marcheTotal > 0
                  ? `${formatNombreFR((totaux.cumulTotal / totaux.marcheTotal) * 100, 1)} %`
                  : '—'}
              </td>
              <td className="px-2 py-3 text-right">{formatMontant(totaux.reste)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Synthèse part mandataire */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#DCDCDC] bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A]">
            Montant marché (Détail Estimatif)
          </p>
          <p className="text-lg font-bold">{formatMontant(montantMarcheTotal)}</p>
        </div>
        <div className="rounded-lg border border-[#DCDCDC] bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A]">
            Cumul marchés sous-traités
          </p>
          <p className="text-lg font-bold">{formatMontant(totaux.marcheTotal)}</p>
        </div>
        <div className="rounded-lg border border-[#004489] bg-[#E5EFF8] p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A]">Part mandataire</p>
          <p className="text-lg font-bold text-[#003370]">
            {formatMontant(montantMarcheTotal - totaux.marcheTotal)}
          </p>
        </div>
        <div className="rounded-lg border border-[#DCDCDC] bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A]">
            Reste à facturer S/T
          </p>
          <p className="text-lg font-bold">{formatMontant(totaux.reste)}</p>
        </div>
      </div>
    </div>
  )
}
