import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { ARFRow } from '@/actions/arf'

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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#263238',
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
    borderBottomColor: '#ECEFF1',
  },
  rowAlt: {
    backgroundColor: '#F5F7FA',
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
    borderTopColor: '#263238',
    backgroundColor: '#F5F7FA',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 25,
    right: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#78909C',
    borderTopWidth: 0.5,
    borderTopColor: '#ECEFF1',
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
  if (pct === null) return '#263238'
  if (pct >= 95) return '#2E7D32'
  if (pct >= 90) return '#F57F17'
  return '#B71C1C'
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
}

export function ARFPDF({ projetName, rows, totalMinutes, userLogo, nomSociete }: Props) {
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
            {userLogo ? (
              <Image src={userLogo} style={{ width: 55, height: 35, objectFit: 'contain' }} />
            ) : (
              <Text style={styles.headerTitle}>{nomSociete ?? 'CONDUC RAIL'}</Text>
            )}
            <Text style={styles.headerSub}>{projetName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.headerSub}>Suivi ARF</Text>
            <Text style={styles.headerSub}>{today}</Text>
          </View>
        </View>

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

          return (
            <View
              key={row.id}
              style={[styles.tableRow, i % 2 !== 0 ? styles.rowAlt : {}]}
              wrap={false}
            >
              <Text style={styles.colJour}>{formatDateFR(row.date)}</Text>
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
