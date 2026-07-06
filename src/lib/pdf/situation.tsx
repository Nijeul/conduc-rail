import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { EntetePDF, PiedPagePDF } from './pdf-entete'
import { pdfNombreFR, pdfMontantFR } from './format'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#004489',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
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
  colCode: { width: 50 },
  colDesignation: { flex: 1 },
  colUnite: { width: 45, textAlign: 'center' },
  colPU: { width: 60, textAlign: 'right' },
  colQte: { width: 55, textAlign: 'right' },
  colMontant: { width: 70, textAlign: 'right' },
  colAvancement: { width: 55, textAlign: 'right' },
})

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

const MOIS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export interface SituationPDFMeta {
  numero: number
  libelle: string | null
  annee: number
  mois: number
  statut: string
}

export interface SituationPDFLigne {
  ligneDEId: string
  estChapitre?: boolean
  code: string
  designation: string
  unite: string
  prixUnitaire: number
  quantiteMarche: number
  quantiteAnterieure: number
  quantite: number
  montantSituation: number
  quantiteCumulee: number
  avancement: number
}

export interface SituationPDFData {
  lignes: SituationPDFLigne[]
  totalSituation: number
  totalAnterieur: number
  totalCumule: number
  totalMarche: number
  avancementGlobal: number
}

interface Props {
  projetName: string
  meta: SituationPDFMeta
  data: SituationPDFData
  userLogo?: string
  nomSociete?: string
}

export function SituationPDF({ projetName, meta, data, userLogo, nomSociete }: Props) {
  const sousTitre = [
    `Situation n°${meta.numero}`,
    `${MOIS_FR[meta.mois - 1] ?? ''} ${meta.annee}`,
    meta.libelle || undefined,
    meta.statut === 'validee' ? 'Validée' : 'Brouillon',
  ]
    .filter(Boolean)
    .join(' — ')

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <EntetePDF
          titrePDF="SITUATION DE TRAVAUX"
          projetName={projetName}
          date={sousTitre}
          logoSociete={userLogo}
          nomSociete={nomSociete}
        />

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colCode]}>N° prix</Text>
          <Text style={[styles.tableHeaderText, styles.colDesignation]}>Intitulé</Text>
          <Text style={[styles.tableHeaderText, styles.colUnite]}>Unité</Text>
          <Text style={[styles.tableHeaderText, styles.colPU]}>PU HT</Text>
          <Text style={[styles.tableHeaderText, styles.colQte]}>Qté marché</Text>
          <Text style={[styles.tableHeaderText, styles.colQte]}>Qté antér.</Text>
          <Text style={[styles.tableHeaderText, styles.colQte]}>Qté situation</Text>
          <Text style={[styles.tableHeaderText, styles.colMontant]}>Montant situation</Text>
          <Text style={[styles.tableHeaderText, styles.colQte]}>Qté cumulée</Text>
          <Text style={[styles.tableHeaderText, styles.colAvancement]}>Avmt. %</Text>
        </View>

        {data.lignes.map((l, i) =>
          l.estChapitre ? (
            <View
              key={l.ligneDEId}
              style={[styles.tableRow, { backgroundColor: '#E5EFF8' }]}
              wrap={false}
            >
              <Text style={[styles.colCode, { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#003370' }]}>
                {l.code}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 7,
                  fontFamily: 'Helvetica-Bold',
                  color: '#003370',
                  paddingLeft: 4 + (l.code.match(/\./g) || []).length * 10,
                }}
              >
                {l.designation}
              </Text>
            </View>
          ) : (
          <View
            key={l.ligneDEId}
            style={[styles.tableRow, i % 2 !== 0 ? styles.rowAlt : {}]}
            wrap={false}
          >
            <Text style={[styles.colCode, { fontSize: 7 }]}>{l.code}</Text>
            <Text style={[styles.colDesignation, { fontSize: 7 }]}>{l.designation}</Text>
            <Text style={[styles.colUnite, { fontSize: 7 }]}>{l.unite}</Text>
            <Text style={[styles.colPU, { fontSize: 7 }]}>
              {pdfMontantFR(l.prixUnitaire)}
            </Text>
            <Text style={[styles.colQte, { fontSize: 7 }]}>{pdfNombreFR(l.quantiteMarche)}</Text>
            <Text style={[styles.colQte, { fontSize: 7, color: '#5A5A5A' }]}>
              {pdfNombreFR(l.quantiteAnterieure)}
            </Text>
            <Text style={[styles.colQte, { fontSize: 7, fontFamily: 'Helvetica-Bold' }]}>
              {pdfNombreFR(l.quantite)}
            </Text>
            <Text style={[styles.colMontant, { fontSize: 7, fontFamily: 'Helvetica-Bold' }]}>
              {pdfMontantFR(l.montantSituation)}
            </Text>
            <Text style={[styles.colQte, { fontSize: 7 }]}>{pdfNombreFR(l.quantiteCumulee)}</Text>
            <View
              style={[
                styles.colAvancement,
                {
                  backgroundColor: getAvancementBg(l.avancement),
                  borderRadius: 2,
                  paddingVertical: 1,
                  paddingHorizontal: 3,
                },
              ]}
            >
              <Text
                style={{
                  textAlign: 'right',
                  color: getAvancementColor(l.avancement),
                  fontFamily: 'Helvetica-Bold',
                  fontSize: 7,
                }}
              >
                {pdfNombreFR(l.avancement, 1)} %
              </Text>
            </View>
          </View>
          )
        )}

        {/* Totaux */}
        <View
          style={{
            marginTop: 8,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: '#003370',
            paddingVertical: 8,
            paddingHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 8 }}>
            Cumul antérieur : {pdfMontantFR(data.totalAnterieur)}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'Helvetica-Bold' }}>
            SITUATION HT : {pdfMontantFR(data.totalSituation)}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 8 }}>
            Cumul : {pdfMontantFR(data.totalCumule)} (
            {pdfNombreFR(data.avancementGlobal, 1)} % du marché)
          </Text>
        </View>

        <PiedPagePDF nomSociete={nomSociete} projetName={projetName} />
      </Page>
    </Document>
  )
}
