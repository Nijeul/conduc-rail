'use client'

import { useState } from 'react'
import { updateInfosProjet } from '@/actions/infos-projet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'

interface InfosProjetFormProps {
  projetId: string
  infos: {
    moaNom: string | null
    moaPrenom: string | null
    moaAdresse: string | null
    numeroAffaire: string | null
    numeroCommande: string | null
    numeroOTP: string | null
    adresseChantier: string | null
    dateDebut: Date | null
    dateFin: Date | null
  }
}

function formatDateForInput(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function InfosProjetForm({ projetId, infos }: InfosProjetFormProps) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const form = new FormData(e.currentTarget)

    const data = {
      moaNom: (form.get('moaNom') as string) || undefined,
      moaPrenom: (form.get('moaPrenom') as string) || undefined,
      moaAdresse: (form.get('moaAdresse') as string) || undefined,
      numeroAffaire: (form.get('numeroAffaire') as string) || undefined,
      numeroCommande: (form.get('numeroCommande') as string) || undefined,
      numeroOTP: (form.get('numeroOTP') as string) || undefined,
      adresseChantier: (form.get('adresseChantier') as string) || undefined,
      dateDebut: (form.get('dateDebut') as string) || undefined,
      dateFin: (form.get('dateFin') as string) || undefined,
    }

    const result = await updateInfosProjet(projetId, data)

    if (result.success) {
      setMessage({ type: 'success', text: 'Informations enregistrees avec succes' })
    } else {
      setMessage({ type: 'error', text: result.error })
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {/* Maitrise d'Ouvrage */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[#263238] border-b border-[#263238]/20 pb-2 w-full">
          Maitrise d&apos;Ouvrage
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="moaNom">MOA Nom</Label>
            <Input id="moaNom" name="moaNom" defaultValue={infos.moaNom || ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="moaPrenom">MOA Prenom</Label>
            <Input id="moaPrenom" name="moaPrenom" defaultValue={infos.moaPrenom || ''} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="moaAdresse">Adresse MOA</Label>
          <textarea
            id="moaAdresse"
            name="moaAdresse"
            rows={2}
            defaultValue={infos.moaAdresse || ''}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </fieldset>

      {/* References administratives */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[#263238] border-b border-[#263238]/20 pb-2 w-full">
          References administratives
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="numeroAffaire">N° d&apos;affaire</Label>
            <Input id="numeroAffaire" name="numeroAffaire" defaultValue={infos.numeroAffaire || ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numeroCommande">N° de commande</Label>
            <Input id="numeroCommande" name="numeroCommande" defaultValue={infos.numeroCommande || ''} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numeroOTP">N° OTP</Label>
            <Input id="numeroOTP" name="numeroOTP" defaultValue={infos.numeroOTP || ''} />
          </div>
        </div>
      </fieldset>

      {/* Chantier */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-[#263238] border-b border-[#263238]/20 pb-2 w-full">
          Chantier
        </legend>
        <div className="space-y-1.5">
          <Label htmlFor="adresseChantier">Adresse du chantier</Label>
          <textarea
            id="adresseChantier"
            name="adresseChantier"
            rows={2}
            defaultValue={infos.adresseChantier || ''}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dateDebut">Date de debut</Label>
            <Input
              id="dateDebut"
              name="dateDebut"
              type="date"
              defaultValue={formatDateForInput(infos.dateDebut)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dateFin">Date de fin prevue</Label>
            <Input
              id="dateFin"
              name="dateFin"
              type="date"
              defaultValue={formatDateForInput(infos.dateFin)}
            />
          </div>
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>

        {message && (
          <span
            className={
              message.type === 'success'
                ? 'text-sm text-green-700'
                : 'text-sm text-[#B71C1C]'
            }
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  )
}
