'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createCoTraitant,
  updateCoTraitant,
  deleteCoTraitant,
  saveRepartitionLigne,
  type CoTraitanceData,
} from '@/actions/cotraitance'
import { formatMontant, formatNombreFR } from '@/lib/utils'
import { ArrowLeft, Plus, Trash2, Crown } from 'lucide-react'

interface Props {
  projetId: string
  projetName: string
  initialData: CoTraitanceData
}

function parsePU(value: string | undefined): number {
  if (!value || !value.trim()) return 0
  const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function RepartitionCotraitance({ projetId, projetName, initialData }: Props) {
  const router = useRouter()
  const { coTraitants, lignes } = initialData

  // valeurs éditées : cle `${ligneId}|${ctId}` → string
  const [valeurs, setValeurs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const l of lignes) {
      for (const [ctId, pu] of Object.entries(l.repartition)) {
        if (pu !== 0) init[`${l.id}|${ctId}`] = String(pu)
      }
    }
    return init
  })
  const [nouveauNom, setNouveauNom] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const valeursRef = useRef(valeurs)

  function handleCellule(ligneId: string, ctId: string, value: string) {
    const next = { ...valeursRef.current, [`${ligneId}|${ctId}`]: value }
    valeursRef.current = next
    setValeurs(next)
    const timeouts = saveTimeouts.current
    clearTimeout(timeouts.get(ligneId))
    timeouts.set(
      ligneId,
      setTimeout(async () => {
        setSaveState('saving')
        const rep: Record<string, number> = {}
        for (const ct of coTraitants) {
          const v = parsePU(valeursRef.current[`${ligneId}|${ct.id}`])
          if (v !== 0) rep[ct.id] = v
        }
        const res = await saveRepartitionLigne(projetId, {
          ligneDEId: ligneId,
          repartition: rep,
        })
        setSaveState(res.success ? 'saved' : 'error')
      }, 600)
    )
  }

  async function handleAjouterCoTraitant() {
    if (!nouveauNom.trim()) return
    const res = await createCoTraitant(projetId, {
      nom: nouveauNom.trim(),
      estMandataire: coTraitants.length === 0,
    })
    if (res.success) {
      setNouveauNom('')
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  async function handleMandataire(ctId: string) {
    for (const ct of coTraitants) {
      await updateCoTraitant(projetId, { id: ct.id, estMandataire: ct.id === ctId })
    }
    router.refresh()
  }

  async function handleSupprimer(ctId: string) {
    const ct = coTraitants.find((c) => c.id === ctId)
    if (!confirm(`Supprimer le co-traitant « ${ct?.nom} » et sa répartition ?`)) return
    const res = await deleteCoTraitant(projetId, ctId)
    if (res.success) router.refresh()
    else alert(res.error)
  }

  const totaux = useMemo(() => {
    const parCT: Record<string, number> = {}
    for (const ct of coTraitants) parCT[ct.id] = 0
    let totalMarche = 0
    for (const l of lignes) {
      if (l.estChapitre) continue
      totalMarche += l.quantite * l.prixUnitaire
      for (const ct of coTraitants) {
        parCT[ct.id] += l.quantite * parsePU(valeurs[`${l.id}|${ct.id}`])
      }
    }
    const totalReparti = Object.values(parCT).reduce((s, v) => s + v, 0)
    return { parCT, totalMarche, totalReparti }
  }, [lignes, coTraitants, valeurs])

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href={`/projets/${projetId}/detail-estimatif`}
          className="text-[#5A5A5A] hover:text-[#004489]"
          title="Retour au Détail Estimatif"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#004489]">
            Co-traitance — Répartition des prix
          </h2>
          <p className="text-sm text-gray-500">
            PU par co-traitant pour chaque ligne du Détail Estimatif (0 ou vide = pas de
            part) — {projetName}
          </p>
        </div>
      </div>

      {/* Gestion des co-traitants */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Input
            value={nouveauNom}
            onChange={(e) => setNouveauNom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAjouterCoTraitant()}
            placeholder="Nom du co-traitant (ex : ETF CAT)"
            className="w-64"
          />
          <Button
            onClick={handleAjouterCoTraitant}
            disabled={!nouveauNom.trim()}
            className="bg-[#004489] hover:bg-[#003370] text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
        <span className="text-xs text-[#5A5A5A]">
          {saveState === 'saving' && 'Enregistrement...'}
          {saveState === 'saved' && 'Modifications enregistrées'}
          {saveState === 'error' && <span className="text-[#E20025]">Erreur de sauvegarde</span>}
          {saveState === 'idle' && coTraitants.length > 0 && 'Saisie enregistrée automatiquement'}
        </span>
      </div>

      {coTraitants.length === 0 ? (
        <div className="rounded-lg border border-[#DCDCDC] bg-white p-8 text-center text-gray-400">
          Aucun co-traitant — ajoutez les membres du groupement pour répartir les prix
        </div>
      ) : (
        <>
          {/* Grille de répartition */}
          <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-[#004489] text-white font-bold text-[12px]">
                  <th className="px-2 py-2 text-left w-24 sticky left-0 bg-[#004489] z-10">
                    N° prix
                  </th>
                  <th className="px-2 py-2 text-left min-w-52">Intitulé</th>
                  <th className="px-2 py-2 text-center">Unité</th>
                  <th className="px-2 py-2 text-right">Qté</th>
                  <th className="px-2 py-2 text-right">PU marché</th>
                  {coTraitants.map((ct) => (
                    <th key={ct.id} className="px-1 py-1.5 text-right min-w-32">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleMandataire(ct.id)}
                          className={`p-0.5 rounded ${
                            ct.estMandataire ? 'text-[#F2AB1B]' : 'text-white/40 hover:text-white'
                          }`}
                          title={ct.estMandataire ? 'Mandataire' : 'Définir mandataire'}
                        >
                          <Crown className="h-3.5 w-3.5" />
                        </button>
                        <span>PU {ct.nom}</span>
                        <button
                          onClick={() => handleSupprimer(ct.id)}
                          className="p-0.5 rounded text-white/50 hover:text-white hover:bg-[#003370]"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-right">Σ répartition</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, i) => {
                  if (l.estChapitre) {
                    const profondeur = (l.code.match(/\./g) || []).length
                    return (
                      <tr key={l.id} className="border-b border-[#DCDCDC] bg-[#E5EFF8]">
                        <td className="px-2 py-1.5 font-mono text-[12px] font-bold text-[#003370] sticky left-0 bg-[#E5EFF8]">
                          {l.code}
                        </td>
                        <td
                          colSpan={5 + coTraitants.length}
                          className="px-2 py-1.5 text-[12px] font-bold text-[#003370]"
                          style={{ paddingLeft: 8 + profondeur * 14 }}
                        >
                          {l.designation}
                        </td>
                      </tr>
                    )
                  }
                  const sigma = coTraitants.reduce(
                    (s, ct) => s + parsePU(valeurs[`${l.id}|${ct.id}`]),
                    0
                  )
                  const ecart = Math.abs(sigma - l.prixUnitaire) > 0.005
                  return (
                    <tr
                      key={l.id}
                      className={`border-b border-[#DCDCDC] ${
                        i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                      }`}
                    >
                      <td
                        className={`px-2 py-1 font-mono text-[12px] sticky left-0 ${
                          i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                        }`}
                      >
                        {l.code}
                      </td>
                      <td className="px-2 py-1 text-[12px]">{l.designation}</td>
                      <td className="px-2 py-1 text-center text-[12px]">{l.unite}</td>
                      <td className="px-2 py-1 text-right text-[12px]">
                        {formatNombreFR(l.quantite, 3)}
                      </td>
                      <td className="px-2 py-1 text-right text-[12px] font-medium">
                        {formatNombreFR(l.prixUnitaire, 2)}
                      </td>
                      {coTraitants.map((ct) => (
                        <td key={ct.id} className="px-1 py-0.5 bg-[#E5EFF8]/40">
                          <input
                            inputMode="decimal"
                            value={valeurs[`${l.id}|${ct.id}`] ?? ''}
                            onChange={(e) => handleCellule(l.id, ct.id, e.target.value)}
                            placeholder="0"
                            className="w-full text-right text-[12px] px-1.5 py-1 rounded border border-transparent bg-transparent hover:border-[#DCDCDC] focus:border-[#004489] focus:bg-white focus:outline-none"
                          />
                        </td>
                      ))}
                      <td
                        className={`px-2 py-1 text-right text-[12px] font-semibold ${
                          ecart ? 'bg-[#FDEAED] text-[#E20025]' : 'text-[#5E8019]'
                        }`}
                        title={
                          ecart
                            ? `Écart avec le PU marché : ${formatNombreFR(sigma - l.prixUnitaire, 2)}`
                            : 'Répartition conforme au PU marché'
                        }
                      >
                        {formatNombreFR(sigma, 2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[#003370] font-bold text-white text-[12px]">
                  <td colSpan={4} className="px-2 py-3 text-right sticky left-0 bg-[#003370]">
                    TOTAL MARCHÉ (qté × PU) :
                  </td>
                  <td className="px-2 py-3 text-right">{formatMontant(totaux.totalMarche)}</td>
                  {coTraitants.map((ct) => (
                    <td key={ct.id} className="px-2 py-3 text-right">
                      {formatMontant(totaux.parCT[ct.id] ?? 0)}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-right">{formatMontant(totaux.totalReparti)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Synthèse par co-traitant */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {coTraitants.map((ct) => (
              <div
                key={ct.id}
                className={`rounded-lg border p-3 ${
                  ct.estMandataire ? 'border-[#004489] bg-[#E5EFF8]' : 'border-[#DCDCDC] bg-white'
                }`}
              >
                <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A]">
                  {ct.nom} {ct.estMandataire && '(mandataire)'}
                </p>
                <p className="text-lg font-bold">
                  {formatMontant(totaux.parCT[ct.id] ?? 0)}
                </p>
                <p className="text-[11px] text-[#5A5A5A]">
                  {totaux.totalMarche > 0
                    ? `${formatNombreFR(((totaux.parCT[ct.id] ?? 0) / totaux.totalMarche) * 100, 1)} % du marché`
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
