import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { BidCompData } from '@/lib/matrice-bidcomp'
import { EntetePDF, PiedPagePDF } from './pdf-entete'
import { pdfMontantFR } from './format'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  infoBloc: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  infoCarte: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 3,
    padding: 6,
  },
  infoLabel: {
    fontSize: 6,
    color: '#5A5A5A',
    textTransform: 'uppercase',
  },
  infoValeur: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#004489',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  headerText: {
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
  },
  sectionRow: {
    backgroundColor: '#E5EFF8',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCDC',
  },
  sectionText: {
    color: '#003370',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCDC',
  },
  rowAlt: {
    backgroundColor: '#F0F0F0',
  },
  colLibelle: { width: 120 },
  colBesoin: { width: 80 },
  colFournisseur: { flex: 1 },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: '#003370',
  },
  totalText: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  blocTexte: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: 3,
    padding: 8,
  },
  blocTitre: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#004489',
    marginBottom: 3,
  },
})

const DECISION_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  go: { label: 'GO', bg: '#E8EFDA', text: '#5E8019' },
  no_go: { label: 'NO GO', bg: '#FDEAED', text: '#E20025' },
  en_attente: { label: 'En attente', bg: '#FFF7D1', text: '#DD9412' },
}

export interface BidCompPDFEntete {
  acheteur: string
  site: string
  familleAchats: string
  budgetTheorique: number | null
}

export interface BidCompPDFFournisseur {
  id: string
  nom: string
  decision: string
}

interface Props {
  projetName: string
  titre: string
  entete: BidCompPDFEntete
  data: BidCompData
  fournisseurs: BidCompPDFFournisseur[]
  totaux: Record<string, number>
  userLogo?: string
  nomSociete?: string
}

export function BidCompPDF({
  projetName,
  titre,
  entete,
  data,
  fournisseurs,
  totaux,
  userLogo,
  nomSociete,
}: Props) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <EntetePDF
          titrePDF="MATRICE DÉCISIONNELLE FOURNISSEURS"
          projetName={`${projetName} — ${titre}`}
          date={new Date().toLocaleDateString('fr-FR')}
          logoSociete={userLogo}
          nomSociete={nomSociete}
        />

        {/* Bloc d'identification */}
        <View style={styles.infoBloc}>
          <View style={styles.infoCarte}>
            <Text style={styles.infoLabel}>Acheteur</Text>
            <Text style={styles.infoValeur}>{entete.acheteur || '-'}</Text>
          </View>
          <View style={styles.infoCarte}>
            <Text style={styles.infoLabel}>Site</Text>
            <Text style={styles.infoValeur}>{entete.site || '-'}</Text>
          </View>
          <View style={styles.infoCarte}>
            <Text style={styles.infoLabel}>Famille d&apos;achats</Text>
            <Text style={styles.infoValeur}>{entete.familleAchats || '-'}</Text>
          </View>
          <View style={styles.infoCarte}>
            <Text style={styles.infoLabel}>Budget théorique</Text>
            <Text style={styles.infoValeur}>
              {entete.budgetTheorique != null ? pdfMontantFR(entete.budgetTheorique) : '-'}
            </Text>
          </View>
        </View>

        {/* En-tête de la grille */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, styles.colLibelle]}>Critère</Text>
          <Text style={[styles.headerText, styles.colBesoin]}>Besoin</Text>
          {fournisseurs.map((f) => (
            <Text key={f.id} style={[styles.headerText, styles.colFournisseur]}>
              {f.nom}
            </Text>
          ))}
        </View>

        {/* Sections */}
        {data.sections.map((section) => (
          <View key={section.id}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionText}>
                {section.titre}
                {section.type === 'cout' ? '  (montants en €)' : ''}
              </Text>
            </View>
            {section.lignes.map((l, i) => (
              <View
                key={l.id}
                style={[styles.row, i % 2 !== 0 ? styles.rowAlt : {}]}
                wrap={false}
              >
                <Text style={[styles.colLibelle, { fontFamily: 'Helvetica-Bold', fontSize: 7 }]}>
                  {l.libelle}
                </Text>
                <Text style={[styles.colBesoin, { fontSize: 7, color: '#5A5A5A' }]}>
                  {l.besoin || '-'}
                </Text>
                {fournisseurs.map((f) => (
                  <Text
                    key={f.id}
                    style={[
                      styles.colFournisseur,
                      { fontSize: 7 },
                      section.type === 'cout' ? { textAlign: 'right' } : {},
                    ]}
                  >
                    {l.valeurs[f.id] || '-'}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={[styles.totalText, styles.colLibelle]}>Total (€)</Text>
          <Text style={[styles.totalText, styles.colBesoin]}>
            {entete.budgetTheorique != null ? pdfMontantFR(entete.budgetTheorique) : '-'}
          </Text>
          {fournisseurs.map((f) => (
            <Text
              key={f.id}
              style={[styles.totalText, styles.colFournisseur, { textAlign: 'right' }]}
            >
              {pdfMontantFR(totaux[f.id] ?? 0)}
            </Text>
          ))}
        </View>

        {/* Écart vs budget */}
        <View style={styles.row}>
          <Text style={[styles.colLibelle, { fontFamily: 'Helvetica-Bold', fontSize: 7 }]}>
            Écart vs budget (€)
          </Text>
          <Text style={[styles.colBesoin, { fontSize: 6, color: '#5A5A5A' }]}>
            négatif = économie
          </Text>
          {fournisseurs.map((f) => {
            const ecart =
              entete.budgetTheorique != null
                ? (totaux[f.id] ?? 0) - entete.budgetTheorique
                : null
            return (
              <Text
                key={f.id}
                style={[
                  styles.colFournisseur,
                  {
                    textAlign: 'right',
                    fontSize: 7,
                    fontFamily: 'Helvetica-Bold',
                    color: ecart == null ? '#000000' : ecart <= 0 ? '#5E8019' : '#E20025',
                  },
                ]}
              >
                {ecart != null ? pdfMontantFR(ecart) : '-'}
              </Text>
            )
          })}
        </View>

        {/* Décision */}
        <View style={[styles.row, { backgroundColor: '#F0F0F0' }]}>
          <Text style={[styles.colLibelle, { fontFamily: 'Helvetica-Bold', fontSize: 7 }]}>
            Décision
          </Text>
          <Text style={styles.colBesoin} />
          {fournisseurs.map((f) => {
            const d = DECISION_LABELS[f.decision] || DECISION_LABELS.en_attente
            return (
              <View key={f.id} style={styles.colFournisseur}>
                <Text
                  style={{
                    fontSize: 7,
                    fontFamily: 'Helvetica-Bold',
                    color: d.text,
                    backgroundColor: d.bg,
                    borderRadius: 2,
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                    textAlign: 'center',
                  }}
                >
                  {d.label}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Conclusions et signatures */}
        <View style={styles.blocTexte} wrap={false}>
          <Text style={styles.blocTitre}>Conclusions / Recommandations</Text>
          <Text style={{ fontSize: 7 }}>{data.conclusions || '-'}</Text>
          <Text style={[styles.blocTitre, { marginTop: 6 }]}>
            Pourquoi moins de 3 fournisseurs consultés ?
          </Text>
          <Text style={{ fontSize: 7 }}>{data.pourquoiPasTroisFournisseurs || '-'}</Text>
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
            <Text style={{ fontSize: 7 }}>
              Signature Sourcing : {data.signatureSourcing || '____________________'}
            </Text>
            <Text style={{ fontSize: 7 }}>
              Signature Projet : {data.signatureProjet || '____________________'}
            </Text>
          </View>
        </View>

        <PiedPagePDF nomSociete={nomSociete} projetName={projetName} />
      </Page>
    </Document>
  )
}
