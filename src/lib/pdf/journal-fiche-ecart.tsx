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
  rowAlerte: {
    backgroundColor: '#FFEBEE',
  },
  colDate: { width: 70 },
  colNum: { width: 40, textAlign: 'center' },
  colDescription: { flex: 1 },
  colFichiers: { width: 80, textAlign: 'center' },
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

interface EvenementPDF {
  date: string
  titre: string
  description?: string
  categorie: string
  fichiersCount: number
}

interface Props {
  projetName: string
  evenements: EvenementPDF[]
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

export function FicheEcartPDF({ projetName, evenements }: Props) {
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>CONDUC RAIL</Text>
            <Text style={styles.headerSub}>{projetName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.headerSub}>Fiche Ecart - Journal de Chantier</Text>
            <Text style={styles.headerSub}>{today}</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
          <Text style={[styles.tableHeaderText, styles.colNum]}>N&deg;</Text>
          <Text style={[styles.tableHeaderText, styles.colDescription]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderText, styles.colFichiers]}>
            Fichiers
          </Text>
        </View>

        {/* Table rows */}
        {evenements.map((ev, i) => {
          const isAlerte = ev.categorie === 'alerte'
          return (
            <View
              key={i}
              style={[
                styles.tableRow,
                isAlerte
                  ? styles.rowAlerte
                  : i % 2 !== 0
                  ? styles.rowAlt
                  : {},
              ]}
              wrap={false}
            >
              <Text style={styles.colDate}>
                {formatDateDisplay(ev.date)}
              </Text>
              <Text style={styles.colNum}>
                {String(i + 1).padStart(3, '0')}
              </Text>
              <View style={styles.colDescription}>
                <Text style={{ fontWeight: 'bold' }}>{ev.titre}</Text>
                {ev.description ? (
                  <Text style={{ marginTop: 2, color: '#5A5A5A' }}>
                    {ev.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.colFichiers}>
                {ev.fichiersCount > 0 ? `${ev.fichiersCount} fichier(s)` : '-'}
              </Text>
            </View>
          )
        })}

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
