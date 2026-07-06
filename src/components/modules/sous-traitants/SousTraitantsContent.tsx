'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  createSousTraitant,
  updateSousTraitant,
  deleteSousTraitant,
  createAvenant,
  deleteAvenant,
  type SousTraitantComplet,
  type SousTraitantsData,
} from '@/actions/sous-traitants'
import { formatMontant, formatDateFR } from '@/lib/utils'
import { Plus, Pencil, Trash2, FileText, FilePlus2 } from 'lucide-react'
import { useExportPDF } from '@/hooks/useExportPDF'
import { useProfilStore } from '@/stores/profil'
import { montantAvenants, nouveauMontantMarche } from './calculs'

interface Props {
  projetId: string
  projetName: string
  initialData: SousTraitantsData
}

interface FormState {
  id?: string
  nom: string
  contact: string
  telephone: string
  email: string
  paiementDirect: boolean
  montantMarche: string
  montantAS: string
  commentaire: string
}

const FORM_VIDE: FormState = {
  nom: '',
  contact: '',
  telephone: '',
  email: '',
  paiementDirect: false,
  montantMarche: '',
  montantAS: '',
  commentaire: '',
}

function parseMontantInput(value: string): number {
  const n = parseFloat(value.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function SousTraitantsContent({ projetId, projetName, initialData }: Props) {
  const router = useRouter()
  const { sousTraitants, montantMarcheTotal } = initialData
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(FORM_VIDE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog avenants
  const [avenantsPour, setAvenantsPour] = useState<SousTraitantComplet | null>(null)
  const [avLibelle, setAvLibelle] = useState('')
  const [avMontant, setAvMontant] = useState('')
  const [avDate, setAvDate] = useState('')

  const { exportAvecGuard, isExporting } = useExportPDF()
  const userLogo = useProfilStore((s) => s.logoSociete)
  const nomSociete = useProfilStore((s) => s.nomSociete)

  const totaux = useMemo(() => {
    const cumulMarche = sousTraitants.reduce((s, st) => s + st.montantMarche, 0)
    const cumulAS = sousTraitants.reduce(
      (s, st) => s + (st.paiementDirect ? st.montantAS : 0),
      0
    )
    const cumulAvenants = sousTraitants.reduce((s, st) => s + montantAvenants(st), 0)
    const cumulNouveauxMontants = sousTraitants.reduce(
      (s, st) => s + nouveauMontantMarche(st),
      0
    )
    const partMandataire = montantMarcheTotal - cumulNouveauxMontants
    return { cumulMarche, cumulAS, cumulAvenants, cumulNouveauxMontants, partMandataire }
  }, [sousTraitants, montantMarcheTotal])

  function ouvrirCreation() {
    setForm(FORM_VIDE)
    setError(null)
    setDialogOpen(true)
  }

  function ouvrirEdition(st: SousTraitantComplet) {
    setForm({
      id: st.id,
      nom: st.nom,
      contact: st.contact || '',
      telephone: st.telephone || '',
      email: st.email || '',
      paiementDirect: st.paiementDirect,
      montantMarche: String(st.montantMarche),
      montantAS: String(st.montantAS),
      commentaire: st.commentaire || '',
    })
    setError(null)
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!form.nom.trim()) {
      setError('Le nom est obligatoire')
      return
    }
    setSaving(true)
    setError(null)
    const data = {
      nom: form.nom.trim(),
      contact: form.contact.trim() || null,
      telephone: form.telephone.trim() || null,
      email: form.email.trim() || null,
      paiementDirect: form.paiementDirect,
      montantMarche: parseMontantInput(form.montantMarche),
      montantAS: form.paiementDirect ? parseMontantInput(form.montantAS) : 0,
      commentaire: form.commentaire.trim() || null,
    }
    const res = form.id
      ? await updateSousTraitant(projetId, { id: form.id, ...data })
      : await createSousTraitant(projetId, data)
    setSaving(false)
    if (res.success) {
      setDialogOpen(false)
      router.refresh()
    } else {
      setError(res.error)
    }
  }

  async function handleDelete(st: SousTraitantComplet) {
    if (!confirm(`Supprimer le sous-traitant ${st.nom} et tout son suivi ?`)) return
    const res = await deleteSousTraitant(projetId, st.id)
    if (res.success) router.refresh()
    else alert(res.error)
  }

  async function handleAddAvenant() {
    if (!avenantsPour) return
    const montant = parseMontantInput(avMontant)
    const res = await createAvenant(projetId, avenantsPour.id, {
      libelle: avLibelle.trim() || null,
      montant,
      date: avDate || null,
    })
    if (res.success) {
      setAvLibelle('')
      setAvMontant('')
      setAvDate('')
      setAvenantsPour(null)
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  async function handleDeleteAvenant(avenantId: string) {
    if (!confirm('Supprimer cet avenant ?')) return
    const res = await deleteAvenant(projetId, avenantId)
    if (res.success) {
      setAvenantsPour(null)
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Cartes de synthèse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CarteSynthese
          label="Montant marché (Détail Estimatif)"
          value={formatMontant(montantMarcheTotal)}
        />
        <CarteSynthese
          label="Cumul marchés sous-traités"
          value={formatMontant(totaux.cumulNouveauxMontants)}
          sub={`dont avenants : ${formatMontant(totaux.cumulAvenants)}`}
        />
        <CarteSynthese
          label="Part mandataire"
          value={formatMontant(totaux.partMandataire)}
          accent
        />
        <CarteSynthese
          label="Cumul actes spéciaux (paiement direct)"
          value={formatMontant(totaux.cumulAS)}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={ouvrirCreation}
          className="bg-[#004489] hover:bg-[#003370] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau sous-traitant
        </Button>
        {sousTraitants.length > 0 && (
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
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-[#DCDCDC]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#004489] text-white font-bold text-[12px]">
              <th className="px-2 py-2 text-left">Sous-traitant</th>
              <th className="px-2 py-2 text-left">Contact</th>
              <th className="px-2 py-2 text-center">Paiement direct</th>
              <th className="px-2 py-2 text-right">Montant marché</th>
              <th className="px-2 py-2 text-right">Montant AS</th>
              <th className="px-2 py-2 text-right">Avenants</th>
              <th className="px-2 py-2 text-right">Nouveau montant marché</th>
              <th className="px-2 py-2 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sousTraitants.map((st, i) => (
              <tr
                key={st.id}
                className={`border-b border-[#DCDCDC] ${
                  i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                }`}
              >
                <td className="px-2 py-2 font-medium">{st.nom}</td>
                <td className="px-2 py-2 text-[12px] text-[#5A5A5A]">
                  {[st.contact, st.telephone].filter(Boolean).join(' — ') || '—'}
                </td>
                <td className="px-2 py-2 text-center">
                  {st.paiementDirect ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8EFDA] text-[#5E8019]">
                      Oui
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-[#F0F0F0] text-[#5A5A5A] border border-[#DCDCDC]">
                      Non
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right">{formatMontant(st.montantMarche)}</td>
                <td className="px-2 py-2 text-right">
                  {st.paiementDirect ? formatMontant(st.montantAS) : '—'}
                </td>
                <td className="px-2 py-2 text-right">
                  <button
                    onClick={() => setAvenantsPour(st)}
                    className="text-[#004489] hover:underline font-medium"
                    title="Gérer les avenants"
                  >
                    {st.avenants.length > 0
                      ? `${formatMontant(montantAvenants(st))} (${st.avenants.length})`
                      : 'Ajouter'}
                  </button>
                </td>
                <td className="px-2 py-2 text-right font-semibold">
                  {formatMontant(nouveauMontantMarche(st))}
                </td>
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setAvenantsPour(st)}
                      className="p-1.5 rounded hover:bg-[#E5EFF8] text-[#004489]"
                      title="Avenants"
                    >
                      <FilePlus2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => ouvrirEdition(st)}
                      className="p-1.5 rounded hover:bg-[#E5EFF8] text-[#004489]"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(st)}
                      className="p-1.5 rounded hover:bg-[#FDEAED] text-[#E20025]"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sousTraitants.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                  Aucun sous-traitant — cliquez sur « Nouveau sous-traitant » pour commencer
                </td>
              </tr>
            )}
          </tbody>
          {sousTraitants.length > 0 && (
            <tfoot>
              <tr className="bg-[#003370] font-bold text-white text-[12px]">
                <td colSpan={3} className="px-2 py-3 text-right">
                  CUMUL SOUS-TRAITANTS :
                </td>
                <td className="px-2 py-3 text-right">{formatMontant(totaux.cumulMarche)}</td>
                <td className="px-2 py-3 text-right">{formatMontant(totaux.cumulAS)}</td>
                <td className="px-2 py-3 text-right">{formatMontant(totaux.cumulAvenants)}</td>
                <td className="px-2 py-3 text-right text-[13px]">
                  {formatMontant(totaux.cumulNouveauxMontants)}
                </td>
                <td className="px-2 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#004489]">
              {form.id ? 'Modifier le sous-traitant' : 'Nouveau sous-traitant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="st-nom">Nom *</Label>
              <Input
                id="st-nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex : ETF SERVICES"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="st-contact">Contact</Label>
                <Input
                  id="st-contact"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="st-tel">Téléphone</Label>
                <Input
                  id="st-tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="st-email">Email</Label>
              <Input
                id="st-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="st-marche">Montant marché HT (€)</Label>
                <Input
                  id="st-marche"
                  inputMode="decimal"
                  value={form.montantMarche}
                  onChange={(e) => setForm({ ...form, montantMarche: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="st-as" className={form.paiementDirect ? '' : 'text-gray-400'}>
                  Montant AS HT (€)
                </Label>
                <Input
                  id="st-as"
                  inputMode="decimal"
                  value={form.montantAS}
                  onChange={(e) => setForm({ ...form, montantAS: e.target.value })}
                  placeholder="0,00"
                  disabled={!form.paiementDirect}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="st-direct"
                checked={form.paiementDirect}
                onCheckedChange={(v) =>
                  setForm({ ...form, paiementDirect: v === true })
                }
              />
              <Label htmlFor="st-direct" className="cursor-pointer">
                Paiement direct (acte spécial)
              </Label>
            </div>
            <div>
              <Label htmlFor="st-comm">Commentaire</Label>
              <Input
                id="st-comm"
                value={form.commentaire}
                onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
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

      {/* Dialog avenants */}
      <Dialog open={!!avenantsPour} onOpenChange={(o) => !o && setAvenantsPour(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#004489]">
              Avenants — {avenantsPour?.nom}
            </DialogTitle>
          </DialogHeader>
          {avenantsPour && (
            <div className="space-y-4">
              {avenantsPour.avenants.length > 0 ? (
                <table className="w-full text-[13px] border border-[#DCDCDC] rounded">
                  <thead>
                    <tr className="bg-[#004489] text-white text-[12px]">
                      <th className="px-2 py-1.5 text-left">N°</th>
                      <th className="px-2 py-1.5 text-left">Libellé</th>
                      <th className="px-2 py-1.5 text-left">Date</th>
                      <th className="px-2 py-1.5 text-right">Montant HT</th>
                      <th className="px-2 py-1.5 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {avenantsPour.avenants.map((a, i) => (
                      <tr
                        key={a.id}
                        className={`border-b border-[#DCDCDC] ${
                          i % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'
                        }`}
                      >
                        <td className="px-2 py-1.5">Avenant {a.numero}</td>
                        <td className="px-2 py-1.5">{a.libelle || '—'}</td>
                        <td className="px-2 py-1.5">
                          {a.date ? formatDateFR(new Date(a.date)) : '—'}
                        </td>
                        <td className="px-2 py-1.5 text-right font-medium">
                          {formatMontant(a.montant)}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button
                            onClick={() => handleDeleteAvenant(a.id)}
                            className="p-1 rounded hover:bg-[#FDEAED] text-[#E20025]"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-400">Aucun avenant pour ce sous-traitant.</p>
              )}

              <div className="border-t border-[#DCDCDC] pt-3 space-y-2">
                <p className="text-sm font-medium text-[#004489]">Ajouter un avenant</p>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Libellé"
                    value={avLibelle}
                    onChange={(e) => setAvLibelle(e.target.value)}
                  />
                  <Input
                    placeholder="Montant HT"
                    inputMode="decimal"
                    value={avMontant}
                    onChange={(e) => setAvMontant(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={avDate}
                    onChange={(e) => setAvDate(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddAvenant}
                  className="bg-[#004489] hover:bg-[#003370] text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CarteSynthese({
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
