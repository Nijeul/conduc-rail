import { View, Text, Image, StyleSheet } from '@react-pdf/renderer'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function logoValide(logo: string | null | undefined): boolean {
  if (!logo) return false
  return (
    logo.startsWith('data:image/png;base64,') ||
    logo.startsWith('data:image/jpeg;base64,') ||
    logo.startsWith('data:image/jpg;base64,') ||
    logo.startsWith('data:image/webp;base64,')
  )
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#004489',
  },
  headerLeft: {},
  headerLogo: {
    width: 55,
    height: 35,
    objectFit: 'contain',
  },
  headerBrand: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
  },
  headerProjet: {
    fontSize: 10,
    color: '#5A5A5A',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitre: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
  },
  headerDate: {
    fontSize: 10,
    color: '#5A5A5A',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#B5ABA1',
    borderTopWidth: 0.5,
    borderTopColor: '#DCDCDC',
    paddingTop: 5,
  },
})

// ---------------------------------------------------------------------------
// EntetePDF
// ---------------------------------------------------------------------------

interface EntetePDFProps {
  titrePDF: string
  projetName: string
  date?: string
  logoSociete?: string | null
  nomSociete?: string | null
}

export function EntetePDF({
  titrePDF,
  projetName,
  date,
  logoSociete,
  nomSociete,
}: EntetePDFProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {logoValide(logoSociete) ? (
          <Image src={logoSociete!} style={styles.headerLogo} />
        ) : (
          <Text style={styles.headerBrand}>{nomSociete || ''}</Text>
        )}
        <Text style={styles.headerProjet}>{projetName}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerTitre}>{titrePDF}</Text>
        {date ? <Text style={styles.headerDate}>{date}</Text> : null}
      </View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// PiedPagePDF
// ---------------------------------------------------------------------------

interface PiedPagePDFProps {
  nomSociete?: string | null
  projetName: string
}

export function PiedPagePDF({ nomSociete, projetName }: PiedPagePDFProps) {
  const label = [nomSociete, projetName].filter(Boolean).join(' \u2014 ')

  return (
    <View style={styles.footer} fixed>
      <Text>{label}</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  )
}
