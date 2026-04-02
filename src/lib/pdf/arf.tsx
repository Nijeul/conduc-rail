import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ARFRow } from '@/actions/arf'
import { EntetePDF, PiedPagePDF } from './pdf-entete'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 25,
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
  colJour: { width: 70 },
  colPoste: { width: 40, textAlign: 'center' },
  colHeure: { width: 55, textAlign: 'center' },
  colDuree: { width: 55, textAlign: 'right' },
  colPct: { width: 55, textAlign: 'right' },
  footerRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 3,
    borderTopWidth: 2,
    borderTopColor: '#004489',
    backgroundColor: '#003370',
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#B5ABA1',
    borderTopWidth: 0.5,
    borderTopColor: '#DCDCDC',
    paddingTop: 5,
  },
})

function formatDateFR(dateStr: string): string {
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

function calcDureeMinutes(debut: string, fin: string, posteNuit: boolean): number {
  const [dH, dM] = debut.split(':').map(Number)
  const [fH, fM] = fin.split(':').map(Number)
  let debutMin = dH * 60 + dM
  let finMin = fH * 60 + fM
  if (posteNuit && finMin <= debutMin) {
    finMin += 24 * 60
  }
  return finMin - debutMin
}

function formatDuree(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  const sign = minutes < 0 ? '-' : ''
  if (h === 0) return `${sign}${m}min`
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h${m.toString().padStart(2, '0')}`
}

function computeRow(row: ARFRow) {
  const finEffective = row.heureRestituee || row.heureFin
  let dureeReelleMin: number | null = null
  let dureePrevueMin: number | null = null
  let pourcentTemps: number | null = null

  if (row.heureDebut && finEffective) {
    dureeReelleMin = calcDureeMinutes(row.heureDebut, finEffective, row.posteNuit)
  }
  if (row.heureDebutPrevue && row.heureFinPrevue) {
    dureePrevueMin = calcDureeMinutes(
      row.heureDebutPrevue,
      row.heureFinPrevue,
      row.posteNuit
    )
  }
  if (dureeReelleMin !== null && dureePrevueMin !== null && dureePrevueMin > 0) {
    pourcentTemps = (dureeReelleMin / dureePrevueMin) * 100
  }

  return { dureeReelleMin, dureePrevueMin, pourcentTemps }
}

function getPourcentColor(pct: number | null): string {
  if (pct === null) return '#004489'
  if (pct >= 95) return '#2E7D32'
  if (pct >= 90) return '#F57F17'
  return '#E20025'
}

function getDureeBg(minutes: number | null): string | undefined {
  if (minutes === null) return undefined
  if (minutes > 12 * 60) return '#FFEBEE'
  if (minutes > 10 * 60) return '#FFF8E1'
  return undefined
}

interface Props {
  projetName: string
  rows: ARFRow[]
  totalMinutes: number
  userLogo?: string
  nomSociete?: string
  user?: { logoSociete?: string | null; nomSociete?: string | null }
}

export function ARFPDF({ projetName, rows, totalMinutes, userLogo, nomSociete, user }: Props) {
  const logo = user?.logoSociete ?? userLogo
  const societe = user?.nomSociete ?? nomSociete
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <EntetePDF
          titrePDF="SUIVI ARF"
          projetName={projetName}
          date={today}
          logoSociete={logo}
          nomSociete={societe}
        />

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colJour]}>Jour</Text>
          <Text style={[styles.tableHeaderText, styles.colPoste]}>Poste</Text>
          <Text style={[styles.tableHeaderText, styles.colHeure]}>
            Debut prevu
          </Text>
          <Text style={[styles.tableHeaderText, styles.colHeure]}>
            Fin prevue
          </Text>
          <Text style={[styles.tableHeaderText, styles.colHeure]}>
            Debut reel
          </Text>
          <Text style={[styles.tableHeaderText, styles.colHeure]}>
            Fin reelle
          </Text>
          <Text style={[styles.tableHeaderText, styles.colHeure]}>
            Restitution
          </Text>
          <Text style={[styles.tableHeaderText, styles.colDuree]}>Duree</Text>
          <Text style={[styles.tableHeaderText, styles.colPct]}>% temps</Text>
        </View>

        {/* Table Body */}
        {rows.map((row, i) => {
          const { dureeReelleMin, pourcentTemps } = computeRow(row)
          const dureeBg = getDureeBg(dureeReelleMin)
          const isManuelle = row.source === 'manuelle'
          const rowBg = isManuelle
            ? { backgroundColor: '#FFFDE7' }
            : i % 2 !== 0
              ? styles.rowAlt
              : {}

          return (
            <View
              key={row.id}
              style={[styles.tableRow, rowBg]}
              wrap={false}
            >
              <Text style={styles.colJour}>
                {formatDateFR(row.date)}{isManuelle ? ' \u270F' : ''}
              </Text>
              <Text style={styles.colPoste}>
                {row.posteNuit ? 'Nuit' : 'Jour'}
              </Text>
              <Text style={styles.colHeure}>
                {row.heureDebutPrevue || '\u2014'}
              </Text>
              <Text style={styles.colHeure}>
                {row.heureFinPrevue || '\u2014'}
              </Text>
              <Text style={styles.colHeure}>
                {row.heureDebut || '\u2014'}
              </Text>
              <Text style={styles.colHeure}>
                {row.heureFin || '\u2014'}
              </Text>
              <Text style={styles.colHeure}>
                {row.heureRestituee || '\u2014'}
              </Text>
              <View
                style={[
                  styles.colDuree,
                  dureeBg ? { backgroundColor: dureeBg } : {},
                ]}
              >
                <Text style={{ textAlign: 'right' }}>
                  {dureeReelleMin !== null ? formatDuree(dureeReelleMin) : '\u2014'}
                </Text>
              </View>
              <Text
                style={[
                  styles.colPct,
                  { color: getPourcentColor(pourcentTemps) },
                ]}
              >
                {pourcentTemps !== null
                  ? `${pourcentTemps.toFixed(1)} %`
                  : '\u2014'}
              </Text>
            </View>
          )
        })}

        {/* Footer total row */}
        <View style={styles.footerRow}>
          <Text
            style={{
              flex: 1,
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: 9,
            }}
          >
            Total cumule : {formatDuree(totalMinutes)}
          </Text>
        </View>

        {/* Page footer */}
        <PiedPagePDF nomSociete={societe} projetName={projetName} />
      </Page>
    </Document>
  )
}
