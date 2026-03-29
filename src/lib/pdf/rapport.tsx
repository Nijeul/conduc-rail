import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#263238',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
  },
  headerSub: {
    fontSize: 10,
    color: '#546E7A',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#263238',
    backgroundColor: '#F5F7FA',
    padding: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  rowAlt: {
    backgroundColor: '#F5F7FA',
  },
  label: {
    width: 140,
    fontWeight: 'bold',
    color: '#37474F',
  },
  value: {
    flex: 1,
    color: '#263238',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#263238',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ECEFF1',
  },
  colCode: { width: 60 },
  colDesignation: { flex: 1 },
  colUnite: { width: 40, textAlign: 'center' },
  colQteMarche: { width: 70, textAlign: 'right' },
  colQteReal: { width: 80, textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#78909C',
    borderTopWidth: 0.5,
    borderTopColor: '#ECEFF1',
    paddingTop: 5,
  },
  signature: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
})

interface TravailRealise {
  code: string
  designation: string
  unite: string
  quantiteMarche: number
  quantiteRealisee: number
}

interface RapportPDFData {
  nomChantier: string
  titre: string
  date: string
  posteNuit: boolean
  heureDebutPrevue: string
  heureFinPrevue: string
  heureDebut: string
  heureFin: string
  heureRestituee: string
  production: string
  commentaire: string
  redacteurName: string
  dateRedaction: string
  valide: boolean
  travaux: TravailRealise[]
}

interface Props {
  projetName: string
  data: RapportPDFData
  userLogo?: string
  nomSociete?: string
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function RapportPDF({ projetName, data, userLogo, nomSociete }: Props) {
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {userLogo ? (
              <Image src={userLogo} style={{ width: 55, height: 35, objectFit: 'contain' }} />
            ) : (
              <Text style={styles.headerTitle}>{nomSociete ?? 'CONDUC RAIL'}</Text>
            )}
            <Text style={styles.headerSub}>{projetName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.headerSub}>Rapport Journalier</Text>
            <Text style={styles.headerSub}>{formatDateDisplay(data.date)}</Text>
          </View>
        </View>

        {/* Section Contexte Administratif */}
        <Text style={styles.sectionTitle}>Contexte Administratif</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nom du chantier :</Text>
          <Text style={styles.value}>{data.nomChantier || '-'}</Text>
        </View>
        <View style={[styles.row, styles.rowAlt]}>
          <Text style={styles.label}>Titre :</Text>
          <Text style={styles.value}>{data.titre || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date :</Text>
          <Text style={styles.value}>{formatDateDisplay(data.date)}</Text>
        </View>

        {/* Section Observations */}
        <Text style={styles.sectionTitle}>Observations</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Type de poste :</Text>
          <Text style={styles.value}>{data.posteNuit ? 'Nuit' : 'Jour'}</Text>
        </View>
        <View style={[styles.row, styles.rowAlt]}>
          <Text style={styles.label}>Heure debut :</Text>
          <Text style={styles.value}>{data.heureDebut || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Heure fin :</Text>
          <Text style={styles.value}>{data.heureFin || '-'}</Text>
        </View>
        <View style={[styles.row, styles.rowAlt]}>
          <Text style={styles.label}>Heure restituee :</Text>
          <Text style={styles.value}>{data.heureRestituee || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Production :</Text>
          <Text style={styles.value}>{data.production || '-'}</Text>
        </View>
        <View style={[styles.row, styles.rowAlt]}>
          <Text style={styles.label}>Commentaire :</Text>
          <Text style={styles.value}>{data.commentaire || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valide :</Text>
          <Text style={styles.value}>{data.valide ? 'Oui' : 'Non'}</Text>
        </View>

        {/* Travaux Realises */}
        {data.travaux.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Travaux Realises</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colCode]}>N° prix</Text>
              <Text style={[styles.tableHeaderText, styles.colDesignation]}>Intitule</Text>
              <Text style={[styles.tableHeaderText, styles.colUnite]}>Unite</Text>
              <Text style={[styles.tableHeaderText, styles.colQteMarche]}>Qte marche</Text>
              <Text style={[styles.tableHeaderText, styles.colQteReal]}>Qte realisee</Text>
            </View>
            {data.travaux.map((t, i) => (
              <View
                key={i}
                style={[styles.tableRow, i % 2 !== 0 ? styles.rowAlt : {}]}
              >
                <Text style={styles.colCode}>{t.code}</Text>
                <Text style={styles.colDesignation}>{t.designation}</Text>
                <Text style={styles.colUnite}>{t.unite}</Text>
                <Text style={styles.colQteMarche}>{t.quantiteMarche}</Text>
                <Text style={styles.colQteReal}>{t.quantiteRealisee}</Text>
              </View>
            ))}
          </>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={{ fontWeight: 'bold', color: '#263238' }}>
            Redacteur : {data.redacteurName || '-'}
          </Text>
          <Text style={{ color: '#546E7A', marginTop: 2 }}>
            Date de redaction : {formatDateDisplay(data.dateRedaction)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{nomSociete ?? 'CONDUC RAIL'} - {projetName}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
