import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { ColonneTS, LigneTS, CellulesTS, PersonnelMap } from '@/components/modules/tableau-service/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TableauServicePdfProps {
  titre: string
  entreprise: string | null
  semaine: number
  annee: number
  projetNom: string
  colonnes: ColonneTS[]
  lignes: LigneTS[]
  cellules: CellulesTS
  personnelMap?: PersonnelMap
  userLogo?: string
  nomSociete?: string
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
    paddingBottom: 10,
  },
  headerLeft: {},
  headerBrand: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
  },
  headerProjet: {
    fontSize: 10,
    color: '#5A5A5A',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitre: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
  },
  headerMeta: {
    fontSize: 9,
    color: '#5A5A5A',
    marginTop: 2,
  },

  // Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DCDCDC',
  },
  tableRow: {
    flexDirection: 'row',
  },
  // Header cells
  thCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#DCDCDC',
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 22,
  },
  thText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Body cells
  tdCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#DCDCDC',
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
    justifyContent: 'center',
    minHeight: 36,
  },
  tdText: {
    fontSize: 8,
    textAlign: 'center',
  },
  celluleNom: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center' as const,
  },
  celluleTel: {
    fontSize: 7,
    color: '#5A5A5A',
    textAlign: 'center' as const,
    marginTop: 1,
  },
  // Libelle column
  libCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#DCDCDC',
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC',
    justifyContent: 'center',
    minHeight: 36,
  },
  libText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#B5ABA1',
  },
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TableauServicePdf({
  titre,
  entreprise,
  semaine,
  annee,
  projetNom,
  colonnes,
  lignes,
  cellules,
  personnelMap,
  userLogo,
  nomSociete,
}: TableauServicePdfProps) {
  // Colonne "Poste" = 120pt fixe, le reste réparti également
  const posteWidth = 120
  // Page A4 landscape = 842pt - 2*30pt padding = 782pt usable
  const usableWidth = 782
  const dataWidthPt = colonnes.length > 0
    ? (usableWidth - posteWidth) / colonnes.length
    : usableWidth

  const dateGeneration = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {userLogo ? (
              <Image src={userLogo} style={{ width: 55, height: 35, objectFit: 'contain' }} />
            ) : (
              <Text style={styles.headerBrand}>{nomSociete ?? 'CONDUC RAIL'}</Text>
            )}
            <Text style={styles.headerProjet}>{projetNom}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitre}>{titre}</Text>
            <Text style={styles.headerMeta}>
              Semaine {semaine} / {annee}
              {entreprise ? ` - ${entreprise}` : ''}
            </Text>
            <Text style={styles.headerMeta}>
              Genere le {dateGeneration}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Column headers */}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.thCell,
                { width: posteWidth, backgroundColor: '#004489' },
              ]}
            >
              <Text style={styles.thText}>Poste</Text>
            </View>
            {colonnes.map((col) => (
              <View
                key={col.id}
                style={[
                  styles.thCell,
                  { width: dataWidthPt, backgroundColor: col.couleur },
                ]}
              >
                <Text style={styles.thText}>{col.nom}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {lignes.map((ligne, idx) => {
            const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F0F0F0'
            return (
              <View key={ligne.id} style={styles.tableRow}>
                {/* Libelle */}
                <View
                  style={[
                    styles.libCell,
                    {
                      width: posteWidth,
                      backgroundColor: ligne.bg,
                    },
                  ]}
                >
                  <Text style={[styles.libText, { color: ligne.fg }]}>
                    {ligne.libelle}
                  </Text>
                </View>

                {/* Data cells */}
                {colonnes.map((col) => {
                  const key = `${ligne.id}|${col.id}`
                  const cell = cellules[key]

                  // Resolve telephone: from cell, or from personnelMap
                  const telephone = cell?.personnelTelephone
                    || (cell?.personnelId && personnelMap?.[cell.personnelId]?.telephone)
                    || null

                  const nomDisplay = cell?.personnelNom
                    ? cell.texte
                      ? `${cell.personnelNom} - ${cell.texte}`
                      : cell.personnelNom
                    : cell?.texte || ''

                  return (
                    <View
                      key={col.id}
                      style={[
                        styles.tdCell,
                        { width: dataWidthPt, backgroundColor: rowBg },
                      ]}
                    >
                      <Text style={styles.celluleNom}>{nomDisplay}</Text>
                      {telephone ? (
                        <Text style={styles.celluleTel}>
                          {'\u{1F4DE}'} {telephone}
                        </Text>
                      ) : null}
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
