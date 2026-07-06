'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PrixNouveau } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createPrixNouveau,
  updatePrixNouveau,
  deletePrixNouveau,
} from '@/actions/prix-nouveaux'
import { formatMontant, formatDateFR } from '@/lib/utils'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'
import {
  STATUT_LABELS,
  STATUT_STYLES,
  potentielStyle,
  montantPondere,
} from './helpers'

interface Props {
  projetId: string
  projetName: string
  prixNouveaux: PrixNouveau[]
}

interface FormState {
  id?: string
  numero: string
  intitule: string
  dateDevis: string
  montantPresente: string
  montantAccepte: string
  debourseReel: string
  numeroOS: string
  dateOS: string
  delaiSupplementaire: string
  potentielAcceptation: string
  statut: string
  commentaire: string
}

const FORM_VIDE: FormState = {
  numero: '',
  intitule: '',
  dateDevis: '',
  montantPresente: '',
  montantAccepte: '',
  debourseReel: '',
  numeroOS: '',
  dateOS: '',
  delaiSupplementaire: '',
  potentielAcceptation: '50',
  statut: 'en_cours',
  commentaire: '',
}

function parseMontantInput(value: string): number | null {
  if (!value.trim()) return null
  const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? null : n
}

function dateToInput(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : ''
}

export function PrixNouveauxContent({ projetId, projetName, prixNouveaux }: Props) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_VIDE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  const totaux = useMemo(() => {
    const presente = prixNouveaux.reduce((s, pn) => s + pn.montantPresente, 0)
    const accepte = prixNouveaux.reduce((s, pn) => s + (pn.montantAccepte ?? 0), 0)
    const debourse = prixNouveaux.reduce((s, pn) => s + (pn.debourseReel ?? 0), 0)
    const pondere = prixNouveaux.reduce((s, pn) => s + montantPondere(pn), 0)
    return { presente, accepte, debourse, pondere }
  }, [prixNouveaux])

  function ouvrirCreation() {
    setForm(FORM_VIDE)
    setError(null)
    setDialogOpen(true)
  }

  function ouvrirEdition(pn: PrixNouveau) {
    setForm({
      id: pn.id,
      numero: pn.numero || '',
      intitule: pn.intitule,
      dateDevis: dateToInput(pn.dateDevis),
      montantPresente: String(pn.montantPresente),
      montantAccepte: pn.montantAccepte != null ? String(pn.montantAccepte) : '',
      debourseReel: pn.debourseReel != null ? String(pn.debourseReel) : '',
      numeroOS: pn.numeroOS || '',
      dateOS: dateToInput(pn.dateOS),
      delaiSupplementaire: pn.delaiSupplementaire || '',
      potentielAcceptation: String(pn.potentielAcceptation),
      statut: pn.statut,
      commentaire: pn.commentaire || '',
    })
    setError(null)
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.intitule.trim()) {
      setError("L'intitulé est obligatoire")
      return
    }
    setSaving(true)
    setError(null)
    const data = {
      numero: form.numero.trim() || null,
      intitule: form.intitule.trim(),
      dateDevis: form.dateDevis || null,
      montantPresente: parseMontantInput(form.montantPresente) ?? 0,
      montantAccepte: parseMontantInput(form.montantAccepte),
      debourseReel: parseMontantInput(form.debourseReel),
      numeroOS: form.numeroOS.trim() || null,
      dateOS: form.dateOS || null,
      delaiSupplementaire: form.delaiSupplementaire.trim() || null,
      potentielAcceptation: parseInt(form.potentielAcceptation, 10),
      statut: form.statut as 'a_venir' | 'en_cours' | 'accepte' | 'refuse',
      commentaire: form.commentaire.trim() || null,
    }
    const res = form.id
      ? await updatePrixNouveau(projetId, { id: form.id, ...data })
      : await createPrixNouveau(projetId, data)
    setSaving(false)
    if (res.success) {
      setDialogOpen(false)
      router.refresh()
    } else {
      setError(res.error)
    }
  }

  async function handleDelete(pn: PrixNouveau) {
    if (!confirm(`Supprimer le prix nouveau « ${pn.numero || pn.intitule} » ?`)) return
    const res = await deletePrixNouveau(projetId, pn.id)
    if (res.success) router.refresh()
    else alert(res.error)
  }

  return (
    <div className="space-y-4">
      {/* Cartes de synthèse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Carte label="Montant total présenté" value={formatMontant(totaux.presente)} />
        <Carte label="Montant total accepté" value={formatMontant(totaux.accepte)} />
        <Carte
          label="Montant pondéré (potentiel)"
          value={formatMontant(totaux.pondere)}
          sub="acceptés + présentés × potentiel"
          accent
        />
        <Carte label="Déboursés réels" value={formatMontant(totaux.debourse)} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={ouvrirCreation}
          className="bg-[#004489] hover:bg-[#003370] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau prix
        </Button>
        {prixNouveaux.length > 0 && (
          <Button
            onClick={() =>
              exportAvecGuard(async () => {
                const { genererPrixNouveauxPDF } = await import('./PrixNouveauxPDFDownload')
                await genererPrixNouveauxPDF(
                  projetName,
                  prixNouveaux,
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
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold text-[12px]">
              <th className="px-2 py-2 text-left">N° devis</th>
              <th className="px-2 py-2 text-left min-w-52">Intitulé</th>
              <th className="px-2 py-2 text-left">Date devis</th>
              <th className="px-2 py-2 text-right">Montant présenté</th>
              <th className="px-2 py-2 text-center">Potentiel d&apos;acceptation</th>
              <th className="px-2 py-2 text-right">Montant accepté</th>
              <th className="px-2 py-2 text-right">Déboursé réel</th>
              <th className="px-2 py-2 text-center">N° OS</th>
              <th className="px-2 py-2 text-left">Date OS</th>
              <th className="px-2 py-2 text-left">Délai suppl.</th>
              <th className="px-2 py-2 text-center">Statut</th>
              <th className="px-2 py-2 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prixNouveaux.map((pn, i) => {
              const pot = potentielStyle(pn)
              return (
                <tr
                  key={pn.id}
                  className={`border-b border-[#DCDCDC] ${
                    i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                  }`}
                >
                  <td className="px-2 py-2 font-mono text-[12px]">{pn.numero || '—'}</td>
                  <td className="px-2 py-2">
                    {pn.intitule}
                    {pn.commentaire && (
                      <p className="text-[11px] text-[#5A5A5A]">{pn.commentaire}</p>
                    )}
                  </td>
                  <td className="px-2 py-2 text-[12px]">
                    {pn.dateDevis ? formatDateFR(new Date(pn.dateDevis)) : '—'}
                  </td>
                  <td className="px-2 py-2 text-right font-medium">
                    {formatMontant(pn.montantPresente)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold"
                      style={{ backgroundColor: pot.bg, color: pot.text }}
                    >
                      {pot.label}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    {pn.montantAccepte != null ? formatMontant(pn.montantAccepte) : '—'}
                  </td>
                  <td className="px-2 py-2 text-right">
                    {pn.debourseReel != null ? formatMontant(pn.debourseReel) : '—'}
                  </td>
                  <td className="px-2 py-2 text-center text-[12px]">
                    {pn.numeroOS || '—'}
                  </td>
                  <td className="px-2 py-2 text-[12px]">
                    {pn.dateOS ? formatDateFR(new Date(pn.dateOS)) : '—'}
                  </td>
                  <td className="px-2 py-2 text-[12px]">
                    {pn.delaiSupplementaire || '—'}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold"
                      style={STATUT_STYLES[pn.statut] || STATUT_STYLES.en_cours}
                    >
                      {STATUT_LABELS[pn.statut] || pn.statut}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => ouvrirEdition(pn)}
                        className="p-1.5 rounded hover:bg-[#E5EFF8] text-[#004489]"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pn)}
                        className="p-1.5 rounded hover:bg-[#FDEAED] text-[#E20025]"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {prixNouveaux.length === 0 && (
              <tr>
                <td colSpan={12} className="px-3 py-8 text-center text-gray-400">
                  Aucun prix nouveau — cliquez sur « Nouveau prix » pour commencer
                </td>
              </tr>
            )}
          </tbody>
          {prixNouveaux.length > 0 && (
            <tfoot>
              <tr className="bg-[#003370] font-bold text-white text-[12px]">
                <td colSpan={3} className="px-2 py-3 text-right">
                  TOTAUX :
                </td>
                <td className="px-2 py-3 text-right">{formatMontant(totaux.presente)}</td>
                <td className="px-2 py-3 text-right text-[11px]">
                  Pondéré : {formatMontant(totaux.pondere)}
                </td>
                <td className="px-2 py-3 text-right">{formatMontant(totaux.accepte)}</td>
                <td className="px-2 py-3 text-right">{formatMontant(totaux.debourse)}</td>
                <td colSpan={5} className="px-2 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#004489]">
              {form.id ? 'Modifier le prix nouveau' : 'Nouveau prix'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pn-numero">N° devis</Label>
                <Input
                  id="pn-numero"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  placeholder="Ex : PN 01"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="pn-intitule">Intitulé *</Label>
                <Input
                  id="pn-intitule"
                  value={form.intitule}
                  onChange={(e) => setForm({ ...form, intitule: e.target.value })}
                  placeholder="Ex : Mise à disposition base vie"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pn-date-devis">Date devis</Label>
                <Input
                  id="pn-date-devis"
                  type="date"
                  value={form.dateDevis}
                  onChange={(e) => setForm({ ...form, dateDevis: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pn-presente">Montant présenté HT (€)</Label>
                <Input
                  id="pn-presente"
                  inputMode="decimal"
                  value={form.montantPresente}
                  onChange={(e) => setForm({ ...form, montantPresente: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Potentiel d&apos;acceptation</Label>
                <Select
                  value={form.potentielAcceptation}
                  onValueChange={(v) => setForm({ ...form, potentielAcceptation: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 % — Très risqué</SelectItem>
                    <SelectItem value="25">25 % — Risqué</SelectItem>
                    <SelectItem value="50">50 % — Incertain</SelectItem>
                    <SelectItem value="75">75 % — Probable</SelectItem>
                    <SelectItem value="100">100 % — Quasi certain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Statut</Label>
                <Select
                  value={form.statut}
                  onValueChange={(v) => setForm({ ...form, statut: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_venir">À venir</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="accepte">Accepté</SelectItem>
                    <SelectItem value="refuse">Refusé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pn-accepte">Montant accepté HT (€)</Label>
                <Input
                  id="pn-accepte"
                  inputMode="decimal"
                  value={form.montantAccepte}
                  onChange={(e) => setForm({ ...form, montantAccepte: e.target.value })}
                  placeholder="—"
                />
              </div>
              <div>
                <Label htmlFor="pn-debourse">Déboursé réel HT (€)</Label>
                <Input
                  id="pn-debourse"
                  inputMode="decimal"
                  value={form.debourseReel}
                  onChange={(e) => setForm({ ...form, debourseReel: e.target.value })}
                  placeholder="—"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="pn-os">N° OS</Label>
                <Input
                  id="pn-os"
                  value={form.numeroOS}
                  onChange={(e) => setForm({ ...form, numeroOS: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pn-date-os">Date OS</Label>
                <Input
                  id="pn-date-os"
                  type="date"
                  value={form.dateOS}
                  onChange={(e) => setForm({ ...form, dateOS: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pn-delai">Délai supplémentaire</Label>
                <Input
                  id="pn-delai"
                  value={form.delaiSupplementaire}
                  onChange={(e) =>
                    setForm({ ...form, delaiSupplementaire: e.target.value })
                  }
                  placeholder="Ex : Sans impact, 3 jours"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pn-comm">Commentaire</Label>
              <Input
                id="pn-comm"
                value={form.commentaire}
                onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                placeholder="Ex : En attente d'OS, PU proposé à confirmer avec MOE"
              />
            </div>
            {error && (
              <div className="bg-[#FDEAED] border border-[#E20025] text-[#E20025] px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-[#004489] text-[#004489]"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-[#004489] hover:bg-[#003370] text-white"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Carte({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        accent ? 'border-[#004489] bg-[#E5EFF8]' : 'border-[#DCDCDC] bg-white'
      }`}
    >
      <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A]">{label}</p>
      <p className={`text-lg font-bold ${accent ? 'text-[#003370]' : 'text-[#000000]'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[#5A5A5A] mt-0.5">{sub}</p>}
    </div>
  )
}
