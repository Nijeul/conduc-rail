import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { ColonneTS, LigneTS, CellulesTS } from '@/components/modules/tableau-service/types'

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
    borderBottomColor: '#ECEFF1',
    paddingBottom: 10,
  },
  headerLeft: {},
  headerBrand: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#263238',
  },
  headerProjet: {
    fontSize: 10,
    color: '#455A64',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitre: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1565C0',
  },
  headerMeta: {
    fontSize: 9,
    color: '#607D8B',
    marginTop: 2,
  },

  // Table
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  tableRow: {
    flexDirection: 'row',
  },
  // Header cells
  thCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#ECEFF1',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
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
    borderRightColor: '#ECEFF1',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    justifyContent: 'center',
    minHeight: 18,
  },
  tdText: {
    fontSize: 8,
    textAlign: 'center',
  },
  // Libelle column
  libCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#ECEFF1',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    justifyContent: 'center',
    minHeight: 18,
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
    color: '#90A4AE',
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
  userLogo,
  nomSociete,
}: TableauServicePdfProps) {
  const nbCols = colonnes.length + 1 // +1 for libelle column
  const colWidth = nbCols > 0 ? `${(100 / nbCols).toFixed(2)}%` : '100%'
  const libWidth = colonnes.length > 6 ? '14%' : '18%'
  const dataWidth = colonnes.length > 0
    ? `${((100 - parseFloat(libWidth)) / colonnes.length).toFixed(2)}%`
    : '100%'

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
                { width: libWidth, backgroundColor: '#263238' },
              ]}
            >
              <Text style={styles.thText}>Poste</Text>
            </View>
            {colonnes.map((col) => (
              <View
                key={col.id}
                style={[
                  styles.thCell,
                  { width: dataWidth, backgroundColor: col.couleur },
                ]}
              >
                <Text style={styles.thText}>{col.nom}</Text>
              </View>
            ))}
          </View>

          {/* Rows */}
          {lignes.map((ligne, idx) => {
            const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F5F7FA'
            return (
              <View key={ligne.id} style={styles.tableRow}>
                {/* Libelle */}
                <View
                  style={[
                    styles.libCell,
                    {
                      width: libWidth,
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
                  const display = cell?.personnelNom
                    ? cell.texte
                      ? `${cell.personnelNom}\n${cell.texte}`
                      : cell.personnelNom
                    : cell?.texte || ''

                  return (
                    <View
                      key={col.id}
                      style={[
                        styles.tdCell,
                        { width: dataWidth, backgroundColor: rowBg },
                      ]}
                    >
                      <Text style={styles.tdText}>{display}</Text>
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
