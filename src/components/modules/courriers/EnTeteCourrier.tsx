interface EnTeteCourrierProps {
  nomSociete?: string | null
  adresseSociete?: string | null
  destinataire?: string | null
  lieu?: string | null
  modeEnvoi?: string | null
  objet: string
  reference: string
}

// Aperçu de la mise en page du courrier (fidèle au PDF généré)
export function EnTeteCourrier({
  nomSociete,
  adresseSociete,
  destinataire,
  lieu,
  modeEnvoi,
  objet,
  reference,
}: EnTeteCourrierProps) {
  const today = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const lieuDate = lieu?.trim() ? `${lieu.trim()}, le ${today}` : `Le ${today}`

  return (
    <div className="bg-white border border-[#DCDCDC] rounded-md p-6 text-sm space-y-4 shadow-sm">
      {/* Émetteur (haut gauche) */}
      <div>
        <p className="font-bold text-[#004489]">{nomSociete || '[Société]'}</p>
        {adresseSociete && (
          <p className="whitespace-pre-line text-xs text-[#5A5A5A]">{adresseSociete}</p>
        )}
      </div>

      {/* Destinataire + date (bloc droit) */}
      <div className="ml-[52%] space-y-2">
        <p className="whitespace-pre-line">
          {destinataire?.trim() || '[Destinataire\nFonction\nOrganisme\nAdresse]'}
        </p>
        <p className="pt-2">{lieuDate}</p>
        {modeEnvoi?.trim() && <p className="italic">{modeEnvoi}</p>}
      </div>

      {/* Réf. / Objet */}
      <div className="space-y-1 border-t border-[#DCDCDC] pt-3">
        <p className="font-bold">Ref : {reference || '[référence du marché]'}</p>
        <p className="font-bold">Objet : {objet || '[objet du courrier]'}</p>
      </div>
    </div>
  )
}
