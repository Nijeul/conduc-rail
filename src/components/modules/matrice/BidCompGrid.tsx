'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  saveBidComp,
  updateMatrice,
  addFournisseur,
  removeFournisseur,
  updateFournisseur,
} from '@/actions/matrice'
import {
  bidCompParDefaut,
  estBidCompValide,
  parseMontantCellule,
  totauxBidComp,
  type BidCompData,
} from '@/lib/matrice-bidcomp'
import { formatMontant } from '@/lib/utils'
import { Plus, Trash2, FileText, UserPlus } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'

interface FournisseurLite {
  id: string
  nom: string
  decision: string
}

interface MatriceInfos {
  id: string
  titre: string
  acheteur: string | null
  site: string | null
  familleAchats: string | null
  budgetTheorique: number | null
  devise: string
}

interface Props {
  projetId: string
  projetName: string
  matrice: MatriceInfos
  fournisseurs: FournisseurLite[]
  bidCompInitial: unknown
}

const MAX_FOURNISSEURS = 5

const DECISION_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  go: { label: 'GO', bg: '#E8EFDA', text: '#5E8019' },
  no_go: { label: 'NO GO', bg: '#FDEAED', text: '#E20025' },
  en_attente: { label: 'En attente', bg: '#FFF7D1', text: '#DD9412' },
}

function parseBudgetInput(value: string): number | null {
  if (!value.trim()) return null
  const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? null : n
}

export function BidCompGrid({
  projetId,
  projetName,
  matrice,
  fournisseurs: fournisseursInitiaux,
  bidCompInitial,
}: Props) {
  const router = useRouter()
  const [data, setData] = useState<BidCompData>(() =>
    estBidCompValide(bidCompInitial) ? (bidCompInitial as BidCompData) : bidCompParDefaut()
  )
  const [fournisseurs, setFournisseurs] = useState<FournisseurLite[]>(fournisseursInitiaux)
  const [entete, setEntete] = useState({
    acheteur: matrice.acheteur || '',
    site: matrice.site || '',
    familleAchats: matrice.familleAchats || '',
    budgetTheorique: matrice.budgetTheorique != null ? String(matrice.budgetTheorique) : '',
  })
  const [budgetLocal, setBudgetLocal] = useState<number | null>(matrice.budgetTheorique)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [ajoutEnCours, setAjoutEnCours] = useState(false)

  const dirty = useRef(false)
  const saveTimeout = useRef<NodeJS.Timeout>()
  const enteteTimeout = useRef<NodeJS.Timeout>()

  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  const flushSave = useCallback(
    async (payload: BidCompData) => {
      setSaveState('saving')
      const res = await saveBidComp(projetId, matrice.id, payload)
      setSaveState(res.success ? 'saved' : 'error')
    },
    [projetId, matrice.id]
  )

  // Auto-save de la grille (800 ms après la dernière frappe)
  useEffect(() => {
    if (!dirty.current) return
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      dirty.current = false
      flushSave(data)
    }, 800)
    return () => clearTimeout(saveTimeout.current)
  }, [data, flushSave])

  function mutate(updater: (d: BidCompData) => BidCompData) {
    dirty.current = true
    setData((prev) => updater(structuredClone(prev)))
  }

  function setCellule(sectionId: string, ligneId: string, fid: string, valeur: string) {
    mutate((d) => {
      const l = d.sections.find((s) => s.id === sectionId)?.lignes.find((x) => x.id === ligneId)
      if (l) l.valeurs[fid] = valeur
      return d
    })
  }

  function setBesoin(sectionId: string, ligneId: string, valeur: string) {
    mutate((d) => {
      const l = d.sections.find((s) => s.id === sectionId)?.lignes.find((x) => x.id === ligneId)
      if (l) l.besoin = valeur
      return d
    })
  }

  function setLibelle(sectionId: string, ligneId: string, valeur: string) {
    mutate((d) => {
      const l = d.sections.find((s) => s.id === sectionId)?.lignes.find((x) => x.id === ligneId)
      if (l) l.libelle = valeur
      return d
    })
  }

  function ajouterLigne(sectionId: string) {
    mutate((d) => {
      const s = d.sections.find((x) => x.id === sectionId)
      if (s) {
        s.lignes.push({
          id: crypto.randomUUID(),
          libelle: '',
          besoin: '',
          valeurs: {},
        })
      }
      return d
    })
  }

  function supprimerLigne(sectionId: string, ligneId: string) {
    mutate((d) => {
      const s = d.sections.find((x) => x.id === sectionId)
      if (s) s.lignes = s.lignes.filter((l) => l.id !== ligneId)
      return d
    })
  }

  function setChampTexte(
    champ: 'conclusions' | 'pourquoiPasTroisFournisseurs' | 'signatureSourcing' | 'signatureProjet',
    valeur: string
  ) {
    mutate((d) => {
      d[champ] = valeur
      return d
    })
  }

  // En-tête matrice (acheteur, site, famille, budget) — auto-save
  function handleEnteteChange(champ: keyof typeof entete, valeur: string) {
    const next = { ...entete, [champ]: valeur }
    setEntete(next)
    if (champ === 'budgetTheorique') setBudgetLocal(parseBudgetInput(valeur))
    clearTimeout(enteteTimeout.current)
    enteteTimeout.current = setTimeout(async () => {
      await updateMatrice(projetId, matrice.id, {
        acheteur: next.acheteur.trim() || null,
        site: next.site.trim() || null,
        familleAchats: next.familleAchats.trim() || null,
        budgetTheorique: parseBudgetInput(next.budgetTheorique),
      })
    }, 800)
  }

  async function handleAjouterFournisseur() {
    if (fournisseurs.length >= MAX_FOURNISSEURS) return
    setAjoutEnCours(true)
    const res = await addFournisseur(projetId, matrice.id, {
      nom: `Fournisseur ${fournisseurs.length + 1}`,
      rang: fournisseurs.length + 1,
    })
    setAjoutEnCours(false)
    if (res.success) {
      setFournisseurs([
        ...fournisseurs,
        { id: res.data.id, nom: `Fournisseur ${fournisseurs.length + 1}`, decision: 'en_attente' },
      ])
    } else {
      alert(res.error)
    }
  }

  function handleNomFournisseur(fid: string, nom: string) {
    setFournisseurs((prev) => prev.map((f) => (f.id === fid ? { ...f, nom } : f)))
  }

  async function handleNomFournisseurBlur(fid: string) {
    const f = fournisseurs.find((x) => x.id === fid)
    if (!f || !f.nom.trim()) return
    await updateFournisseur(projetId, fid, { nom: f.nom.trim() })
  }

  async function handleDecision(fid: string, decision: string) {
    setFournisseurs((prev) => prev.map((f) => (f.id === fid ? { ...f, decision } : f)))
    const couleurDecision =
      decision === 'go' ? 'vert' : decision === 'no_go' ? 'rouge' : 'jaune'
    await updateFournisseur(projetId, fid, { decision, couleurDecision })
  }

  async function handleSupprimerFournisseur(fid: string) {
    const f = fournisseurs.find((x) => x.id === fid)
    if (!confirm(`Supprimer la colonne « ${f?.nom} » ?`)) return
    const res = await removeFournisseur(projetId, fid)
    if (res.success) {
      setFournisseurs((prev) => prev.filter((x) => x.id !== fid))
    } else {
      alert(res.error)
    }
  }

  const totaux = useMemo(
    () => totauxBidComp(data, fournisseurs.map((f) => f.id)),
    [data, fournisseurs]
  )

  const nbCols = 2 + fournisseurs.length

  return (
    <div className="space-y-4">
      {/* En-tête d'identification (comme le bloc du haut de l'Excel) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ChampEntete
          label="Acheteur"
          value={entete.acheteur}
          onChange={(v) => handleEnteteChange('acheteur', v)}
        />
        <ChampEntete
          label="Site"
          value={entete.site}
          onChange={(v) => handleEnteteChange('site', v)}
        />
        <ChampEntete
          label="Famille d'achats"
          value={entete.familleAchats}
          onChange={(v) => handleEnteteChange('familleAchats', v)}
        />
        <ChampEntete
          label="Budget théorique (€)"
          value={entete.budgetTheorique}
          onChange={(v) => handleEnteteChange('budgetTheorique', v)}
          inputMode="decimal"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={handleAjouterFournisseur}
          disabled={ajoutEnCours || fournisseurs.length >= MAX_FOURNISSEURS}
          className="bg-[#004489] hover:bg-[#003370] text-white"
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Ajouter un fournisseur ({fournisseurs.length}/{MAX_FOURNISSEURS})
        </Button>
        <Button
          onClick={() =>
            exportAvecGuard(async () => {
              const { genererBidCompPDF } = await import('./BidCompPDFDownload')
              await genererBidCompPDF(
                projetName,
                matrice.titre,
                {
                  acheteur: entete.acheteur,
                  site: entete.site,
                  familleAchats: entete.familleAchats,
                  budgetTheorique: budgetLocal,
                },
                data,
                fournisseurs,
                totaux,
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
        <span className="text-xs text-[#5A5A5A]">
          {saveState === 'saving' && 'Enregistrement...'}
          {saveState === 'saved' && 'Modifications enregistrées'}
          {saveState === 'error' && (
            <span className="text-[#E20025]">Erreur de sauvegarde</span>
          )}
          {saveState === 'idle' && 'Saisie enregistrée automatiquement'}
        </span>
      </div>

      {/* Grille */}
      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold text-[12px]">
              <th className="px-2 py-2 text-left min-w-56 sticky left-0 bg-[#004489] z-10">
                Critère
              </th>
              <th className="px-2 py-2 text-left min-w-40">Besoin</th>
              {fournisseurs.map((f) => (
                <th key={f.id} className="px-1 py-1.5 min-w-44">
                  <div className="flex items-center gap-1">
                    <input
                      value={f.nom}
                      onChange={(e) => handleNomFournisseur(f.id, e.target.value)}
                      onBlur={() => handleNomFournisseurBlur(f.id)}
                      className="w-full bg-transparent text-white font-bold text-[12px] px-1.5 py-1 rounded border border-transparent hover:border-[#0056B3] focus:border-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleSupprimerFournisseur(f.id)}
                      className="p-1 rounded hover:bg-[#003370] text-white/70 hover:text-white"
                      title="Supprimer ce fournisseur"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              {fournisseurs.length === 0 && (
                <th className="px-2 py-2 text-left font-normal italic">
                  Ajoutez un fournisseur pour commencer
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.sections.map((section) => (
              <SectionRows
                key={section.id}
                section={section}
                fournisseurs={fournisseurs}
                nbCols={nbCols}
                onCellule={setCellule}
                onBesoin={setBesoin}
                onLibelle={setLibelle}
                onAjouterLigne={ajouterLigne}
                onSupprimerLigne={supprimerLigne}
              />
            ))}

            {/* Total (€) */}
            <tr className="bg-[#003370] text-white font-bold">
              <td className="px-2 py-2.5 sticky left-0 bg-[#003370] z-10">Total (€)</td>
              <td className="px-2 py-2.5 text-right">
                {budgetLocal != null ? formatMontant(budgetLocal) : '—'}
              </td>
              {fournisseurs.map((f) => (
                <td key={f.id} className="px-2 py-2.5 text-right text-[13px]">
                  {formatMontant(totaux[f.id] ?? 0)}
                </td>
              ))}
            </tr>

            {/* Écart vs budget */}
            <tr className="bg-white border-b border-[#DCDCDC]">
              <td className="px-2 py-2 font-semibold sticky left-0 bg-white z-10">
                Écart vs budget (€)
              </td>
              <td className="px-2 py-2 text-[12px] text-[#5A5A5A]">
                négatif = économie
              </td>
              {fournisseurs.map((f) => {
                const ecart = budgetLocal != null ? (totaux[f.id] ?? 0) - budgetLocal : null
                return (
                  <td
                    key={f.id}
                    className={`px-2 py-2 text-right font-semibold ${
                      ecart == null
                        ? ''
                        : ecart <= 0
                          ? 'bg-[#E8EFDA] text-[#5E8019]'
                          : 'bg-[#FDEAED] text-[#E20025]'
                    }`}
                  >
                    {ecart != null ? formatMontant(ecart) : '—'}
                  </td>
                )
              })}
            </tr>

            {/* Décision */}
            <tr className="bg-[#F0F0F0] border-b border-[#DCDCDC]">
              <td className="px-2 py-2 font-semibold sticky left-0 bg-[#F0F0F0] z-10">
                Décision
              </td>
              <td className="px-2 py-2" />
              {fournisseurs.map((f) => {
                const st = DECISION_STYLES[f.decision] || DECISION_STYLES.en_attente
                return (
                  <td key={f.id} className="px-2 py-1.5">
                    <Select
                      value={f.decision}
                      onValueChange={(v) => handleDecision(f.id, v)}
                    >
                      <SelectTrigger
                        className="h-8 font-bold text-[12px] border"
                        style={{ backgroundColor: st.bg, color: st.text, borderColor: st.text }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="go">GO</SelectItem>
                        <SelectItem value="no_go">NO GO</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conclusions et signatures (bas de la feuille Excel) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="rounded-lg border border-[#DCDCDC] bg-white p-4">
          <p className="text-sm font-semibold text-[#004489] mb-2">
            Conclusions / Recommandations
          </p>
          <textarea
            value={data.conclusions}
            onChange={(e) => setChampTexte('conclusions', e.target.value)}
            rows={4}
            className="w-full text-sm border border-[#DCDCDC] rounded px-3 py-2 focus:border-[#004489] focus:outline-none resize-y"
            placeholder="Ex : FOURNISSEUR 2 RETENU — MEILLEURE OFFRE TECHNIQUE ET FINANCIÈRE"
          />
        </div>
        <div className="rounded-lg border border-[#DCDCDC] bg-white p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-[#004489] mb-2">
              Pourquoi moins de 3 fournisseurs consultés ?
            </p>
            <textarea
              value={data.pourquoiPasTroisFournisseurs}
              onChange={(e) => setChampTexte('pourquoiPasTroisFournisseurs', e.target.value)}
              rows={2}
              className="w-full text-sm border border-[#DCDCDC] rounded px-3 py-2 focus:border-[#004489] focus:outline-none resize-y"
              placeholder="Ex : 4 fournisseurs consultés — 2 retours — 1 offre validée"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-[#5A5A5A] mb-1">
                Signature Sourcing
              </p>
              <Input
                value={data.signatureSourcing}
                onChange={(e) => setChampTexte('signatureSourcing', e.target.value)}
                placeholder="Nom, date"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#5A5A5A] mb-1">
                Signature Projet
              </p>
              <Input
                value={data.signatureProjet}
                onChange={(e) => setChampTexte('signatureProjet', e.target.value)}
                placeholder="Nom, date"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rendu d'une section (titre + lignes)
// ---------------------------------------------------------------------------

function SectionRows({
  section,
  fournisseurs,
  nbCols,
  onCellule,
  onBesoin,
  onLibelle,
  onAjouterLigne,
  onSupprimerLigne,
}: {
  section: BidCompData['sections'][number]
  fournisseurs: FournisseurLite[]
  nbCols: number
  onCellule: (sectionId: string, ligneId: string, fid: string, v: string) => void
  onBesoin: (sectionId: string, ligneId: string, v: string) => void
  onLibelle: (sectionId: string, ligneId: string, v: string) => void
  onAjouterLigne: (sectionId: string) => void
  onSupprimerLigne: (sectionId: string, ligneId: string) => void
}) {
  const estCout = section.type === 'cout'
  return (
    <>
      <tr className="bg-[#E5EFF8] border-y border-[#DCDCDC]">
        <td
          colSpan={Math.max(nbCols, 2)}
          className="px-2 py-1.5 font-bold text-[#003370] text-[12px] uppercase tracking-wide sticky left-0"
        >
          <div className="flex items-center gap-2">
            {section.titre}
            {estCout && <span className="font-normal normal-case">(montants en €)</span>}
            <button
              onClick={() => onAjouterLigne(section.id)}
              className="p-0.5 rounded hover:bg-white text-[#004489]"
              title="Ajouter une ligne"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {section.lignes.map((l, i) => (
        <tr
          key={l.id}
          className={`border-b border-[#DCDCDC] group ${
            i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
          }`}
        >
          <td
            className={`px-1 py-0.5 sticky left-0 z-10 ${
              i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
            }`}
          >
            <div className="flex items-center gap-1">
              <input
                value={l.libelle}
                onChange={(e) => onLibelle(section.id, l.id, e.target.value)}
                placeholder="Libellé..."
                className="w-full font-medium text-[12px] px-1.5 py-1 rounded border border-transparent bg-transparent hover:border-[#DCDCDC] focus:border-[#004489] focus:bg-white focus:outline-none"
              />
              <button
                onClick={() => onSupprimerLigne(section.id, l.id)}
                className="p-1 rounded hover:bg-[#FDEAED] text-[#E20025] opacity-0 group-hover:opacity-100"
                title="Supprimer la ligne"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </td>
          <td className="px-1 py-0.5 bg-[#E5EFF8]/40">
            <input
              value={l.besoin}
              onChange={(e) => onBesoin(section.id, l.id, e.target.value)}
              placeholder="—"
              className="w-full text-[12px] px-1.5 py-1 rounded border border-transparent bg-transparent hover:border-[#DCDCDC] focus:border-[#004489] focus:bg-white focus:outline-none"
            />
          </td>
          {fournisseurs.map((f) => (
            <td key={f.id} className="px-1 py-0.5">
              <input
                value={l.valeurs[f.id] ?? ''}
                onChange={(e) => onCellule(section.id, l.id, f.id, e.target.value)}
                placeholder="—"
                inputMode={estCout ? 'decimal' : undefined}
                className={`w-full text-[12px] px-1.5 py-1 rounded border border-transparent bg-transparent hover:border-[#DCDCDC] focus:border-[#004489] focus:bg-white focus:outline-none ${
                  estCout ? 'text-right' : ''
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function ChampEntete({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  inputMode?: 'decimal'
}) {
  return (
    <div className="rounded-lg border border-[#DCDCDC] bg-white p-2.5">
      <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A] mb-1">{label}</p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        className="h-8 text-sm"
      />
    </div>
  )
}
