// Placement des bulles de la frise chronologique (anti-chevauchement).
// Principe : chaque bulle cherche d'abord une place au plus près de la ligne
// de temps, en se décalant horizontalement si besoin (trait de rappel incliné
// vers son point de date) ; on n'empile en hauteur qu'en dernier recours.

export const LARGEUR_BULLE = 185
export const MARGE_H = 10
export const MARGE_V = 8
export const QUEUE_H = 14

export interface PlacementBulle {
  id: string
  /** centre horizontal de la bulle (peut être décalé de la date) */
  x: number
  /** position de la date sur la ligne de temps (point + trait de rappel) */
  xAncre: number
  y: number
  cote: 'haut' | 'bas'
  largeur: number
  hauteur: number
}

export function estimerHauteur(titre: string, description?: string): number {
  const lignesTitre = Math.ceil(titre.length / 20)
  const lignesDesc = description ? Math.min(3, Math.ceil(description.length / 22)) : 0
  const hauteurDate = 18
  const hauteurTitre = lignesTitre * 16 + 4
  const hauteurDesc = lignesDesc > 0 ? lignesDesc * 14 + 10 : 0
  const padding = 14
  return Math.max(55, hauteurDate + hauteurTitre + hauteurDesc + padding)
}

export function calculerPlacements(
  evenements: { id: string; titre: string; description?: string | null }[],
  positionsX: Record<string, number>,
  yLigne: number
): PlacementBulle[] {
  const placements: PlacementBulle[] = []
  const tries = [...evenements].sort(
    (a, b) => positionsX[a.id] - positionsX[b.id]
  )

  // Les bulles restent à l'aplomb de leur date (traits de rappel verticaux)
  const libre = (cx: number, y: number, largeur: number, hauteur: number) =>
    !placements.some(
      (p) =>
        Math.abs(cx - p.x) < (largeur + p.largeur) / 2 + MARGE_H &&
        y < p.y + p.hauteur + MARGE_V &&
        p.y < y + hauteur + MARGE_V
    )

  for (const ev of tries) {
    const xAncre = positionsX[ev.id]
    const largeur = LARGEUR_BULLE
    const hauteur = estimerHauteur(ev.titre, ev.description ?? undefined)
    let pose: PlacementBulle | null = null

    // 1) Contre la ligne de temps
    for (const cote of ['haut', 'bas'] as const) {
      const y = cote === 'haut' ? yLigne - QUEUE_H - hauteur : yLigne + QUEUE_H
      if (libre(xAncre, y, largeur, hauteur)) {
        pose = { id: ev.id, x: xAncre, xAncre, y, cote, largeur, hauteur }
        break
      }
    }

    // 2) Sinon, empiler au plus près de la ligne en s'appuyant sur les
    //    bulles existantes
    if (!pose) {
      const candidats: { y: number; cote: 'haut' | 'bas' }[] = []
      for (const p of placements) {
        const yHaut = p.y - MARGE_V - hauteur
        if (yHaut + hauteur <= yLigne - QUEUE_H)
          candidats.push({ y: yHaut, cote: 'haut' })
        const yBas = p.y + p.hauteur + MARGE_V
        if (yBas >= yLigne + QUEUE_H) candidats.push({ y: yBas, cote: 'bas' })
      }
      candidats.sort(
        (a, b) =>
          Math.abs((a.y + hauteur / 2) - yLigne) -
          Math.abs((b.y + hauteur / 2) - yLigne)
      )
      for (const cand of candidats) {
        if (libre(xAncre, cand.y, largeur, hauteur)) {
          pose = {
            id: ev.id,
            x: xAncre,
            xAncre,
            y: cand.y,
            cote: cand.cote,
            largeur,
            hauteur,
          }
          break
        }
      }
    }

    // 3) Filet de sécurité : tout en haut, garanti libre
    if (!pose) {
      const topMin =
        placements.length > 0
          ? Math.min(...placements.map((p) => p.y))
          : yLigne - QUEUE_H
      pose = {
        id: ev.id,
        x: xAncre,
        xAncre,
        y: topMin - MARGE_V - hauteur,
        cote: 'haut',
        largeur,
        hauteur,
      }
    }

    placements.push(pose)
  }

  return placements
}

export function calculerHauteurConteneur(
  placements: PlacementBulle[],
  _yLigne: number
): { hauteur: number; offsetY: number } {
  if (placements.length === 0) return { hauteur: 400, offsetY: 0 }

  const topMin = Math.min(...placements.map((p) => p.y))
  const bottomMax = Math.max(...placements.map((p) => p.y + p.hauteur))

  const MARGE_HAUT = 30
  const MARGE_BAS = 50

  const offsetY = topMin < MARGE_HAUT
    ? Math.ceil(Math.abs(topMin)) + MARGE_HAUT
    : 0

  const hauteur = offsetY + bottomMax + MARGE_BAS
  return { hauteur: Math.max(hauteur, 350), offsetY }
}
