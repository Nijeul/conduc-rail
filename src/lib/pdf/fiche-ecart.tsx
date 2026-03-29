import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#263238',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263238',
  },
  headerSub: {
    fontSize: 9,
    color: '#546E7A',
  },
  refs: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
    fontSize: 8,
    color: '#546E7A',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#263238',
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 7,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ECEFF1',
  },
  rowAlt: {
    backgroundColor: '#F5F7FA',
  },
  colEtude: { width: '16%', paddingRight: 3 },
  colPrevuDCE: { width: '14%', paddingRight: 3 },
  colPhaseTransitoire: { width: '14%', paddingRight: 3 },
  colExe: { width: '12%', paddingRight: 3 },
  colImpacts: { width: '18%', paddingRight: 3 },
  colDelais: { width: '13%', paddingRight: 3 },
  colCout: { width: '13%' },
  cellText: {
    fontSize: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#78909C',
    borderTopWidth: 0.5,
    borderTopColor: '#ECEFF1',
    paddingTop: 5,
  },
})

interface LignePDF {
  etude: string
  prevuDCE: string
  phaseTransitoire: string
  exe: string
  impacts: string
  delaisImpactes: string
  coutImpactes: string
}

interface Props {
  projetName: string
  lignes: LignePDF[]
}

export function FicheEcartTablePDF({ projetName, lignes }: Props) {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>CONDUC RAIL</Text>
            <Text style={styles.headerSub}>
              FICHE ECART — {projetName}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.headerSub}>Date : {today}</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colEtude]}>ETUDE</Text>
          <Text style={[styles.tableHeaderText, styles.colPrevuDCE]}>
            Prevu au DCE
          </Text>
          <Text style={[styles.tableHeaderText, styles.colPhaseTransitoire]}>
            Phase transitoire
          </Text>
          <Text style={[styles.tableHeaderText, styles.colExe]}>EXE</Text>
          <Text style={[styles.tableHeaderText, styles.colImpacts]}>
            Impacts et consequences
          </Text>
          <Text style={[styles.tableHeaderText, styles.colDelais]}>
            Delais impactes
          </Text>
          <Text style={[styles.tableHeaderText, styles.colCout]}>
            Couts impactes
          </Text>
        </View>

        {/* Table rows */}
        {lignes.map((ligne, i) => (
          <View
            key={i}
            style={[styles.tableRow, i % 2 !== 0 ? styles.rowAlt : {}]}
            wrap={false}
          >
            <Text style={[styles.cellText, styles.colEtude]}>
              {ligne.etude}
            </Text>
            <Text style={[styles.cellText, styles.colPrevuDCE]}>
              {ligne.prevuDCE}
            </Text>
            <Text style={[styles.cellText, styles.colPhaseTransitoire]}>
              {ligne.phaseTransitoire}
            </Text>
            <Text style={[styles.cellText, styles.colExe]}>{ligne.exe}</Text>
            <Text style={[styles.cellText, styles.colImpacts]}>
              {ligne.impacts}
            </Text>
            <Text style={[styles.cellText, styles.colDelais]}>
              {ligne.delaisImpactes}
            </Text>
            <Text style={[styles.cellText, styles.colCout]}>
              {ligne.coutImpactes}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>CONDUC RAIL - {projetName}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
