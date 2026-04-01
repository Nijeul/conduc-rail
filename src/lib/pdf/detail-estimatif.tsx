import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { LigneDE } from '@prisma/client'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 10,
    color: '#5A5A5A',
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 2,
  },
  date: {
    fontSize: 9,
    color: '#5A5A5A',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#004489',
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCDC',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F0F0F0',
  },
  tableCell: {
    fontSize: 8,
    padding: 5,
    color: '#004489',
  },
  colCode: { width: '12%' },
  colDesignation: { width: '35%' },
  colUnite: { width: '8%' },
  colQuantite: { width: '13%', textAlign: 'right' },
  colPU: { width: '15%', textAlign: 'right' },
  colTotal: { width: '17%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#003370',
    backgroundColor: '#003370',
    marginTop: 4,
    paddingTop: 8,
    paddingBottom: 8,
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    width: '17%',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#B5ABA1',
  },
})

function formatNumber(n: number, decimals = 2): string {
  const parts = n.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join(',')
}

function formatDateFR(): string {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

interface DetailEstimatifPDFProps {
  lignes: LigneDE[]
  projetName: string
  totalHT: number
  userLogo?: string
  nomSociete?: string
}

export function DetailEstimatifPDF({
  lignes,
  projetName,
  totalHT,
  userLogo,
  nomSociete,
}: DetailEstimatifPDFProps) {
  const dateStr = formatDateFR()

  // Split lignes into pages of 30
  const LINES_PER_PAGE = 30
  const pages: LigneDE[][] = []
  for (let i = 0; i < lignes.length; i += LINES_PER_PAGE) {
    pages.push(lignes.slice(i, i + LINES_PER_PAGE))
  }
  if (pages.length === 0) pages.push([])

  const totalPages = pages.length

  return (
    <Document>
      {pages.map((pageLignes, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            {userLogo ? (
              <Image src={userLogo} style={{ width: 55, height: 35, objectFit: 'contain', marginBottom: 4 }} />
            ) : (
              <Text style={styles.headerTitle}>{nomSociete ?? 'CONDUC RAIL'}</Text>
            )}
            <Text style={styles.mainTitle}>DETAIL ESTIMATIF</Text>
            <Text style={styles.projectName}>{projetName}</Text>
            <Text style={styles.date}>Date : {dateStr}</Text>
          </View>

          {/* Table */}
          <View style={styles.table}>
            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colCode]}>N deg. de prix</Text>
              <Text style={[styles.tableHeaderCell, styles.colDesignation]}>Intitule</Text>
              <Text style={[styles.tableHeaderCell, styles.colUnite]}>Unite</Text>
              <Text style={[styles.tableHeaderCell, styles.colQuantite]}>Qte marche</Text>
              <Text style={[styles.tableHeaderCell, styles.colPU]}>PU HT (EUR)</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total HT (EUR)</Text>
            </View>

            {/* Table rows */}
            {pageLignes.map((ligne, i) => {
              const globalIndex = pageIndex * LINES_PER_PAGE + i
              const rowTotal = ligne.quantite * ligne.prixUnitaire
              return (
                <View
                  key={ligne.id}
                  style={[
                    styles.tableRow,
                    globalIndex % 2 === 0
                      ? styles.tableRowEven
                      : styles.tableRowOdd,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.colCode]}>
                    {ligne.code}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDesignation]}>
                    {ligne.designation}
                  </Text>
                  <Text style={[styles.tableCell, styles.colUnite]}>
                    {ligne.unite}
                  </Text>
                  <Text style={[styles.tableCell, styles.colQuantite]}>
                    {formatNumber(ligne.quantite, 3)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colPU]}>
                    {formatNumber(ligne.prixUnitaire, 2)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTotal]}>
                    {formatNumber(rowTotal, 2)} EUR
                  </Text>
                </View>
              )
            })}
          </View>

          {/* Total on last page only */}
          {pageIndex === totalPages - 1 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT :</Text>
              <Text style={styles.totalValue}>
                {formatNumber(totalHT, 2)} EUR
              </Text>
            </View>
          )}

          {/* Page footer */}
          <Text
            style={styles.footer}
            render={({ pageNumber, totalPages: tp }) =>
              `Page ${pageNumber} / ${tp}`
            }
            fixed
          />
        </Page>
      ))}
    </Document>
  )
}
