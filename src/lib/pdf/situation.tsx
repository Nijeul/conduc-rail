import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { SituationResult } from '@/actions/situation'
import { EntetePDF, PiedPagePDF } from './pdf-entete'

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
  colCode: { width: 60 },
  colDesignation: { flex: 1 },
  colUnite: { width: 40, textAlign: 'center' },
  colPU: { width: 60, textAlign: 'right' },
  colQteMarche: { width: 60, textAlign: 'right' },
  colQteReal: { width: 60, textAlign: 'right' },
  colMontant: { width: 70, textAlign: 'right' },
  colAvancement: { width: 65, textAlign: 'right' },
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

// Formatage compatible react-pdf (pas d'espaces insécables)
function formatFR(n: number, dec = 2): string {
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).replace(/\u00A0/g, ' ').replace(/\u202F/g, ' ')
}

function formatMontantFR(n: number): string {
  return n.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/\u00A0/g, ' ').replace(/\u202F/g, ' ')
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
  if (avancement >= 100) return '#E8EFDA'
  if (avancement >= 75) return '#FFF7D1'
  if (avancement >= 50) return '#F9E9D9'
  return '#FDEAED'
}

function getAvancementColor(avancement: number): string {
  if (avancement >= 100) return '#5E8019'
  if (avancement >= 75) return '#DD9412'
  if (avancement >= 50) return '#C26A32'
  return '#E20025'
}

interface Props {
  projetName: string
  data: SituationResult
  userLogo?: string
  nomSociete?: string
  user?: { logoSociete?: string | null; nomSociete?: string | null }
}

export function SituationPDF({ projetName, data, userLogo, nomSociete, user }: Props) {
  const logo = user?.logoSociete ?? userLogo
  const societe = user?.nomSociete ?? nomSociete

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <EntetePDF
          titrePDF="SITUATION DE TRAVAUX"
          projetName={projetName}
          date={`Du ${formatDateDisplay(data.dateDebut)} au ${formatDateDisplay(data.dateFin)}`}
          logoSociete={logo}
          nomSociete={societe}
        />

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colCode]}>N° prix</Text>
          <Text style={[styles.tableHeaderText, styles.colDesignation]}>Intitulé</Text>
          <Text style={[styles.tableHeaderText, styles.colUnite]}>Unité</Text>
          <Text style={[styles.tableHeaderText, styles.colPU]}>PU HT</Text>
          <Text style={[styles.tableHeaderText, styles.colQteMarche]}>Qté marché</Text>
          <Text style={[styles.tableHeaderText, styles.colQteReal]}>Qté réalisée</Text>
          <Text style={[styles.tableHeaderText, styles.colMontant]}>Montant réalisé</Text>
          <Text style={[styles.tableHeaderText, styles.colAvancement]}>Avmt. %</Text>
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
            <Text style={[styles.colCode, { fontSize: 7 }]}>{l.code}</Text>
            <Text style={[styles.colDesignation, { fontSize: 7 }]}>{l.designation}</Text>
            <Text style={styles.colUnite}>{l.unite}</Text>
            <Text style={styles.colPU}>{formatMontantFR(l.prixUnitaire)}</Text>
            <Text style={styles.colQteMarche}>{formatFR(l.quantiteMarche)}</Text>
            <Text style={styles.colQteReal}>{formatFR(l.quantiteRealisee)}</Text>
            <Text style={[styles.colMontant, { fontWeight: 'bold' }]}>{formatMontantFR(l.montantRealise)}</Text>
            <View
              style={[
                styles.colAvancement,
                {
                  backgroundColor: getAvancementBg(l.avancement),
                  borderRadius: 2,
                  paddingVertical: 2,
                  paddingHorizontal: 4,
                },
              ]}
            >
              <Text style={{
                textAlign: 'right',
                color: getAvancementColor(l.avancement),
                fontWeight: 'bold',
                fontSize: 8,
              }}>
                {formatFR(l.avancement, 1)} %
              </Text>
            </View>
          </View>
        ))}

        {/* Footer total row */}
        <View style={{
          flexDirection: 'row',
          marginTop: 8,
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <View style={{
            flex: 1,
            backgroundColor: '#003370',
            paddingVertical: 8,
            paddingHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: 'bold' }}>
              MONTANT RÉALISÉ HT
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>
              {formatMontantFR(data.totalMontantRealise)}
            </Text>
          </View>
        </View>

        {/* Page footer */}
        <PiedPagePDF nomSociete={societe} projetName={projetName} />
      </Page>
    </Document>
  )
}
