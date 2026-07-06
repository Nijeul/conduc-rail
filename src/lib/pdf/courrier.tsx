import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

// Mise en page calquée sur le courrier type ETF (modèle « DAPT ») :
// logo + adresse agence en tête, bloc destinataire à droite, lieu/date et
// mention d'envoi à droite, Réf. et Objet en gras, corps justifié,
// signature à droite, liste des copies, pied de page société.

const NOIR = '#000000'
const GRIS = '#5A5A5A'
const GRIS_CLAIR = '#DCDCDC'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    paddingTop: 45,
    paddingBottom: 80,
    paddingHorizontal: 62,
    color: NOIR,
    lineHeight: 1.4,
  },
  // ---------- En-tête ----------
  header: {
    marginBottom: 8,
  },
  headerLogo: {
    width: 110,
    height: 45,
    objectFit: 'contain',
    objectPositionX: 0,
    marginBottom: 4,
  },
  societeName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  agenceLigne: {
    fontSize: 8.5,
    color: GRIS,
  },
  // ---------- Bloc destinataire (à droite) ----------
  blocDroite: {
    marginLeft: '52%',
  },
  destinataireLigne: {
    fontSize: 10.5,
  },
  lieuDate: {
    fontSize: 10.5,
    marginTop: 18,
  },
  modeEnvoi: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Oblique',
    marginTop: 8,
  },
  // ---------- Références ----------
  refBloc: {
    marginTop: 22,
    marginBottom: 14,
  },
  refLigne: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  // ---------- Corps ----------
  corpsParagraph: {
    fontSize: 10.5,
    textAlign: 'justify',
    marginBottom: 9,
    lineHeight: 1.45,
  },
  corpsBold: {
    fontFamily: 'Helvetica-Bold',
  },
  // ---------- Signature ----------
  signatureBloc: {
    marginTop: 28,
    marginLeft: '52%',
    marginBottom: 30,
  },
  signatureNom: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
  },
  signatureFonction: {
    fontSize: 10.5,
  },
  // ---------- Copies ----------
  copiesBloc: {
    marginTop: 10,
  },
  copiesLabel: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 3,
  },
  copiesLigne: {
    fontSize: 9,
    color: GRIS,
    lineHeight: 1.35,
  },
  // ---------- Pied de page ----------
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 62,
    right: 62,
    borderTopWidth: 0.5,
    borderTopColor: GRIS_CLAIR,
    paddingTop: 6,
  },
  footerTexte: {
    fontSize: 7,
    color: GRIS,
    textAlign: 'center',
    lineHeight: 1.4,
  },
  footerPage: {
    fontSize: 7,
    color: GRIS,
    textAlign: 'right',
    marginTop: 2,
  },
})

export interface CourrierPDFProps {
  // Émetteur (profil utilisateur)
  nomSociete?: string | null
  logoSociete?: string | null
  adresseSociete?: string | null
  telSociete?: string | null
  faxSociete?: string | null
  certifications?: string | null
  // Contenu du courrier
  destinataire?: string | null // bloc multi-lignes
  lieu?: string | null
  modeEnvoi?: string | null
  reference: string
  objet: string
  corps: string
  copies?: string | null // une ligne par destinataire en copie
  signataireNom?: string | null
  signataireFonction?: string | null
  dateEnvoi?: Date | null
}

function logoValide(logo: string | null | undefined): boolean {
  if (!logo) return false
  return /^data:image\/(png|jpeg|jpg|webp);base64,/.test(logo)
}

/** Corps : paragraphes séparés par ligne vide, gestion des segments **gras** */
function renderCorps(corps: string) {
  const paragraphs = corps.split(/\n\n+/)
  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n')
    return (
      <View key={pIdx} style={styles.corpsParagraph} wrap={false}>
        {lines.map((line, lIdx) => {
          const parts = line.split(/(\*\*[^*]+\*\*)/)
          return (
            <Text key={lIdx}>
              {parts.map((part, sIdx) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <Text key={sIdx} style={styles.corpsBold}>
                    {part.slice(2, -2)}
                  </Text>
                ) : (
                  <Text key={sIdx}>{part}</Text>
                )
              )}
              {lIdx < lines.length - 1 ? '\n' : ''}
            </Text>
          )
        })}
      </View>
    )
  })
}

export function CourrierPDF({
  nomSociete,
  logoSociete,
  adresseSociete,
  telSociete,
  faxSociete,
  certifications,
  destinataire,
  lieu,
  modeEnvoi,
  reference,
  objet,
  corps,
  copies,
  signataireNom,
  signataireFonction,
  dateEnvoi,
}: CourrierPDFProps) {
  const dateStr = (dateEnvoi ? new Date(dateEnvoi) : new Date()).toLocaleDateString(
    'fr-FR',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )
  const lieuDate = lieu?.trim() ? `${lieu.trim()}, le ${dateStr}` : `Le ${dateStr}`

  const lignesDestinataire = (destinataire || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const lignesCopies = (copies || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const lignesAgence = (adresseSociete || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const footerParts = [
    nomSociete,
    lignesAgence.join(', '),
    telSociete ? `Tél. : ${telSociete}` : null,
    faxSociete ? `Fax : ${faxSociete}` : null,
    certifications,
  ].filter(Boolean)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ==================== EN-TÊTE : logo + agence ==================== */}
        <View style={styles.header}>
          {logoValide(logoSociete) ? (
            <Image src={logoSociete!} style={styles.headerLogo} />
          ) : (
            <Text style={styles.societeName}>{nomSociete || ''}</Text>
          )}
          {lignesAgence.map((l, i) => (
            <Text key={i} style={styles.agenceLigne}>
              {l}
            </Text>
          ))}
        </View>

        {/* ==================== DESTINATAIRE (à droite) ==================== */}
        <View style={styles.blocDroite}>
          {lignesDestinataire.length > 0 ? (
            lignesDestinataire.map((l, i) => (
              <Text key={i} style={styles.destinataireLigne}>
                {l}
              </Text>
            ))
          ) : (
            <Text style={styles.destinataireLigne} />
          )}
          <Text style={styles.lieuDate}>{lieuDate}</Text>
          {modeEnvoi?.trim() ? (
            <Text style={styles.modeEnvoi}>{modeEnvoi.trim()}</Text>
          ) : null}
        </View>

        {/* ==================== RÉF. / OBJET ==================== */}
        <View style={styles.refBloc}>
          {reference?.trim() ? (
            <Text style={styles.refLigne}>Ref : {reference.trim()}</Text>
          ) : null}
          {objet?.trim() ? (
            <Text style={styles.refLigne}>Objet : {objet.trim()}</Text>
          ) : null}
        </View>

        {/* ==================== CORPS ==================== */}
        <View>{renderCorps(corps)}</View>

        {/* ==================== SIGNATURE ==================== */}
        {(signataireNom || signataireFonction) && (
          <View style={styles.signatureBloc} wrap={false}>
            {signataireNom ? (
              <Text style={styles.signatureNom}>{signataireNom}</Text>
            ) : null}
            {signataireFonction ? (
              <Text style={styles.signatureFonction}>{signataireFonction}</Text>
            ) : null}
          </View>
        )}

        {/* ==================== COPIES ==================== */}
        {lignesCopies.length > 0 && (
          <View style={styles.copiesBloc} wrap={false}>
            <Text style={styles.copiesLabel}>Copie :</Text>
            {lignesCopies.map((l, i) => (
              <Text key={i} style={styles.copiesLigne}>
                {l}
              </Text>
            ))}
          </View>
        )}

        {/* ==================== PIED DE PAGE ==================== */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerTexte}>{footerParts.join(' — ')}</Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) =>
              totalPages > 1 ? `Page ${pageNumber} / ${totalPages}` : ''
            }
          />
        </View>
      </Page>
    </Document>
  )
}
