import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { EntetePDF, PiedPagePDF } from './pdf-entete'

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
    borderBottomColor: '#004489',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004489',
  },
  headerSub: {
    fontSize: 9,
    color: '#5A5A5A',
  },
  refs: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
    fontSize: 8,
    color: '#5A5A5A',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#004489',
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 7,
  },
  chapitreRow: {
    backgroundColor: '#004489',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  chapitreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCDC',
  },
  rowAlt: {
    backgroundColor: '#F0F0F0',
  },
  colPrevuDCE: { width: '17%', paddingRight: 3 },
  colPhaseTransitoire: { width: '17%', paddingRight: 3 },
  colExe: { width: '14%', paddingRight: 3 },
  colImpacts: { width: '22%', paddingRight: 3 },
  colDelais: { width: '15%', paddingRight: 3 },
  colCout: { width: '15%' },
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
    color: '#B5ABA1',
    borderTopWidth: 0.5,
    borderTopColor: '#DCDCDC',
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
  chapitre: string
  estChapitre: boolean
}

interface Props {
  projetName: string
  lignes: LignePDF[]
  user?: { logoSociete?: string | null; nomSociete?: string | null }
}

export function FicheEcartTablePDF({ projetName, lignes, user }: Props) {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  let dataRowIndex = 0

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <EntetePDF
          titrePDF="FICHE ECART"
          projetName={projetName}
          date={today}
          logoSociete={user?.logoSociete}
          nomSociete={user?.nomSociete}
        />

        {/* Table header */}
        <View style={styles.tableHeader}>
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
        {lignes.map((ligne, i) => {
          if (ligne.estChapitre) {
            // Chapter header row
            return (
              <View key={i} style={styles.chapitreRow} wrap={false}>
                <Text style={styles.chapitreText}>{ligne.chapitre}</Text>
              </View>
            )
          }

          // Data row
          const rowIdx = dataRowIndex++
          return (
            <View
              key={i}
              style={[styles.tableRow, rowIdx % 2 !== 0 ? styles.rowAlt : {}]}
              wrap={false}
            >
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
          )
        })}

        {/* Footer */}
        <PiedPagePDF nomSociete={user?.nomSociete} projetName={projetName} />
      </Page>
    </Document>
  )
}
