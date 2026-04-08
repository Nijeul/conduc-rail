'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EnTeteCourrier } from './EnTeteCourrier'
import { SelectTemplate } from './SelectTemplate'
import {
  createCourrier,
  updateCourrier,
  marquerCourrierEnvoye,
} from '@/actions/courriers'
import { Save, Send, AlertTriangle, Download } from 'lucide-react'
import { CourrierPDFDownload } from './CourrierPDFDownload'

interface ProjetInfos {
  name?: string | null
  moaNom?: string | null
  moaPrenom?: string | null
  moaAdresse?: string | null
  numeroAffaire?: string | null
  numeroOTP?: string | null
  dateDebut?: Date | null
  nomSociete?: string | null
}

interface UserInfos {
  name?: string | null
  nomSociete?: string | null
  logoSociete?: string | null
  adresseSociete?: string | null
  telSociete?: string | null
  faxSociete?: string | null
  certifications?: string | null
}

interface CourrierData {
  id?: string
  reference: string
  objet: string
  type: string
  destinataire: string | null
  corps: string
  statut?: string
  dateEnvoi?: Date | null
}

interface EditeurCourrierProps {
  projetId: string
  projetInfos: ProjetInfos
  userInfos?: UserInfos | null
  courrier?: CourrierData | null
}

const TYPES = [
  { value: 'lettre', label: 'Lettre' },
  { value: 'compte-rendu', label: 'Compte-rendu' },
  { value: 'note', label: 'Note' },
  { value: 'demande', label: 'Demande' },
  { value: 'autre', label: 'Autre' },
]

function getMissingProfilFields(userInfos?: UserInfos | null): string[] {
  const missing: string[] = []
  if (!userInfos) return ['Toutes les informations societe']
  if (!userInfos.nomSociete) missing.push('Nom societe')
  if (!userInfos.adresseSociete) missing.push('Adresse societe')
  if (!userInfos.telSociete) missing.push('Telephone societe')
  return missing
}

export function EditeurCourrier({ projetId, projetInfos, userInfos, courrier }: EditeurCourrierProps) {
  const router = useRouter()
  const isNew = !courrier?.id

  const [reference, setReference] = useState(courrier?.reference || '')
  const [objet, setObjet] = useState(courrier?.objet || '')
  const [type, setType] = useState(courrier?.type || 'lettre')
  const [destinataire, setDestinataire] = useState(courrier?.destinataire || '')
  const [corps, setCorps] = useState(courrier?.corps || '')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [showPdf, setShowPdf] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isEnvoye = courrier?.statut === 'envoye'
  const missingFields = getMissingProfilFields(userInfos)

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    const data = {
      reference,
      objet,
      type: type as 'lettre' | 'compte-rendu' | 'note' | 'demande' | 'autre',
      destinataire: destinataire || undefined,
      corps,
    }

    if (isNew) {
      const result = await createCourrier(projetId, data)
      if (result.success) {
        router.push(`/projets/${projetId}/courriers/${result.data.id}`)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } else {
      const result = await updateCourrier(projetId, { ...data, id: courrier!.id! })
      if (result.success) {
        setMessage({ type: 'success', text: 'Courrier enregistre' })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    }

    setSaving(false)
  }

  async function handleSend() {
    if (!courrier?.id || isEnvoye) return
    setSending(true)
    setMessage(null)

    // Save first
    const saveData = {
      id: courrier.id,
      reference,
      objet,
      type: type as 'lettre' | 'compte-rendu' | 'note' | 'demande' | 'autre',
      destinataire: destinataire || undefined,
      corps,
    }
    await updateCourrier(projetId, saveData)

    const result = await marquerCourrierEnvoye(projetId, courrier.id)
    if (result.success) {
      setMessage({ type: 'success', text: 'Courrier marque comme envoye' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: result.error })
    }
    setSending(false)
  }

  function handleTemplate(templateObjet: string, templateCorps: string) {
    setObjet(templateObjet)
    setCorps(templateCorps)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <SelectTemplate projetInfos={projetInfos} onSelect={handleTemplate} />
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPdf(true)}
              className="border-[#004489] text-[#004489]"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || isEnvoye}
            className="bg-[#004489] hover:bg-[#004489]/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          {!isNew && !isEnvoye && (
            <Button
              onClick={handleSend}
              disabled={sending}
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Envoi...' : 'Marquer comme envoye'}
            </Button>
          )}
        </div>
        <h2 className="text-lg font-semibold text-[#004489]">
          {isNew ? 'Nouveau courrier' : `Courrier : ${reference}`}
        </h2>
      </div>

      {/* Avertissement champs profil manquants */}
      {missingFields.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-medium">Informations profil incompletes.</span>{' '}
            Les champs suivants sont vides : {missingFields.join(', ')}.{' '}
            <a href="/profil" className="underline font-medium hover:text-amber-900">
              Completer mon profil
            </a>
          </div>
        </div>
      )}

      {message && (
        <div
          className={
            message.type === 'success'
              ? 'text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2'
              : 'text-sm text-[#E20025] bg-red-50 border border-red-200 rounded px-3 py-2'
          }
        >
          {message.text}
        </div>
      )}

      {isEnvoye && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          Ce courrier a ete marque comme envoye. Il n&apos;est plus modifiable.
        </div>
      )}

      {/* En-tete preview */}
      <EnTeteCourrier
        nomSociete={projetInfos.nomSociete}
        moaPrenom={projetInfos.moaPrenom}
        moaNom={projetInfos.moaNom}
        moaAdresse={projetInfos.moaAdresse}
        objet={objet}
        reference={reference}
        numeroAffaire={projetInfos.numeroAffaire}
        numeroOTP={projetInfos.numeroOTP}
      />

      {/* Editable fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reference">Reference</Label>
          <Input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            disabled={isEnvoye}
            placeholder="CR-2026-001"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isEnvoye}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="objet">Objet</Label>
          <Input
            id="objet"
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            disabled={isEnvoye}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destinataire">Destinataire</Label>
          <Input
            id="destinataire"
            value={destinataire}
            onChange={(e) => setDestinataire(e.target.value)}
            disabled={isEnvoye}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="corps">Corps du courrier</Label>
        <textarea
          id="corps"
          value={corps}
          onChange={(e) => setCorps(e.target.value)}
          disabled={isEnvoye}
          rows={16}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono leading-relaxed"
        />
      </div>

      {/* PDF download trigger */}
      {showPdf && (
        <CourrierPDFDownload
          reference={reference}
          objet={objet}
          corps={corps}
          dateEnvoi={courrier?.dateEnvoi}
          projetInfos={projetInfos}
          userInfos={userInfos}
          onDone={() => setShowPdf(false)}
        />
      )}
    </div>
  )
}
