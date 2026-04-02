import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'
import type { SoudureAluminothermique } from '@prisma/client'
import { COLUMN_GROUPS, ALL_COLUMNS, RECEPTION_COLORS, ROW_COLORS } from '@/components/modules/soudures/columns'
import { EntetePDF, PiedPagePDF } from './pdf-entete'

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#004489',
  },
  headerLeft: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
  },
  headerRight: {
    fontSize: 9,
    color: '#5A5A5A',
  },
  projectName: {
    fontSize: 10,
    color: '#5A5A5A',
    marginTop: 2,
  },
  table: {
    width: '100%',
  },
  groupHeaderRow: {
    flexDirection: 'row',
  },
  colHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#004489',
  },
  dataRow: {
    flexDirection: 'row',
    minHeight: 14,
  },
  cell: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRightWidth: 0.5,
    borderRightColor: '#DCDCDC',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCDC',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 7,
  },
  groupHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  colHeaderText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#004489',
  },
  statusBar: {
    flexDirection: 'row',
    backgroundColor: '#004489',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  statusText: {
    fontSize: 8,
    color: '#FFFFFF',
    marginRight: 20,
  },
  pageNumber: {
    fontSize: 7,
    color: '#5A5A5A',
    textAlign: 'right',
  },
})

// ─── Column widths (percentage based, total = 100%) ──────────────────────────

const TOTAL_W = ALL_COLUMNS.reduce((s, c) => s + c.width, 0)

function colWidth(w: number): string {
  return `${((w / TOTAL_W) * 100).toFixed(2)}%`
}

function groupWidth(cols: typeof ALL_COLUMNS): string {
  const w = cols.reduce((s, c) => s + c.width, 0)
  return `${((w / TOTAL_W) * 100).toFixed(2)}%`
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDatePDF(d: Date | string | null): string {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ─── Document ────────────────────────────────────────────────────────────────

interface SouduresPDFProps {
  projetName: string
  soudures: SoudureAluminothermique[]
  userLogo?: string
  nomSociete?: string
  user?: { logoSociete?: string | null; nomSociete?: string | null }
}

export function SouduresPDF({ projetName, soudures, userLogo, nomSociete, user }: SouduresPDFProps) {
  const logo = user?.logoSociete ?? userLogo
  const societe = user?.nomSociete ?? nomSociete
  const totalCount = soudures.length
  const okCount = soudures.filter((s) => s.reception === 'OK').length
  const hsCount = soudures.filter((s) => s.reception === 'HS').length
  const today = new Date().toLocaleDateString('fr-FR')

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <EntetePDF
          titrePDF="SOUDURES ALUMINOTHERMIQUES"
          projetName={projetName}
          date={today}
          logoSociete={logo}
          nomSociete={societe}
        />

        {/* Table */}
        <View style={styles.table}>
          {/* Group header row */}
          <View style={styles.groupHeaderRow}>
            {COLUMN_GROUPS.map((group) => (
              <View
                key={group.label}
                style={[
                  styles.cell,
                  {
                    width: groupWidth(group.columns),
                    backgroundColor: group.color,
                  },
                ]}
              >
                <Text style={styles.groupHeaderText}>{group.label}</Text>
              </View>
            ))}
          </View>

          {/* Column header row */}
          <View style={styles.colHeaderRow}>
            {ALL_COLUMNS.map((col) => (
              <View
                key={col.key}
                style={[styles.cell, { width: colWidth(col.width) }]}
              >
                <Text style={styles.colHeaderText}>{col.label}</Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {soudures.map((soudure, index) => {
            let rowBg = index % 2 === 0 ? '#FFFFFF' : '#F0F0F0'
            if (
              soudure.couleurLigne &&
              ROW_COLORS[soudure.couleurLigne]
            ) {
              rowBg = ROW_COLORS[soudure.couleurLigne]
            }

            return (
              <View
                key={soudure.id}
                style={[styles.dataRow, { backgroundColor: rowBg }]}
              >
                {ALL_COLUMNS.map((col) => {
                  let value: string = ''
                  if (col.key === 'ordre') {
                    value = String(index + 1)
                  } else if (col.key === 'date') {
                    value = formatDatePDF(
                      soudure[col.key as keyof SoudureAluminothermique] as Date | null
                    )
                  } else {
                    value =
                      (soudure[col.key as keyof SoudureAluminothermique] as string) ??
                      ''
                  }

                  let cellBg = 'transparent'
                  if (
                    col.key === 'reception' &&
                    soudure.reception &&
                    RECEPTION_COLORS[soudure.reception]
                  ) {
                    cellBg = RECEPTION_COLORS[soudure.reception]
                  }

                  return (
                    <View
                      key={col.key}
                      style={[
                        styles.cell,
                        {
                          width: colWidth(col.width),
                          backgroundColor: cellBg,
                        },
                      ]}
                    >
                      <Text style={styles.cellText}>{value}</Text>
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>

        {/* Status bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{totalCount} SA</Text>
          <Text style={styles.statusText}>{okCount} OK</Text>
          <Text style={styles.statusText}>{hsCount} HS</Text>
        </View>

        {/* Page footer */}
        <PiedPagePDF nomSociete={societe} projetName={projetName} />
      </Page>
    </Document>
  )
}
