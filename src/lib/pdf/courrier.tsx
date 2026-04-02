import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import { PiedPagePDF } from './pdf-entete'

const BLEU = '#004489'
const GRIS_FONCE = '#004489'
const GRIS_MOYEN = '#5A5A5A'
const GRIS_CLAIR = '#DCDCDC'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 70,
    paddingHorizontal: 50,
    color: GRIS_FONCE,
  },
  // ---------- En-tete 2 colonnes ----------
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: BLEU,
  },
  headerLeft: {
    maxWidth: '50%',
  },
  headerLogo: {
    width: 80,
    height: 40,
    objectFit: 'contain',
    marginBottom: 6,
  },
  societeName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: BLEU,
    marginBottom: 2,
  },
  societeAdresse: {
    fontSize: 9,
    color: GRIS_MOYEN,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  societeTelFax: {
    fontSize: 9,
    color: GRIS_MOYEN,
    marginBottom: 1,
  },
  societeCertifications: {
    fontSize: 8,
    color: BLEU,
    marginTop: 4,
  },
  headerRight: {
    maxWidth: '45%',
    textAlign: 'right',
  },
  dateVille: {
    fontSize: 10,
    color: GRIS_FONCE,
    marginBottom: 14,
  },
  destinataireLabel: {
    fontSize: 8,
    color: GRIS_MOYEN,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  destinataireNom: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: GRIS_FONCE,
    marginBottom: 2,
  },
  destinataireAdresse: {
    fontSize: 9,
    color: GRIS_MOYEN,
    lineHeight: 1.4,
  },
  // ---------- References ----------
  referencesBlock: {
    marginBottom: 18,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: BLEU,
  },
  refRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  refLabel: {
    width: 120,
    fontSize: 9,
    color: GRIS_MOYEN,
  },
  refValue: {
    fontSize: 10,
    color: GRIS_FONCE,
  },
  // ---------- Objet ----------
  objetBlock: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRIS_CLAIR,
  },
  objetRow: {
    flexDirection: 'row',
  },
  objetLabel: {
    width: 120,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: GRIS_FONCE,
  },
  objetValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: GRIS_FONCE,
    flex: 1,
  },
  // ---------- Corps ----------
  corpsContainer: {
    marginBottom: 30,
  },
  corpsParagraph: {
    fontSize: 10,
    color: GRIS_FONCE,
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 6,
  },
  corpsBold: {
    fontFamily: 'Helvetica-Bold',
  },
  // ---------- Signature ----------
  signatureBlock: {
    marginTop: 40,
    alignItems: 'flex-end',
  },
  signatureNom: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: GRIS_FONCE,
  },
  signaturePoste: {
    fontSize: 9,
    color: GRIS_MOYEN,
    marginTop: 2,
  },
  // ---------- Pied de page ----------
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: GRIS_CLAIR,
    paddingTop: 8,
  },
  footerRef: {
    fontSize: 8,
    color: GRIS_MOYEN,
  },
  footerPage: {
    fontSize: 8,
    color: GRIS_MOYEN,
  },
})

export interface CourrierPDFProps {
  // Emetteur (from user profil)
  nomSociete?: string | null
  logoSociete?: string | null
  adresseSociete?: string | null
  telSociete?: string | null
  faxSociete?: string | null
  certifications?: string | null
  signataireName?: string | null
  signatairePoste?: string | null
  // Destinataire (from projet infos)
  moaPrenom?: string | null
  moaNom?: string | null
  moaAdresse?: string | null
  // Courrier content
  objet: string
  reference: string
  numeroAffaire?: string | null
  numeroOTP?: string | null
  corps: string
  dateEnvoi?: Date | null
  ville?: string | null
}

/**
 * Parses the body text handling line breaks and **bold** markers.
 * Returns an array of React-PDF elements.
 */
function renderCorps(corps: string) {
  const paragraphs = corps.split(/\n\n+/)
  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n')
    return (
      <View key={pIdx} style={styles.corpsParagraph}>
        {lines.map((line, lIdx) => {
          // Parse **bold** segments
          const parts = line.split(/(\*\*[^*]+\*\*)/)
          return (
            <Text key={lIdx}>
              {parts.map((part, sIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <Text key={sIdx} style={styles.corpsBold}>
                      {part.slice(2, -2)}
                    </Text>
                  )
                }
                return <Text key={sIdx}>{part}</Text>
              })}
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
  signataireName,
  signatairePoste,
  moaPrenom,
  moaNom,
  moaAdresse,
  objet,
  reference,
  numeroAffaire,
  numeroOTP,
  corps,
  dateEnvoi,
  ville,
}: CourrierPDFProps) {
  const dateStr = dateEnvoi
    ? new Date(dateEnvoi).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  const villeDate = ville ? `${ville}, le ${dateStr}` : `Le ${dateStr}`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ==================== EN-TETE 2 COLONNES ==================== */}
        <View style={styles.header}>
          {/* Colonne gauche : emetteur */}
          <View style={styles.headerLeft}>
            {logoSociete && (
              <Image src={logoSociete} style={styles.headerLogo} />
            )}
            <Text style={styles.societeName}>
              {nomSociete || ''}
            </Text>
            {adresseSociete && (
              <Text style={styles.societeAdresse}>{adresseSociete}</Text>
            )}
            {telSociete && (
              <Text style={styles.societeTelFax}>
                Tel. {telSociete}
                {faxSociete ? ` — Fax. ${faxSociete}` : ''}
              </Text>
            )}
            {!telSociete && faxSociete && (
              <Text style={styles.societeTelFax}>Fax. {faxSociete}</Text>
            )}
            {certifications && (
              <Text style={styles.societeCertifications}>
                {certifications}
              </Text>
            )}
          </View>

          {/* Colonne droite : date + destinataire */}
          <View style={styles.headerRight}>
            <Text style={styles.dateVille}>{villeDate}</Text>
            <Text style={styles.destinataireLabel}>A l&apos;attention de</Text>
            <Text style={styles.destinataireNom}>
              {moaPrenom || ''} {moaNom || ''}
            </Text>
            {moaAdresse && (
              <Text style={styles.destinataireAdresse}>{moaAdresse}</Text>
            )}
          </View>
        </View>

        {/* ==================== REFERENCES ==================== */}
        <View style={styles.referencesBlock}>
          {numeroAffaire && (
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>Ref. affaire :</Text>
              <Text style={styles.refValue}>{numeroAffaire}</Text>
            </View>
          )}
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Ref. courrier :</Text>
            <Text style={styles.refValue}>{reference}</Text>
          </View>
          {numeroOTP && (
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>N° OTP :</Text>
              <Text style={styles.refValue}>{numeroOTP}</Text>
            </View>
          )}
        </View>

        {/* ==================== OBJET ==================== */}
        <View style={styles.objetBlock}>
          <View style={styles.objetRow}>
            <Text style={styles.objetLabel}>Objet :</Text>
            <Text style={styles.objetValue}>{objet}</Text>
          </View>
        </View>

        {/* ==================== CORPS ==================== */}
        <View style={styles.corpsContainer}>{renderCorps(corps)}</View>

        {/* ==================== SIGNATURE ==================== */}
        {signataireName && (
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureNom}>{signataireName}</Text>
            {signatairePoste && (
              <Text style={styles.signaturePoste}>{signatairePoste}</Text>
            )}
          </View>
        )}

        {/* ==================== PIED DE PAGE ==================== */}
        <PiedPagePDF nomSociete={nomSociete} projetName={`Ref. ${reference}`} />
      </Page>
    </Document>
  )
}
