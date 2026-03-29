'use client'

import { useEffect } from 'react'
import { pdf } from '@react-pdf/renderer'
import { CourrierPDF } from '@/lib/pdf/courrier'

interface ProjetInfos {
  name?: string | null
  moaNom?: string | null
  moaPrenom?: string | null
  moaAdresse?: string | null
  numeroAffaire?: string | null
  numeroOTP?: string | null
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

interface Props {
  reference: string
  objet: string
  corps: string
  dateEnvoi?: Date | null
  projetInfos: ProjetInfos
  userInfos?: UserInfos | null
  onDone: () => void
}

export function CourrierPDFDownload({
  reference,
  objet,
  corps,
  dateEnvoi,
  projetInfos,
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
            signataireName={userInfos?.name}
            moaPrenom={projetInfos.moaPrenom}
            moaNom={projetInfos.moaNom}
            moaAdresse={projetInfos.moaAdresse}
            objet={objet}
            reference={reference}
            numeroAffaire={projetInfos.numeroAffaire}
            numeroOTP={projetInfos.numeroOTP}
            corps={corps}
            dateEnvoi={dateEnvoi}
          />
        ).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `courrier_${reference || 'sans-ref'}.pdf`
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
