import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PrixNouveau } from '@prisma/client'
import {
  STATUT_LABELS,
  STATUT_STYLES,
  potentielStyle,
  montantPondere,
} from '@/components/modules/prix-nouveaux/helpers'
import { EntetePDF, PiedPagePDF } from './pdf-entete'
import { pdfMontantFR } from './format'

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
    alignItems: 'center',
  },
  rowAlt: {
    backgroundColor: '#F0F0F0',
  },
  colNumero: { width: 45 },
  colIntitule: { flex: 1 },
  colDate: { width: 52 },
  colMontant: { width: 65, textAlign: 'right' },
  colPotentiel: { width: 60, textAlign: 'center' },
  colOS: { width: 40, textAlign: 'center' },
  colDelai: { width: 60 },
  colStatut: { width: 50, textAlign: 'center' },
  footerRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#003370',
  },
  footerText: {
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
  },
})

function formatDate(d: Date | null): string {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('fr-FR')
}

export type ModeExportPN = 'interne' | 'client'

interface Props {
  projetName: string
  prixNouveaux: PrixNouveau[]
  mode?: ModeExportPN
  userLogo?: string
  nomSociete?: string
}

// Le mode "client" masque les données internes : potentiel d'acceptation,
// montant pondéré et déboursés réels.
export function PrixNouveauxPDF({
  projetName,
  prixNouveaux,
  mode = 'interne',
  userLogo,
  nomSociete,
}: Props) {
  const interne = mode !== 'client'
  const totalPresente = prixNouveaux.reduce((s, pn) => s + pn.montantPresente, 0)
  const totalAccepte = prixNouveaux.reduce((s, pn) => s + (pn.montantAccepte ?? 0), 0)
  const totalDebourse = prixNouveaux.reduce((s, pn) => s + (pn.debourseReel ?? 0), 0)
  const totalPondere = prixNouveaux.reduce((s, pn) => s + montantPondere(pn), 0)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <EntetePDF
          titrePDF={interne ? 'SUIVI DES PRIX NOUVEAUX' : 'ÉTAT DES PRIX NOUVEAUX'}
          projetName={projetName}
          date={new Date().toLocaleDateString('fr-FR')}
          logoSociete={userLogo}
          nomSociete={nomSociete}
        />

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNumero]}>N° devis</Text>
          <Text style={[styles.tableHeaderText, styles.colIntitule]}>Intitulé</Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>Date devis</Text>
          <Text style={[styles.tableHeaderText, styles.colMontant]}>Montant présenté</Text>
          {interne && (
            <Text style={[styles.tableHeaderText, styles.colPotentiel]}>Potentiel accept.</Text>
          )}
          <Text style={[styles.tableHeaderText, styles.colMontant]}>Montant accepté</Text>
          {interne && (
            <Text style={[styles.tableHeaderText, styles.colMontant]}>Déboursé réel</Text>
          )}
          <Text style={[styles.tableHeaderText, styles.colOS]}>N° OS</Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>Date OS</Text>
          <Text style={[styles.tableHeaderText, styles.colDelai]}>Délai suppl.</Text>
          <Text style={[styles.tableHeaderText, styles.colStatut]}>Statut</Text>
        </View>

        {prixNouveaux.map((pn, i) => {
          const pot = potentielStyle(pn)
          const st = STATUT_STYLES[pn.statut] || STATUT_STYLES.en_cours
          return (
            <View
              key={pn.id}
              style={[styles.tableRow, i % 2 !== 0 ? styles.rowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.colNumero, { fontSize: 7 }]}>{pn.numero || '-'}</Text>
              <View style={styles.colIntitule}>
                <Text style={{ fontSize: 7 }}>{pn.intitule}</Text>
                {pn.commentaire ? (
                  <Text style={{ fontSize: 6, color: '#5A5A5A' }}>{pn.commentaire}</Text>
                ) : null}
              </View>
              <Text style={[styles.colDate, { fontSize: 7 }]}>{formatDate(pn.dateDevis)}</Text>
              <Text style={[styles.colMontant, { fontSize: 7, fontFamily: 'Helvetica-Bold' }]}>
                {pdfMontantFR(pn.montantPresente)}
              </Text>
              {interne && (
                <View style={styles.colPotentiel}>
                  <Text
                    style={{
                      fontSize: 7,
                      fontFamily: 'Helvetica-Bold',
                      color: pot.text,
                      backgroundColor: pot.bg,
                      borderRadius: 2,
                      paddingVertical: 1,
                      paddingHorizontal: 3,
                      textAlign: 'center',
                    }}
                  >
                    {pot.label}
                  </Text>
                </View>
              )}
              <Text style={[styles.colMontant, { fontSize: 7 }]}>
                {pn.montantAccepte != null ? pdfMontantFR(pn.montantAccepte) : '-'}
              </Text>
              {interne && (
                <Text style={[styles.colMontant, { fontSize: 7 }]}>
                  {pn.debourseReel != null ? pdfMontantFR(pn.debourseReel) : '-'}
                </Text>
              )}
              <Text style={[styles.colOS, { fontSize: 7 }]}>{pn.numeroOS || '-'}</Text>
              <Text style={[styles.colDate, { fontSize: 7 }]}>{formatDate(pn.dateOS)}</Text>
              <Text style={[styles.colDelai, { fontSize: 6.5 }]}>
                {pn.delaiSupplementaire || '-'}
              </Text>
              <View style={styles.colStatut}>
                <Text
                  style={{
                    fontSize: 6.5,
                    fontFamily: 'Helvetica-Bold',
                    color: st.color,
                    backgroundColor: st.backgroundColor,
                    borderRadius: 2,
                    paddingVertical: 1,
                    paddingHorizontal: 2,
                    textAlign: 'center',
                  }}
                >
                  {STATUT_LABELS[pn.statut] || pn.statut}
                </Text>
              </View>
            </View>
          )
        })}

        {/* Totaux */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, styles.colNumero]} />
          <Text style={[styles.footerText, styles.colIntitule]}>TOTAUX</Text>
          <Text style={[styles.footerText, styles.colDate]} />
          <Text style={[styles.footerText, styles.colMontant]}>
            {pdfMontantFR(totalPresente)}
          </Text>
          {interne && <Text style={[styles.footerText, styles.colPotentiel]} />}
          <Text style={[styles.footerText, styles.colMontant]}>
            {pdfMontantFR(totalAccepte)}
          </Text>
          {interne && (
            <Text style={[styles.footerText, styles.colMontant]}>
              {pdfMontantFR(totalDebourse)}
            </Text>
          )}
          <Text style={[styles.footerText, styles.colOS]} />
          <Text style={[styles.footerText, styles.colDate]} />
          <Text style={[styles.footerText, styles.colDelai]} />
          <Text style={[styles.footerText, styles.colStatut]} />
        </View>

        {interne && (
          <View
            style={{
              marginTop: 8,
              backgroundColor: '#E5EFF8',
              borderWidth: 1,
              borderColor: '#004489',
              borderRadius: 3,
              paddingVertical: 6,
              paddingHorizontal: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 8, color: '#003370', fontFamily: 'Helvetica-Bold' }}>
              MONTANT PONDÉRÉ PAR LE POTENTIEL D&apos;ACCEPTATION
            </Text>
            <Text style={{ fontSize: 10, color: '#003370', fontFamily: 'Helvetica-Bold' }}>
              {pdfMontantFR(totalPondere)}
            </Text>
          </View>
        )}

        <PiedPagePDF nomSociete={nomSociete} projetName={projetName} />
      </Page>
    </Document>
  )
}
