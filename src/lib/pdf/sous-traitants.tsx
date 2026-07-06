import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { SousTraitantsData } from '@/actions/sous-traitants'
import {
  montantAvenants,
  nouveauMontantMarche,
  cumulFacture,
  avancementPct,
  resteAFacturer,
} from '@/components/modules/sous-traitants/calculs'
import { EntetePDF, PiedPagePDF } from './pdf-entete'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  sectionTitre: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
    marginTop: 14,
    marginBottom: 6,
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
  footerRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#003370',
  },
  footerText: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  colNom: { flex: 1.4 },
  colDroit: { flex: 1, textAlign: 'right' },
  synthese: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  syntheseCarte: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 3,
    padding: 8,
  },
  syntheseLabel: {
    fontSize: 7,
    color: '#5A5A5A',
    textTransform: 'uppercase',
  },
  syntheseValeur: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 3,
  },
})

function formatMontantFR(n: number): string {
  return n
    .toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/ /g, ' ')
    .replace(/ /g, ' ')
}

function formatPctFR(n: number): string {
  return `${n
    .toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    .replace(/ /g, ' ')
    .replace(/ /g, ' ')} %`
}

interface Props {
  projetName: string
  data: SousTraitantsData
  userLogo?: string
  nomSociete?: string
}

export function SousTraitantsPDF({ projetName, data, userLogo, nomSociete }: Props) {
  const { sousTraitants, montantMarcheTotal } = data

  const cumulNouveaux = sousTraitants.reduce((s, st) => s + nouveauMontantMarche(st), 0)
  const cumulAS = sousTraitants.reduce(
    (s, st) => s + (st.paiementDirect ? st.montantAS : 0),
    0
  )
  const cumulFact = sousTraitants.reduce((s, st) => s + cumulFacture(st), 0)
  const totalAvenants = sousTraitants.reduce((s, st) => s + montantAvenants(st), 0)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <EntetePDF
          titrePDF="SUIVI DES SOUS-TRAITANTS"
          projetName={projetName}
          date={new Date().toLocaleDateString('fr-FR')}
          logoSociete={userLogo}
          nomSociete={nomSociete}
        />

        {/* Volet contractuel */}
        <Text style={styles.sectionTitre}>Poste contractuel — Marchés et avenants</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNom]}>Sous-traitant</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Montant marché</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Montant AS</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Avenants</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Nouveau montant marché</Text>
        </View>
        {sousTraitants.map((st, i) => (
          <View key={st.id} style={[styles.tableRow, i % 2 !== 0 ? styles.rowAlt : {}]}>
            <Text style={styles.colNom}>{st.nom}</Text>
            <Text style={styles.colDroit}>{formatMontantFR(st.montantMarche)}</Text>
            <Text style={styles.colDroit}>
              {st.paiementDirect ? formatMontantFR(st.montantAS) : '-'}
            </Text>
            <Text style={styles.colDroit}>{formatMontantFR(montantAvenants(st))}</Text>
            <Text style={[styles.colDroit, { fontFamily: 'Helvetica-Bold' }]}>
              {formatMontantFR(nouveauMontantMarche(st))}
            </Text>
          </View>
        ))}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, styles.colNom]}>CUMUL S/T</Text>
          <Text style={[styles.footerText, styles.colDroit]}>
            {formatMontantFR(sousTraitants.reduce((s, st) => s + st.montantMarche, 0))}
          </Text>
          <Text style={[styles.footerText, styles.colDroit]}>{formatMontantFR(cumulAS)}</Text>
          <Text style={[styles.footerText, styles.colDroit]}>
            {formatMontantFR(totalAvenants)}
          </Text>
          <Text style={[styles.footerText, styles.colDroit]}>
            {formatMontantFR(cumulNouveaux)}
          </Text>
        </View>

        {/* Volet financier */}
        <Text style={styles.sectionTitre}>Poste financier — Facturation et avancement</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNom]}>Sous-traitant</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Nouveau montant marché</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Cumul facturé</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Avancement</Text>
          <Text style={[styles.tableHeaderText, styles.colDroit]}>Reste à facturer</Text>
        </View>
        {sousTraitants.map((st, i) => (
          <View key={st.id} style={[styles.tableRow, i % 2 !== 0 ? styles.rowAlt : {}]}>
            <Text style={styles.colNom}>{st.nom}</Text>
            <Text style={styles.colDroit}>{formatMontantFR(nouveauMontantMarche(st))}</Text>
            <Text style={styles.colDroit}>{formatMontantFR(cumulFacture(st))}</Text>
            <Text style={styles.colDroit}>{formatPctFR(avancementPct(st))}</Text>
            <Text style={styles.colDroit}>{formatMontantFR(resteAFacturer(st))}</Text>
          </View>
        ))}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, styles.colNom]}>CUMUL S/T</Text>
          <Text style={[styles.footerText, styles.colDroit]}>
            {formatMontantFR(cumulNouveaux)}
          </Text>
          <Text style={[styles.footerText, styles.colDroit]}>{formatMontantFR(cumulFact)}</Text>
          <Text style={[styles.footerText, styles.colDroit]}>
            {cumulNouveaux > 0 ? formatPctFR((cumulFact / cumulNouveaux) * 100) : '-'}
          </Text>
          <Text style={[styles.footerText, styles.colDroit]}>
            {formatMontantFR(cumulNouveaux - cumulFact)}
          </Text>
        </View>

        {/* Synthèse */}
        <View style={styles.synthese}>
          <View style={styles.syntheseCarte}>
            <Text style={styles.syntheseLabel}>Montant marché (Détail Estimatif)</Text>
            <Text style={styles.syntheseValeur}>{formatMontantFR(montantMarcheTotal)}</Text>
          </View>
          <View style={styles.syntheseCarte}>
            <Text style={styles.syntheseLabel}>Cumul marchés sous-traités</Text>
            <Text style={styles.syntheseValeur}>{formatMontantFR(cumulNouveaux)}</Text>
          </View>
          <View style={[styles.syntheseCarte, { borderColor: '#004489', backgroundColor: '#E5EFF8' }]}>
            <Text style={styles.syntheseLabel}>Part mandataire</Text>
            <Text style={[styles.syntheseValeur, { color: '#003370' }]}>
              {formatMontantFR(montantMarcheTotal - cumulNouveaux)}
            </Text>
          </View>
          <View style={styles.syntheseCarte}>
            <Text style={styles.syntheseLabel}>Reste à facturer S/T</Text>
            <Text style={styles.syntheseValeur}>
              {formatMontantFR(cumulNouveaux - cumulFact)}
            </Text>
          </View>
        </View>

        <PiedPagePDF nomSociete={nomSociete} projetName={projetName} />
      </Page>
    </Document>
  )
}
