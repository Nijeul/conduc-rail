import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ARFRow } from '@/actions/arf'
import { EntetePDF, PiedPagePDF } from './pdf-entete'
import {
  pivotARF,
  calculsLigneARF,
  finComptabilisee,
  deltaCatenaire,
  cumulColonne,
} from '@/lib/arf-calculs'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 25,
  },
  ligne: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DCDCDC',
  },
  colSem: { width: 30 },
  colDate: { width: 50 },
  cellule: {
    paddingVertical: 2.5,
    paddingHorizontal: 2,
    textAlign: 'center',
  },
})

function formatDuree(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  const sign = minutes < 0 ? '-' : ''
  if (h === 0) return `${sign}${m}min`
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h${m.toString().padStart(2, '0')}`
}

function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

function couleurDelta(pct: number | null): string {
  if (pct === null) return '#5A5A5A'
  if (pct >= 95) return '#5E8019'
  if (pct >= 90) return '#DD9412'
  return '#E20025'
}

// Largeurs des sous-colonnes d'un groupement de voies
const L = { prevu: 62, reel: 70, temps: 36, delta: 32, catReel: 70, catDelta: 32 }
const largeurGroupe = (avecCat: boolean) =>
  L.prevu + L.reel + L.temps + L.delta + (avecCat ? L.catReel + L.catDelta : 0)

interface Props {
  projetName: string
  rows: ARFRow[]
  totalMinutes?: number
  userLogo?: string
  nomSociete?: string
  user?: { logoSociete?: string | null; nomSociete?: string | null }
}

export function ARFPDF({ projetName, rows, userLogo, nomSociete, user }: Props) {
  const logo = user?.logoSociete ?? userLogo
  const societe = user?.nomSociete ?? nomSociete
  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const pivot = pivotARF(rows)

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <EntetePDF
          titrePDF="SUIVI ARF"
          projetName={projetName}
          date={today}
          logoSociete={logo}
          nomSociete={societe}
        />

        {pivot === null && (
          <Text style={{ color: '#5A5A5A', marginTop: 10 }}>
            Aucune ligne ARF avec une voie renseignée.
          </Text>
        )}

        {pivot !== null && (
          <>
            {/* En-tête niveau 1 : groupements de voies */}
            <View style={{ flexDirection: 'row', backgroundColor: '#004489' }}>
              <Text
                style={[
                  styles.cellule,
                  styles.colSem,
                  { color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
                ]}
              >
                Sem.
              </Text>
              <Text
                style={[
                  styles.cellule,
                  styles.colDate,
                  { color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
                ]}
              >
                Date
              </Text>
              {pivot.colonnes.map((c) => (
                <Text
                  key={c.voie}
                  style={[
                    styles.cellule,
                    {
                      width: largeurGroupe(c.avecCat),
                      color: '#FFFFFF',
                      fontFamily: 'Helvetica-Bold',
                      fontSize: 8,
                      borderLeftWidth: 1,
                      borderLeftColor: '#0056B3',
                    },
                  ]}
                >
                  {c.voie}
                </Text>
              ))}
            </View>
            {/* En-tête niveau 2 : sous-colonnes */}
            <View style={{ flexDirection: 'row', backgroundColor: '#003370' }}>
              <Text style={[styles.cellule, styles.colSem]} />
              <Text style={[styles.cellule, styles.colDate]} />
              {pivot.colonnes.map((c) => (
                <View key={c.voie} style={{ flexDirection: 'row' }}>
                  <Text
                    style={[
                      styles.cellule,
                      {
                        width: L.prevu,
                        color: '#FFFFFF',
                        fontFamily: 'Helvetica-Bold',
                        borderLeftWidth: 1,
                        borderLeftColor: '#0056B3',
                      },
                    ]}
                  >
                    Prévu ITC
                  </Text>
                  <Text
                    style={[
                      styles.cellule,
                      { width: L.reel, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
                    ]}
                  >
                    Réel
                  </Text>
                  <Text
                    style={[
                      styles.cellule,
                      { width: L.temps, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
                    ]}
                  >
                    Temps
                  </Text>
                  <Text
                    style={[
                      styles.cellule,
                      { width: L.delta, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
                    ]}
                  >
                    Delta
                  </Text>
                  {c.avecCat && (
                    <>
                      <Text
                        style={[
                          styles.cellule,
                          {
                            width: L.catReel,
                            color: '#F2AB1B',
                            fontFamily: 'Helvetica-Bold',
                            borderLeftWidth: 1,
                            borderLeftColor: '#0056B3',
                          },
                        ]}
                      >
                        Caténaire
                      </Text>
                      <Text
                        style={[
                          styles.cellule,
                          { width: L.catDelta, color: '#F2AB1B', fontFamily: 'Helvetica-Bold' },
                        ]}
                      >
                        Delta
                      </Text>
                    </>
                  )}
                </View>
              ))}
            </View>

            {/* Corps : une ligne par jour ouvré */}
            {pivot.semaines.map((sem) =>
              sem.dates.map((d, iJour) => {
                const altJour = pivot.dates.indexOf(d) % 2 !== 0
                return (
                  <View
                    key={d}
                    wrap={false}
                    style={[
                      styles.ligne,
                      altJour ? { backgroundColor: '#F0F0F0' } : {},
                      iJour === 0 ? { borderTopWidth: 1.5, borderTopColor: '#004489' } : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellule,
                        styles.colSem,
                        { color: '#004489', fontFamily: 'Helvetica-Bold' },
                      ]}
                    >
                      {iJour === 0 ? `S${sem.num}` : ''}
                    </Text>
                    <Text style={[styles.cellule, styles.colDate]}>{formatDateFR(d)}</Text>
                    {pivot.colonnes.map((c) => {
                      const eVoie = pivot.parCle.get(`${d}|${c.voie}|voie`) || []
                      const eCat = pivot.parCle.get(`${d}|${c.voie}|cat`) || []
                      return (
                        <View key={c.voie} style={{ flexDirection: 'row' }}>
                          <View
                            style={[
                              styles.cellule,
                              {
                                width: L.prevu,
                                backgroundColor: '#E5EFF8',
                                borderLeftWidth: 1,
                                borderLeftColor: '#DCDCDC',
                              },
                            ]}
                          >
                            {eVoie.map((e) => (
                              <Text key={e.id} style={{ color: '#003370' }}>
                                {e.heureDebutPrevue && e.heureFinPrevue
                                  ? `${e.heureDebutPrevue} - ${e.heureFinPrevue}`
                                  : '—'}
                              </Text>
                            ))}
                            {eVoie.length === 0 && <Text style={{ color: '#B2D4FC' }}>—</Text>}
                          </View>
                          <View style={[styles.cellule, { width: L.reel }]}>
                            {eVoie.map((e) => (
                              <Text key={e.id} style={{ fontFamily: 'Helvetica-Bold' }}>
                                {e.heureDebut || '—'} - {finComptabilisee(e) || '...'}
                              </Text>
                            ))}
                            {eVoie.length === 0 && <Text style={{ color: '#DCDCDC' }}>—</Text>}
                          </View>
                          <View style={[styles.cellule, { width: L.temps }]}>
                            {eVoie.map((e) => {
                              const { dureeReelleMin } = calculsLigneARF(e)
                              return (
                                <Text key={e.id} style={{ fontFamily: 'Helvetica-Bold' }}>
                                  {dureeReelleMin !== null ? formatDuree(dureeReelleMin) : '—'}
                                </Text>
                              )
                            })}
                            {eVoie.length === 0 && <Text style={{ color: '#DCDCDC' }}>—</Text>}
                          </View>
                          <View style={[styles.cellule, { width: L.delta }]}>
                            {eVoie.map((e) => {
                              const { pourcentTemps } = calculsLigneARF(e)
                              return (
                                <Text
                                  key={e.id}
                                  style={{
                                    fontFamily: 'Helvetica-Bold',
                                    color: couleurDelta(pourcentTemps),
                                  }}
                                >
                                  {pourcentTemps !== null
                                    ? `${pourcentTemps.toFixed(0)} %`
                                    : '—'}
                                </Text>
                              )
                            })}
                            {eVoie.length === 0 && <Text style={{ color: '#DCDCDC' }}>—</Text>}
                          </View>
                          {c.avecCat && (
                            <>
                              <View
                                style={[
                                  styles.cellule,
                                  {
                                    width: L.catReel,
                                    backgroundColor: '#FFF7D1',
                                    borderLeftWidth: 1,
                                    borderLeftColor: '#DCDCDC',
                                  },
                                ]}
                              >
                                {eCat.map((e) => (
                                  <Text key={e.id} style={{ fontFamily: 'Helvetica-Bold' }}>
                                    {e.heureDebut || '—'} - {finComptabilisee(e) || '...'}
                                  </Text>
                                ))}
                                {eCat.length === 0 && (
                                  <Text style={{ color: '#DCDCDC' }}>—</Text>
                                )}
                              </View>
                              <View
                                style={[
                                  styles.cellule,
                                  { width: L.catDelta, backgroundColor: '#FFF7D1' },
                                ]}
                              >
                                {eCat.map((e) => {
                                  const delta = deltaCatenaire(e, pivot.avecVoie)
                                  return (
                                    <Text
                                      key={e.id}
                                      style={{
                                        fontFamily: 'Helvetica-Bold',
                                        color: couleurDelta(delta),
                                      }}
                                    >
                                      {delta !== null ? `${delta.toFixed(0)} %` : '—'}
                                    </Text>
                                  )
                                })}
                                {eCat.length === 0 && (
                                  <Text style={{ color: '#DCDCDC' }}>—</Text>
                                )}
                              </View>
                            </>
                          )}
                        </View>
                      )
                    })}
                  </View>
                )
              })
            )}

            {/* Totaux */}
            <View
              wrap={false}
              style={{
                flexDirection: 'row',
                backgroundColor: '#003370',
                borderTopWidth: 1.5,
                borderTopColor: '#004489',
              }}
            >
              <Text
                style={[
                  styles.cellule,
                  {
                    width: 80,
                    color: '#FFFFFF',
                    fontFamily: 'Helvetica-Bold',
                    textAlign: 'right',
                  },
                ]}
              >
                TOTAL :
              </Text>
              {pivot.colonnes.map((c) => {
                const tv = cumulColonne(pivot.avecVoie, c.voie, false)
                const tc = c.avecCat ? cumulColonne(pivot.avecVoie, c.voie, true) : null
                return (
                  <View key={c.voie} style={{ flexDirection: 'row' }}>
                    <Text
                      style={[
                        styles.cellule,
                        {
                          width: L.prevu,
                          color: '#FFFFFF',
                          fontFamily: 'Helvetica-Bold',
                          borderLeftWidth: 1,
                          borderLeftColor: '#0056B3',
                        },
                      ]}
                    >
                      {formatDuree(tv.prevu)}
                    </Text>
                    <Text
                      style={[
                        styles.cellule,
                        {
                          width: L.reel + L.temps,
                          color: '#FFFFFF',
                          fontFamily: 'Helvetica-Bold',
                        },
                      ]}
                    >
                      {formatDuree(tv.reel)}
                    </Text>
                    <Text
                      style={[
                        styles.cellule,
                        { width: L.delta, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
                      ]}
                    >
                      {tv.delta !== null ? `${tv.delta.toFixed(0)} %` : '—'}
                    </Text>
                    {c.avecCat && tc && (
                      <>
                        <Text
                          style={[
                            styles.cellule,
                            {
                              width: L.catReel,
                              color: '#FFFFFF',
                              fontFamily: 'Helvetica-Bold',
                              borderLeftWidth: 1,
                              borderLeftColor: '#0056B3',
                            },
                          ]}
                        >
                          {formatDuree(tc.reel)}
                        </Text>
                        <Text
                          style={[
                            styles.cellule,
                            { width: L.catDelta, color: '#FFFFFF', fontFamily: 'Helvetica-Bold' },
                          ]}
                        >
                          {tc.delta !== null ? `${tc.delta.toFixed(0)} %` : '—'}
                        </Text>
                      </>
                    )}
                  </View>
                )
              })}
            </View>

            <Text style={{ marginTop: 6, fontSize: 6, color: '#5A5A5A' }}>
              Réel : du début réel au plus tardif entre la fin accordée (dernière ARF du RJ
              SNCF) et la restitution effective. Prévu voie : fenêtre ITC du marché. Prévu
              caténaire : ARF réelle de la voie + 30 min, fin accordée de la voie − 30 min.
            </Text>
          </>
        )}

        <PiedPagePDF nomSociete={societe} projetName={projetName} />
      </Page>
    </Document>
  )
}
