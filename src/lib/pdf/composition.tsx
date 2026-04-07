import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { getMaterielSVGPDF } from './materiel-svg-pdf'
import { EntetePDF, PiedPagePDF } from './pdf-entete'

const TYPE_COLORS: Record<string, string> = {
  Loco: '#FF8F00',
  Wagon: '#004489',
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
    color: '#5A5A5A',
  },
  infoValue: {
    color: '#004489',
  },
  rameContainer: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 15,
    minHeight: 55,
    alignItems: 'flex-end',
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
  rameVehicule: {
    alignItems: 'center',
    width: 95,
  },
  rameSvgContainer: {
    position: 'relative',
    width: 90,
    height: 50,
  },
  rameBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#004489',
    color: 'white',
    fontSize: 6,
    fontWeight: 'bold',
    borderRadius: 7,
    width: 14,
    height: 14,
    textAlign: 'center',
    paddingTop: 2,
  },
  rameLabel: {
    fontSize: 5,
    color: '#5A5A5A',
    textAlign: 'center',
    marginTop: 1,
    maxWidth: 90,
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
    backgroundColor: '#004489',
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
    borderBottomColor: '#DCDCDC',
  },
  rowAlt: {
    backgroundColor: '#F0F0F0',
  },
  propCol: {
    width: 90,
    fontWeight: 'bold',
    color: '#5A5A5A',
    backgroundColor: '#F0F0F0',
    paddingRight: 4,
  },
  valCol: {
    textAlign: 'center',
  },
  summaryPanel: {
    width: 160,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    padding: 8,
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#004489',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 7,
    color: '#5A5A5A',
  },
  summaryValue: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#004489',
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
    color: '#E20025',
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
    color: '#B5ABA1',
    borderTopWidth: 0.5,
    borderTopColor: '#DCDCDC',
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
  user?: { logoSociete?: string | null; nomSociete?: string | null }
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
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 }).replace(/\u00A0/g, ' ').replace(/\u202F/g, ' ')
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

export function CompositionPDF({ projetName, data, userLogo, nomSociete, user }: Props) {
  const logo = user?.logoSociete ?? userLogo
  const societe = user?.nomSociete ?? nomSociete
  const { vehicules, summary } = data
  const totalNombre = vehicules.reduce((s, v) => s + (v.nombre || 1), 0)
  const colWidth = vehicules.length > 0 ? Math.max(50, Math.floor(500 / vehicules.length)) : 80

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <EntetePDF
          titrePDF="COMPOSITION TTx"
          projetName={projetName}
          date={formatDateDisplay(data.date)}
          logoSociete={logo}
          nomSociete={societe}
        />

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

        {/* Rame visuelle avec SVG */}
        <View style={styles.rameContainer}>
          {vehicules.map((v, i) => {
            const svgElement = getMaterielSVGPDF(v.type, v.designation)
            const bgColor = TYPE_COLORS[v.type] || '#B5ABA1'
            const nombre = v.nombre || 1
            const label =
              v.designation && v.designation.length > 16
                ? v.designation.substring(0, 16) + '...'
                : v.designation || v.type

            return (
              <View key={i} style={styles.rameVehicule}>
                <View style={styles.rameSvgContainer}>
                  {svgElement ? (
                    svgElement
                  ) : (
                    <View
                      style={[
                        styles.rameBlock,
                        {
                          backgroundColor: bgColor,
                          width: 90,
                          height: 50,
                        },
                      ]}
                    >
                      <Text style={styles.rameBlockText}>{v.type}</Text>
                    </View>
                  )}
                  {nombre > 1 && (
                    <View style={styles.rameBadge}>
                      <Text style={{ color: 'white', fontSize: 6, fontWeight: 'bold' }}>
                        x{nombre}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.rameLabel}>{label}</Text>
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
                borderTopColor: '#DCDCDC',
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
        <PiedPagePDF nomSociete={societe} projetName={projetName} />
      </Page>
    </Document>
  )
}
