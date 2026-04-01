interface EnTeteCourrierProps {
  nomSociete?: string | null
  moaPrenom?: string | null
  moaNom?: string | null
  moaAdresse?: string | null
  objet: string
  reference: string
  numeroAffaire?: string | null
  numeroOTP?: string | null
}

export function EnTeteCourrier({
  nomSociete,
  moaPrenom,
  moaNom,
  moaAdresse,
  objet,
  reference,
  numeroAffaire,
  numeroOTP,
}: EnTeteCourrierProps) {
  const today = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-[#F0F0F0] border border-border rounded-md p-6 text-sm space-y-4 font-mono">
      {/* Header line */}
      <div className="flex justify-between items-start">
        <span className="font-bold text-[#004489]">
          {nomSociete || 'CONDUC RAIL'}
        </span>
        <span className="text-text-secondary">Le {today}</span>
      </div>

      {/* Destinataire */}
      <div className="space-y-1">
        <p className="text-text-secondary">A l&apos;attention de :</p>
        <p className="font-medium">
          {moaPrenom || '[Prenom]'} {moaNom || '[Nom]'}
        </p>
        {moaAdresse && (
          <p className="whitespace-pre-line text-text-secondary">{moaAdresse}</p>
        )}
      </div>

      {/* References */}
      <div className="space-y-1 border-t border-border/50 pt-3">
        <p>
          <span className="text-text-secondary">Objet : </span>
          <span className="font-medium">{objet || '[objet]'}</span>
        </p>
        {numeroAffaire && (
          <p>
            <span className="text-text-secondary">Ref. affaire : </span>
            {numeroAffaire}
          </p>
        )}
        <p>
          <span className="text-text-secondary">Ref. courrier : </span>
          {reference || '[reference]'}
        </p>
        {numeroOTP && (
          <p>
            <span className="text-text-secondary">N° OTP : </span>
            {numeroOTP}
          </p>
        )}
      </div>
    </div>
  )
}
