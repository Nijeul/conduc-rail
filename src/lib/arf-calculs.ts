// Calculs partagés du suivi ARF (tableau par voie et export PDF).
// Réel comptabilisé : du début réel au plus tardif entre la fin ACCORDÉE
// (dernière ligne ARF du RJ SNCF) et la restitution effective.
// Prévu voie : fenêtre ITC du marché. Prévu caténaire : ARF réelle de la
// voie concernée + 30 min → fin accordée de la voie − 30 min.

import { calcDureeMinutes } from '@/lib/utils'
import type { ARFRow } from '@/actions/arf'

export const ORDRE_VOIES_PREF = ['V1/VZ', 'V2/V4', 'VT']

export function minutesDe(h: string): number {
  const [H, M] = h.split(':').map(Number)
  return H * 60 + M
}

export function plus30min(h: string): string {
  const t = (minutesDe(h) + 30) % (24 * 60)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

export function moins30min(h: string): string {
  const t = (minutesDe(h) - 30 + 24 * 60) % (24 * 60)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/** Numéro de semaine ISO (S1 à S53) */
export function numeroSemaine(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const jour = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - jour)
  const debutAnnee = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - debutAnnee.getTime()) / 86400000 + 1) / 7)
}

export function calculsLigneARF(row: ARFRow) {
  const finReelle = row.heureRestituee || row.heureFin
  let dureeReelleMin: number | null = null
  let dureePrevueMin: number | null = null
  let pourcentTemps: number | null = null

  if (row.heureDebut && (finReelle || row.heureFinAccordee)) {
    const fins: number[] = []
    if (finReelle) fins.push(calcDureeMinutes(row.heureDebut, finReelle, row.posteNuit))
    if (row.heureFinAccordee)
      fins.push(calcDureeMinutes(row.heureDebut, row.heureFinAccordee, row.posteNuit))
    dureeReelleMin = Math.max(...fins)
  }
  if (row.heureDebutPrevue && row.heureFinPrevue) {
    dureePrevueMin = calcDureeMinutes(row.heureDebutPrevue, row.heureFinPrevue, row.posteNuit)
  }
  if (dureeReelleMin !== null && dureePrevueMin !== null && dureePrevueMin > 0) {
    pourcentTemps = (dureeReelleMin / dureePrevueMin) * 100
  }
  return { dureeReelleMin, dureePrevueMin, pourcentTemps }
}

export function finComptabilisee(e: ARFRow): string | null {
  const finReelle = e.heureRestituee || e.heureFin
  if (finReelle && e.heureFinAccordee)
    return e.heureFinAccordee > finReelle ? e.heureFinAccordee : finReelle
  return finReelle || e.heureFinAccordee || null
}

export function prevuCatenaire(
  e: ARFRow,
  tous: ARFRow[]
): { debut: string; fin: string } | null {
  if (e.typeFermeture !== 'catenaire') return null
  const voie = tous.find(
    (r) =>
      r.typeFermeture !== 'catenaire' &&
      r.voie === e.voie &&
      r.date.slice(0, 10) === e.date.slice(0, 10) &&
      r.heureDebut
  )
  if (!voie?.heureDebut) return null
  const finRef = voie.heureFinAccordee || voie.heureFinPrevue
  if (!finRef) return null
  return { debut: plus30min(voie.heureDebut), fin: moins30min(finRef) }
}

export function deltaCatenaire(e: ARFRow, tous: ARFRow[]): number | null {
  const prevu = prevuCatenaire(e, tous)
  if (!prevu || !e.heureDebut) return null
  const { dureeReelleMin } = calculsLigneARF(e)
  if (dureeReelleMin === null) return null
  const dureePrevue = minutesDe(prevu.fin) - minutesDe(prevu.debut)
  if (dureePrevue <= 0) return null
  return (dureeReelleMin / dureePrevue) * 100
}

export interface PivotARF {
  colonnes: { voie: string; avecCat: boolean }[]
  dates: string[]
  semaines: { num: number; dates: string[] }[]
  parCle: Map<string, ARFRow[]>
  avecVoie: ARFRow[]
}

/** Structure croisée jours × voies commune au tableau et au PDF */
export function pivotARF(rows: ARFRow[]): PivotARF | null {
  const avecVoie = rows.filter((r) => r.voie)
  if (avecVoie.length === 0) return null

  const voies = Array.from(new Set(avecVoie.map((r) => r.voie as string))).sort(
    (a, b) => {
      const ia = ORDRE_VOIES_PREF.indexOf(a)
      const ib = ORDRE_VOIES_PREF.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
    }
  )
  const colonnes = voies.map((voie) => ({
    voie,
    avecCat: avecVoie.some((r) => r.voie === voie && r.typeFermeture === 'catenaire'),
  }))

  const datesAvecDonnees = avecVoie.map((r) => r.date.slice(0, 10)).sort()
  const dates: string[] = []
  const d = new Date(datesAvecDonnees[0] + 'T00:00:00Z')
  const fin = new Date(datesAvecDonnees[datesAvecDonnees.length - 1] + 'T00:00:00Z')
  while (d <= fin) {
    const jour = d.getUTCDay()
    if (jour !== 0 && jour !== 6) dates.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }

  const parCle = new Map<string, ARFRow[]>()
  for (const r of avecVoie) {
    const cle = `${r.date.slice(0, 10)}|${r.voie}|${
      r.typeFermeture === 'catenaire' ? 'cat' : 'voie'
    }`
    const liste = parCle.get(cle) || []
    liste.push(r)
    parCle.set(cle, liste)
  }

  const semaines: { num: number; dates: string[] }[] = []
  for (const dd of dates) {
    const num = numeroSemaine(new Date(dd))
    const dernier = semaines[semaines.length - 1]
    if (dernier && dernier.num === num) dernier.dates.push(dd)
    else semaines.push({ num, dates: [dd] })
  }

  return { colonnes, dates, semaines, parCle, avecVoie }
}

/** Cumuls réel/prévu d'une colonne (voie ou caténaire) */
export function cumulColonne(avecVoie: ARFRow[], voie: string, cat: boolean) {
  let reel = 0
  let prevu = 0
  for (const r of avecVoie) {
    if (r.voie !== voie || (r.typeFermeture === 'catenaire') !== cat) continue
    const { dureeReelleMin, dureePrevueMin } = calculsLigneARF(r)
    if (cat) {
      const p = prevuCatenaire(r, avecVoie)
      if (p && dureeReelleMin !== null) {
        reel += dureeReelleMin
        prevu += minutesDe(p.fin) - minutesDe(p.debut)
      }
    } else {
      if (dureeReelleMin !== null) reel += dureeReelleMin
      if (dureePrevueMin !== null) prevu += dureePrevueMin
    }
  }
  return { reel, prevu, delta: prevu > 0 ? (reel / prevu) * 100 : null }
}
