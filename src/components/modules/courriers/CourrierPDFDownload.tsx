'use client'

import { useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import { CourrierPDF } from '@/lib/pdf/courrier'

interface UserInfos {
  name?: string | null
  nomSociete?: string | null
  logoSociete?: string | null
  adresseSociete?: string | null
  telSociete?: string | null
  faxSociete?: string | null
  certifications?: string | null
}

interface Props {
  reference: string
  objet: string
  corps: string
  destinataire?: string | null
  lieu?: string | null
  modeEnvoi?: string | null
  copies?: string | null
  signataireNom?: string | null
  signataireFonction?: string | null
  dateEnvoi?: Date | null
  userInfos?: UserInfos | null
  onDone: () => void
}

export function CourrierPDFDownload({
  reference,
  objet,
  corps,
  destinataire,
  lieu,
  modeEnvoi,
  copies,
  signataireNom,
  signataireFonction,
  dateEnvoi,
  userInfos,
  onDone,
}: Props) {
  useEffect(() => {
    async function generate() {
      try {
        const blob = await pdf(
          <CourrierPDF
            nomSociete={userInfos?.nomSociete}
            logoSociete={userInfos?.logoSociete}
            adresseSociete={userInfos?.adresseSociete}
            telSociete={userInfos?.telSociete}
            faxSociete={userInfos?.faxSociete}
            certifications={userInfos?.certifications}
            destinataire={destinataire}
            lieu={lieu}
            modeEnvoi={modeEnvoi}
            reference={reference}
            objet={objet}
            corps={corps}
            copies={copies}
            signataireNom={signataireNom}
            signataireFonction={signataireFonction}
            dateEnvoi={dateEnvoi}
          />
        ).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `courrier_${(objet || reference || 'sans-ref').slice(0, 60).replace(/[^\w\dàâéèêëîïôùûüç -]/gi, '').replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('Erreur generation PDF courrier:', err)
      } finally {
        onDone()
      }
    }

    generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
