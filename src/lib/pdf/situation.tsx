import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { SituationResult } from '@/actions/situation'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 30,
    orientation: 'landscape',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#004489',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004489',
  },
  headerSub: {
    fontSize: 10,
    color: '#5A5A5A',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#004489',
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
    borderBottomColor: '#DCDCDC',
  },
  rowAlt: {
    backgroundColor: '#F0F0F0',
  },
  colCode: { width: 70 },
  colDesignation: { flex: 1 },
  colUnite: { width: 50, textAlign: 'center' },
  colQteMarche: { width: 80, textAlign: 'right' },
  colQteReal: { width: 80, textAlign: 'right' },
  colAvancement: { width: 90, textAlign: 'right' },
  footerRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderTopWidth: 2,
    borderTopColor: '#004489',
    backgroundColor: '#003370',
    color: '#FFFFFF',
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

function formatFR(n: number, dec = 2): string {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  })
}

function formatMontantFR(n: number): string {
  return n.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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

function getAvancementBg(avancement: number): string {
  if (avancement >= 100) return '#E8F5E9'
  if (avancement >= 50) return '#FFF8E1'
  return '#FFEBEE'
}

interface Props {
  projetName: string
  data: SituationResult
  userLogo?: string
  nomSociete?: string
}

export function SituationPDF({ projetName, data, userLogo, nomSociete }: Props) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
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
            <Text style={styles.headerSub}>Situation de Travaux</Text>
            <Text style={styles.headerSub}>
              Du {formatDateDisplay(data.dateDebut)} au{' '}
              {formatDateDisplay(data.dateFin)}
            </Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colCode]}>N° prix</Text>
          <Text style={[styles.tableHeaderText, styles.colDesignation]}>
            Intitule
          </Text>
          <Text style={[styles.tableHeaderText, styles.colUnite]}>Unite</Text>
          <Text style={[styles.tableHeaderText, styles.colQteMarche]}>
            Qte marche
          </Text>
          <Text style={[styles.tableHeaderText, styles.colQteReal]}>
            Qte realisee
          </Text>
          <Text style={[styles.tableHeaderText, styles.colAvancement]}>
            Avancement %
          </Text>
        </View>

        {/* Table Body */}
        {data.lignes.map((l, i) => (
          <View
            key={l.id}
            style={[
              styles.tableRow,
              i % 2 !== 0 ? styles.rowAlt : {},
            ]}
          >
            <Text style={styles.colCode}>{l.code}</Text>
            <Text style={styles.colDesignation}>{l.designation}</Text>
            <Text style={styles.colUnite}>{l.unite}</Text>
            <Text style={styles.colQteMarche}>{formatFR(l.quantiteMarche)}</Text>
            <Text style={styles.colQteReal}>{formatFR(l.quantiteRealisee)}</Text>
            <View
              style={[
                styles.colAvancement,
                { backgroundColor: getAvancementBg(l.avancement) },
              ]}
            >
              <Text style={{ textAlign: 'right' }}>
                {formatFR(l.avancement, 1)} %
              </Text>
            </View>
          </View>
        ))}

        {/* Footer total row */}
        <View style={styles.footerRow}>
          <Text
            style={{
              flex: 1,
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: 10,
            }}
          >
            Montant realise HT : {formatMontantFR(data.totalMontantRealise)}
          </Text>
        </View>

        {/* Page footer */}
        <View style={styles.footer} fixed>
          <Text>{nomSociete ?? 'CONDUC RAIL'} - {projetName}</Text>
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
