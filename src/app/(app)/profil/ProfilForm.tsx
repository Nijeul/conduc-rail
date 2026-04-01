'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Save, Trash2, Upload } from 'lucide-react'
import { updateProfil, changePassword } from '@/actions/profil'
import { useProfilStore } from '@/stores/profil'

interface ProfilData {
  id: string
  name: string
  email: string
  nomSociete: string | null
  logoSociete: string | null
  adresseSociete: string | null
  telSociete: string | null
  faxSociete: string | null
  certifications: string | null
}

interface ProfilFormProps {
  profil: ProfilData
}

export function ProfilForm({ profil }: ProfilFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Split name into prenom + nom
  const nameParts = (profil.name || '').split(' ')
  const [prenom, setPrenom] = useState(nameParts[0] || '')
  const [nom, setNom] = useState(nameParts.slice(1).join(' ') || '')
  const [nomSociete, setNomSociete] = useState(profil.nomSociete || '')
  const [adresseSociete, setAdresseSociete] = useState(profil.adresseSociete || '')
  const [telSociete, setTelSociete] = useState(profil.telSociete || '')
  const [faxSociete, setFaxSociete] = useState(profil.faxSociete || '')
  const [certifications, setCertifications] = useState(profil.certifications || '')
  const [logoPreview, setLogoPreview] = useState<string | null>(profil.logoSociete || null)
  const [logoBase64, setLogoBase64] = useState<string | null>(profil.logoSociete || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password state
  const [ancienMdp, setAncienMdp] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmMdp, setConfirmMdp] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const setLogo = useProfilStore((s) => s.setLogo)
  const setNomSocieteStore = useProfilStore((s) => s.setNomSociete)

  // Initialize store on mount
  useEffect(() => {
    setLogo(profil.logoSociete || null)
    setNomSocieteStore(profil.nomSociete || null)
  }, [profil.logoSociete, profil.nomSociete, setLogo, setNomSocieteStore])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setError('Le logo doit etre au format PNG ou JPG')
      return
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Le logo ne doit pas depasser 2 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setLogoPreview(base64)
      setLogoBase64(base64)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveLogo() {
    setLogoPreview(null)
    setLogoBase64(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSave() {
    setError(null)
    setSuccess(null)

    const fullName = `${prenom.trim()} ${nom.trim()}`.trim()
    if (!fullName) {
      setError('Le prenom et le nom sont requis')
      return
    }

    startTransition(async () => {
      const result = await updateProfil({
        name: fullName,
        nomSociete: nomSociete || undefined,
        logoSociete: logoBase64,
        adresseSociete: adresseSociete || undefined,
        telSociete: telSociete || undefined,
        faxSociete: faxSociete || undefined,
        certifications: certifications || undefined,
      })

      if (result.success) {
        setSuccess('Profil mis a jour')
        setLogo(logoBase64)
        setNomSocieteStore(nomSociete || null)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error)
      }
    })
  }

  function handleChangePassword() {
    setPasswordError(null)
    setPasswordSuccess(null)

    if (nouveauMdp !== confirmMdp) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    startTransition(async () => {
      const result = await changePassword({
        ancienMotDePasse: ancienMdp,
        nouveauMotDePasse: nouveauMdp,
        confirmation: confirmMdp,
      })

      if (result.success) {
        setPasswordSuccess('Mot de passe modifie')
        setAncienMdp('')
        setNouveauMdp('')
        setConfirmMdp('')
        setTimeout(() => setPasswordSuccess(null), 3000)
      } else {
        setPasswordError(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Profil section */}
      <div className="bg-white border border-[#DCDCDC] rounded-lg p-5">
        <h2 className="text-base font-bold text-[#004489] mb-4 pb-2 border-b border-[#DCDCDC]">
          Informations personnelles
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm border border-green-200 mb-4">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="prenom" className="text-sm font-medium">
              Prenom
            </Label>
            <Input
              id="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nom" className="text-sm font-medium">
              Nom
            </Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            value={profil.email}
            readOnly
            className="mt-1 bg-gray-50 cursor-not-allowed"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="nomSociete" className="text-sm font-medium">
            Nom de la societe
          </Label>
          <Input
            id="nomSociete"
            value={nomSociete}
            onChange={(e) => setNomSociete(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Logo upload */}
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Logo societe</Label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo societe"
                  className="h-16 w-auto max-w-[120px] object-contain border border-[#DCDCDC] rounded p-1"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  title="Supprimer le logo"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-16 w-24 border-2 border-dashed border-[#DCDCDC] rounded flex items-center justify-center text-xs text-gray-400">
                Aucun logo
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                {logoPreview ? 'Changer' : 'Uploader'}
              </Button>
              <p className="text-xs text-gray-400 mt-1">PNG ou JPG, max 2 MB</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-[#004489] hover:bg-[#004489]/90 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Coordonnees societe */}
      <div className="bg-white border border-[#DCDCDC] rounded-lg p-5">
        <h2 className="text-base font-bold text-[#004489] mb-4 pb-2 border-b border-[#DCDCDC]">
          Coordonnees societe
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Ces informations apparaissent dans l&apos;en-tete des courriers PDF.
        </p>

        <div className="mb-4">
          <Label htmlFor="adresseSociete" className="text-sm font-medium">
            Adresse societe
          </Label>
          <textarea
            id="adresseSociete"
            value={adresseSociete}
            onChange={(e) => setAdresseSociete(e.target.value)}
            rows={3}
            placeholder="12 rue de l'Industrie&#10;75001 Paris"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="telSociete" className="text-sm font-medium">
              Telephone societe
            </Label>
            <Input
              id="telSociete"
              value={telSociete}
              onChange={(e) => setTelSociete(e.target.value)}
              placeholder="01 23 45 67 89"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="faxSociete" className="text-sm font-medium">
              Fax societe <span className="text-gray-400 font-normal">(optionnel)</span>
            </Label>
            <Input
              id="faxSociete"
              value={faxSociete}
              onChange={(e) => setFaxSociete(e.target.value)}
              placeholder="01 23 45 67 90"
              className="mt-1"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="certifications" className="text-sm font-medium">
            Certifications
          </Label>
          <Input
            id="certifications"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="ISO 9001 · 14001 · MASE"
            className="mt-1"
          />
          <p className="text-xs text-gray-400 mt-1">Separees par un point median ( · )</p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-[#004489] hover:bg-[#004489]/90 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Password section */}
      <div className="bg-white border border-[#DCDCDC] rounded-lg p-5">
        <h2 className="text-base font-bold text-[#004489] mb-4 pb-2 border-b border-[#DCDCDC]">
          Changer le mot de passe
        </h2>

        {passwordError && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200 mb-4">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm border border-green-200 mb-4">
            {passwordSuccess}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="ancienMdp" className="text-sm font-medium">
              Ancien mot de passe
            </Label>
            <Input
              id="ancienMdp"
              type="password"
              value={ancienMdp}
              onChange={(e) => setAncienMdp(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nouveauMdp" className="text-sm font-medium">
              Nouveau mot de passe
            </Label>
            <Input
              id="nouveauMdp"
              type="password"
              value={nouveauMdp}
              onChange={(e) => setNouveauMdp(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirmMdp" className="text-sm font-medium">
              Confirmer le mot de passe
            </Label>
            <Input
              id="confirmMdp"
              type="password"
              value={confirmMdp}
              onChange={(e) => setConfirmMdp(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={isPending || !ancienMdp || !nouveauMdp || !confirmMdp}
              className="bg-[#F0F0F0] hover:bg-[#E0E0E0] text-[#000000] border border-[#DCDCDC]"
            >
              {isPending ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
