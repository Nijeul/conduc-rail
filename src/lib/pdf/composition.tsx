import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'

const TYPE_COLORS: Record<string, string> = {
  Loco: '#FF8F00',
  Wagon: '#1565C0',
  Locotracteur: '#2E7D32',
  Draisine: '#6A1B9A',
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingTop: 25,
    paddingBottom: 45,
    paddingHorizontal: 25,
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 4,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#37474F',
  },
  infoValue: {
    color: '#263238',
  },
  rameContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 15,
    height: 35,
  },
  rameBlock: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    padding: 2,
  },
  rameBlockText: {
    color: 'white',
    fontSize: 6,
    fontWeight: 'bold',
  },
  mainContent: {
    flexDirection: 'row',
    gap: 10,
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#263238',
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 7,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ECEFF1',
  },
  rowAlt: {
    backgroundColor: '#F5F7FA',
  },
  propCol: {
    width: 90,
    fontWeight: 'bold',
    color: '#37474F',
    backgroundColor: '#F5F7FA',
    paddingRight: 4,
  },
  valCol: {
    textAlign: 'center',
  },
  summaryPanel: {
    width: 160,
    backgroundColor: '#F5F7FA',
    borderRadius: 3,
    padding: 8,
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 7,
    color: '#546E7A',
  },
  summaryValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#263238',
  },
  badgeGreen: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  badgeRed: {
    backgroundColor: '#FFCDD2',
    color: '#B71C1C',
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 25,
    right: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#78909C',
    borderTopWidth: 0.5,
    borderTopColor: '#ECEFF1',
    paddingTop: 4,
  },
})

interface Vehicule {
  id: string
  type: string
  designation: string
  nombre: number
  capEssieuxFreines: number
  nbEssieux: number
  poidsEntrant: number
  poidsSortant: number
  longueur: number
  capTraction: number
  commentaires: string
}

interface Summary {
  capEssieux: number
  nbEssieux: number
  capTraction: number
  poidsEntrant: number
  poidsSortant: number
  longueur: number
  freinageOk: boolean
  tractionOk: boolean
}

interface CompositionPDFData {
  titre: string
  date: string
  sens: string
  vehicules: Vehicule[]
  summary: Summary
}

interface Props {
  projetName: string
  data: CompositionPDFData
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

function fmt(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}

const PROPERTIES = [
  { key: 'type', label: 'Type' },
  { key: 'designation', label: 'Designation' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'capEssieuxFreines', label: 'Cap. essieux freines' },
  { key: 'nbEssieux', label: 'Nb Essieux' },
  { key: 'poidsEntrant', label: 'Poids Entrant (T)' },
  { key: 'poidsSortant', label: 'Poids Sortant (T)' },
  { key: 'longueur', label: 'Longueur (m)' },
  { key: 'capTraction', label: 'Cap. traction (T)' },
  { key: 'commentaires', label: 'Commentaires' },
]

export function CompositionPDF({ projetName, data, userLogo, nomSociete }: Props) {
  const { vehicules, summary } = data
  const totalNombre = vehicules.reduce((s, v) => s + (v.nombre || 1), 0)
  const colWidth = vehicules.length > 0 ? Math.max(50, Math.floor(500 / vehicules.length)) : 80

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
            <Text style={styles.headerSub}>Composition TTx</Text>
            <Text style={styles.headerSub}>{formatDateDisplay(data.date)}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Titre : </Text>
            <Text style={styles.infoValue}>{data.titre || '-'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sens : </Text>
            <Text style={styles.infoValue}>{data.sens}</Text>
          </View>
        </View>

        {/* Rame visuelle */}
        <View style={styles.rameContainer}>
          {vehicules.map((v, i) => {
            const bgColor = TYPE_COLORS[v.type] || '#78909C'
            const widthPercent = Math.max(
              ((v.nombre || 1) / Math.max(totalNombre, 1)) * 100,
              8
            )
            return (
              <View
                key={i}
                style={[
                  styles.rameBlock,
                  {
                    backgroundColor: bgColor,
                    width: `${widthPercent}%`,
                    minWidth: 35,
                  },
                ]}
              >
                <Text style={styles.rameBlockText}>{v.type}</Text>
                <Text style={[styles.rameBlockText, { fontSize: 5 }]}>
                  x{v.nombre || 1}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { width: 90 }]}>Propriete</Text>
              {vehicules.map((v, i) => (
                <Text
                  key={i}
                  style={[styles.tableHeaderText, { width: colWidth, textAlign: 'center' }]}
                >
                  V{i + 1}
                </Text>
              ))}
            </View>
            {PROPERTIES.map((prop, rowIdx) => (
              <View
                key={prop.key}
                style={[styles.tableRow, rowIdx % 2 !== 0 ? styles.rowAlt : {}]}
              >
                <Text style={styles.propCol}>{prop.label}</Text>
                {vehicules.map((v, colIdx) => {
                  const val = v[prop.key as keyof Vehicule]
                  const display = typeof val === 'number' ? String(val) : String(val || '')
                  return (
                    <Text key={colIdx} style={[styles.valCol, { width: colWidth }]}>
                      {display}
                    </Text>
                  )
                })}
              </View>
            ))}
          </View>

          {/* Summary Panel */}
          <View style={styles.summaryPanel}>
            <Text style={styles.summaryTitle}>Resume</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cap. ess. freines</Text>
              <Text style={styles.summaryValue}>{fmt(summary.capEssieux)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nb essieux rame</Text>
              <Text style={styles.summaryValue}>{fmt(summary.nbEssieux)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cap. traction (T)</Text>
              <Text style={styles.summaryValue}>{fmt(summary.capTraction)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Poids Entrant (T)</Text>
              <Text style={styles.summaryValue}>{fmt(summary.poidsEntrant)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Poids Sortant (T)</Text>
              <Text style={styles.summaryValue}>{fmt(summary.poidsSortant)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Longueur rame (m)</Text>
              <Text style={styles.summaryValue}>{fmt(summary.longueur)}</Text>
            </View>
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: '#ECEFF1',
                paddingTop: 4,
                marginTop: 4,
              }}
            >
              <View style={[styles.summaryRow, { alignItems: 'center' }]}>
                <Text style={styles.summaryLabel}>Freinage</Text>
                <Text style={summary.freinageOk ? styles.badgeGreen : styles.badgeRed}>
                  {summary.freinageOk ? 'assure' : 'insuffisant'}
                </Text>
              </View>
              <View style={[styles.summaryRow, { alignItems: 'center' }]}>
                <Text style={styles.summaryLabel}>Traction</Text>
                <Text style={summary.tractionOk ? styles.badgeGreen : styles.badgeRed}>
                  {summary.tractionOk ? 'suffisante' : 'insuffisante'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
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
