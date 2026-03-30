import { Svg, Rect, Circle, Ellipse, Line, Polygon, G } from '@react-pdf/renderer'
import React from 'react'

// ============================================================
// SVG react-pdf components pour chaque type de materiel
// viewBox="0 0 120 60", rendu a width=90 height=50
// ============================================================

const W = 90
const H = 50
const VB = "0 0 120 60"

// --- Wheels helper: 4 wheels at standard wagon positions ---
function Wheels4Wagon() {
  return (
    <G>
      <Circle cx="18" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="34" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="86" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="102" cy="53" r="5" style={{ fill: '#263238' }} />
    </G>
  )
}

// --- Attelages wagon standard ---
function AttelagesWagon() {
  return (
    <G>
      <Rect x="3" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="112" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
    </G>
  )
}

// ============================================================
// 1. Loco
// ============================================================
export function LocoSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Circle cx="18" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="34" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="86" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="102" cy="53" r="5" style={{ fill: '#263238' }} />
      <Rect x="8" y="38" width="104" height="17" rx="2" style={{ fill: '#E65100' }} />
      <Rect x="12" y="22" width="54" height="17" rx="2" style={{ fill: '#FF8F00' }} />
      <Rect x="66" y="14" width="42" height="25" rx="2" style={{ fill: '#E65100' }} />
      <Rect x="70" y="18" width="9" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="82" y="18" width="9" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Line x1="18" y1="25" x2="18" y2="37" style={{ stroke: '#BF360C', strokeWidth: 2 }} />
      <Line x1="25" y1="25" x2="25" y2="37" style={{ stroke: '#BF360C', strokeWidth: 2 }} />
      <Line x1="32" y1="25" x2="32" y2="37" style={{ stroke: '#BF360C', strokeWidth: 2 }} />
      <Line x1="39" y1="25" x2="39" y2="37" style={{ stroke: '#BF360C', strokeWidth: 2 }} />
      <Rect x="26" y="15" width="5" height="8" rx="1" style={{ fill: '#37474F' }} />
      <Ellipse cx="28" cy="15" rx="3" ry="1.5" style={{ fill: '#263238' }} />
      <Rect x="3" y="43" width="6" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="111" y="43" width="6" height="4" rx="1" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

// ============================================================
// 2. Ballastiere
// ============================================================
export function BallastiereSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Circle cx="18" cy="54" r="5" style={{ fill: '#263238' }} />
      <Circle cx="34" cy="54" r="5" style={{ fill: '#263238' }} />
      <Circle cx="86" cy="54" r="5" style={{ fill: '#263238' }} />
      <Circle cx="102" cy="54" r="5" style={{ fill: '#263238' }} />
      <Rect x="10" y="42" width="100" height="13" rx="1" style={{ fill: '#6D2E1A' }} />
      <Polygon points="14,14 106,14 96,42 24,42" style={{ fill: '#7D3520' }} />
      <Rect x="12" y="11" width="96" height="5" rx="1" style={{ fill: '#5D2010' }} />
      <Line x1="60" y1="14" x2="60" y2="42" style={{ stroke: '#5D2010', strokeWidth: 2 }} />
      <Polygon points="24,42 44,42 40,52 28,52" style={{ fill: '#5D2010' }} />
      <Polygon points="76,42 96,42 92,52 80,52" style={{ fill: '#5D2010' }} />
      <Rect x="10" y="20" width="3" height="20" rx="0.5" style={{ fill: '#4A1C0C' }} />
      <Rect x="107" y="20" width="3" height="20" rx="0.5" style={{ fill: '#4A1C0C' }} />
      <Rect x="4" y="46" width="7" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="109" y="46" width="7" height="4" rx="1" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

// ============================================================
// 3. Bigrue
// ============================================================
export function BigrueSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Circle cx="12" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="26" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="94" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="108" cy="53" r="5" style={{ fill: '#263238' }} />
      <Rect x="4" y="38" width="112" height="17" rx="2" style={{ fill: '#7B1FA2' }} />
      <Rect x="4" y="18" width="24" height="21" rx="2" style={{ fill: '#6A1B9A' }} />
      <Rect x="92" y="18" width="24" height="21" rx="2" style={{ fill: '#6A1B9A' }} />
      <Rect x="7" y="22" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="17" y="22" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="95" y="22" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="105" y="22" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="28" y="28" width="64" height="6" rx="1" style={{ fill: '#4A148C' }} />
      <Rect x="54" y="8" width="6" height="22" rx="1" style={{ fill: '#4A148C' }} />
      <Rect x="60" y="8" width="6" height="22" rx="1" style={{ fill: '#4A148C' }} />
      <Line x1="57" y1="8" x2="32" y2="34" style={{ stroke: '#37474F', strokeWidth: 1.5 }} />
      <Line x1="63" y1="8" x2="88" y2="34" style={{ stroke: '#37474F', strokeWidth: 1.5 }} />
      <Rect x="52" y="5" width="16" height="5" rx="2" style={{ fill: '#311B92' }} />
      <Rect x="0" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="115" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

// ============================================================
// 4. BML
// ============================================================
export function BMLSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Circle cx="10" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="24" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="60" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="96" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="110" cy="53" r="5" style={{ fill: '#263238' }} />
      <Rect x="4" y="38" width="112" height="17" rx="2" style={{ fill: '#F48FB1' }} />
      <Rect x="4" y="16" width="24" height="23" rx="2" style={{ fill: '#E91E63' }} />
      <Rect x="92" y="16" width="24" height="23" rx="2" style={{ fill: '#E91E63' }} />
      <Rect x="7" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="17" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="95" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="105" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="28" y="26" width="64" height="8" rx="1" style={{ fill: '#E91E63', opacity: 0.4 }} />
      <Rect x="32" y="30" width="4" height="14" rx="1" style={{ fill: '#C2185B' }} />
      <Rect x="40" y="30" width="4" height="14" rx="1" style={{ fill: '#C2185B' }} />
      <Rect x="48" y="30" width="4" height="14" rx="1" style={{ fill: '#C2185B' }} />
      <Rect x="64" y="30" width="4" height="14" rx="1" style={{ fill: '#C2185B' }} />
      <Rect x="72" y="30" width="4" height="14" rx="1" style={{ fill: '#C2185B' }} />
      <Rect x="80" y="30" width="4" height="14" rx="1" style={{ fill: '#C2185B' }} />
      <Rect x="0" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="115" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

// ============================================================
// 5. Regaleuse
// ============================================================
export function RegaleuseSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Circle cx="20" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="100" cy="53" r="5" style={{ fill: '#263238' }} />
      <Rect x="8" y="38" width="104" height="17" rx="2" style={{ fill: '#9E9D24' }} />
      <Polygon points="16,38 44,38 44,50 16,50" style={{ fill: '#F9A825', opacity: 0.9 }} />
      <Line x1="24" y1="38" x2="24" y2="50" style={{ stroke: '#E65100', strokeWidth: 1.5 }} />
      <Line x1="32" y1="38" x2="32" y2="50" style={{ stroke: '#E65100', strokeWidth: 1.5 }} />
      <Line x1="40" y1="38" x2="40" y2="50" style={{ stroke: '#E65100', strokeWidth: 1.5 }} />
      <Polygon points="76,38 104,38 104,50 76,50" style={{ fill: '#F9A825', opacity: 0.9 }} />
      <Line x1="84" y1="38" x2="84" y2="50" style={{ stroke: '#E65100', strokeWidth: 1.5 }} />
      <Line x1="92" y1="38" x2="92" y2="50" style={{ stroke: '#E65100', strokeWidth: 1.5 }} />
      <Line x1="100" y1="38" x2="100" y2="50" style={{ stroke: '#E65100', strokeWidth: 1.5 }} />
      <Rect x="34" y="16" width="52" height="23" rx="2" style={{ fill: '#CDDC39' }} />
      <Rect x="32" y="12" width="56" height="5" rx="2" style={{ fill: '#AFB42B' }} />
      <Rect x="38" y="20" width="16" height="9" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="66" y="20" width="16" height="9" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="3" y="43" width="6" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="111" y="43" width="6" height="4" rx="1" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

// ============================================================
// 6. Stabilisateur
// ============================================================
export function StabilisateurSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Circle cx="14" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="30" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="90" cy="53" r="5" style={{ fill: '#263238' }} />
      <Circle cx="106" cy="53" r="5" style={{ fill: '#263238' }} />
      <Rect x="4" y="38" width="112" height="17" rx="2" style={{ fill: '#0277BD' }} />
      <Ellipse cx="32" cy="47" rx="10" ry="6" style={{ fill: '#01579B' }} />
      <Ellipse cx="32" cy="47" rx="6" ry="3" style={{ fill: '#0288D1', opacity: 0.5 }} />
      <Ellipse cx="54" cy="47" rx="10" ry="6" style={{ fill: '#01579B' }} />
      <Ellipse cx="54" cy="47" rx="6" ry="3" style={{ fill: '#0288D1', opacity: 0.5 }} />
      <Ellipse cx="76" cy="47" rx="10" ry="6" style={{ fill: '#01579B' }} />
      <Ellipse cx="76" cy="47" rx="6" ry="3" style={{ fill: '#0288D1', opacity: 0.5 }} />
      <Ellipse cx="98" cy="47" rx="10" ry="6" style={{ fill: '#01579B' }} />
      <Ellipse cx="98" cy="47" rx="6" ry="3" style={{ fill: '#0288D1', opacity: 0.5 }} />
      <Rect x="4" y="16" width="24" height="23" rx="2" style={{ fill: '#0288D1' }} />
      <Rect x="92" y="16" width="24" height="23" rx="2" style={{ fill: '#0288D1' }} />
      <Rect x="30" y="20" width="60" height="14" rx="2" style={{ fill: '#039BE5' }} />
      <Rect x="7" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="17" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="95" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="105" y="20" width="8" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="0" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="115" y="43" width="5" height="4" rx="1" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

// ============================================================
// 7. Wagon_vide
// ============================================================
export function WagonVideSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Wheels4Wagon />
      <Rect x="8" y="38" width="104" height="17" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="10" y="26" width="100" height="13" rx="1" style={{ fill: 'none', stroke: '#546E7A', strokeWidth: 2.5 }} />
      <Rect x="12" y="28" width="96" height="9" rx="0.5" style={{ fill: '#ECEFF1' }} />
      <Line x1="12" y1="28" x2="12" y2="36" style={{ stroke: '#90A4AE', strokeWidth: 1 }} />
      <Line x1="108" y1="28" x2="108" y2="36" style={{ stroke: '#90A4AE', strokeWidth: 1 }} />
      <AttelagesWagon />
    </Svg>
  )
}

// ============================================================
// 8. Wagon_ballast
// ============================================================
export function WagonBallastSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Wheels4Wagon />
      <Rect x="8" y="38" width="104" height="17" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="10" y="24" width="100" height="15" rx="1" style={{ fill: '#78909C' }} />
      <Polygon points="12,38 18,28 30,25 46,27 60,24 74,26 88,24 104,27 108,30 108,38" style={{ fill: '#90A4AE' }} />
      <Ellipse cx="26" cy="32" rx="5" ry="2.5" style={{ fill: '#B0BEC5', opacity: 0.8 }} />
      <Ellipse cx="50" cy="29" rx="6" ry="2" style={{ fill: '#CFD8DC', opacity: 0.8 }} />
      <Ellipse cx="74" cy="30" rx="5" ry="2.5" style={{ fill: '#B0BEC5', opacity: 0.8 }} />
      <Ellipse cx="96" cy="29" rx="5" ry="2" style={{ fill: '#CFD8DC', opacity: 0.8 }} />
      <Rect x="10" y="24" width="100" height="15" rx="1" style={{ fill: 'none', stroke: '#546E7A', strokeWidth: 2 }} />
      <AttelagesWagon />
    </Svg>
  )
}

// ============================================================
// 9. Wagon_traverses
// ============================================================
export function WagonTraversesSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Wheels4Wagon />
      <Rect x="8" y="38" width="104" height="17" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="10" y="30" width="100" height="9" rx="0.5" style={{ fill: '#8D6E63' }} />
      <Line x1="26" y1="30" x2="26" y2="39" style={{ stroke: '#6D4C41', strokeWidth: 1 }} />
      <Line x1="42" y1="30" x2="42" y2="39" style={{ stroke: '#6D4C41', strokeWidth: 1 }} />
      <Line x1="58" y1="30" x2="58" y2="39" style={{ stroke: '#6D4C41', strokeWidth: 1 }} />
      <Line x1="74" y1="30" x2="74" y2="39" style={{ stroke: '#6D4C41', strokeWidth: 1 }} />
      <Line x1="90" y1="30" x2="90" y2="39" style={{ stroke: '#6D4C41', strokeWidth: 1 }} />
      <Rect x="10" y="21" width="100" height="9" rx="0.5" style={{ fill: '#A1887F' }} />
      <Line x1="26" y1="21" x2="26" y2="30" style={{ stroke: '#795548', strokeWidth: 1 }} />
      <Line x1="42" y1="21" x2="42" y2="30" style={{ stroke: '#795548', strokeWidth: 1 }} />
      <Line x1="58" y1="21" x2="58" y2="30" style={{ stroke: '#795548', strokeWidth: 1 }} />
      <Line x1="74" y1="21" x2="74" y2="30" style={{ stroke: '#795548', strokeWidth: 1 }} />
      <Line x1="90" y1="21" x2="90" y2="30" style={{ stroke: '#795548', strokeWidth: 1 }} />
      <Rect x="30" y="20" width="2" height="20" rx="0.5" style={{ fill: '#FFA000' }} />
      <Rect x="88" y="20" width="2" height="20" rx="0.5" style={{ fill: '#FFA000' }} />
      <AttelagesWagon />
    </Svg>
  )
}

// ============================================================
// 10. Wagon_rails
// ============================================================
export function WagonRailsSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Wheels4Wagon />
      <Rect x="8" y="38" width="104" height="17" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="8" y="32" width="104" height="3" rx="0.5" style={{ fill: '#90A4AE' }} />
      <Rect x="8" y="36" width="104" height="3" rx="0.5" style={{ fill: '#90A4AE' }} />
      <Rect x="8" y="28" width="104" height="3" rx="0.5" style={{ fill: '#78909C' }} />
      <Rect x="8" y="24" width="104" height="3" rx="0.5" style={{ fill: '#78909C' }} />
      <Rect x="8" y="32" width="104" height="0.8" style={{ fill: '#CFD8DC', opacity: 0.8 }} />
      <Rect x="8" y="36" width="104" height="0.8" style={{ fill: '#CFD8DC', opacity: 0.8 }} />
      <Rect x="20" y="23" width="4" height="16" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="58" y="23" width="4" height="16" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="96" y="23" width="4" height="16" rx="0.5" style={{ fill: '#455A64' }} />
      <AttelagesWagon />
    </Svg>
  )
}

// ============================================================
// 11. Wagon_lrs
// ============================================================
export function WagonLrsSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Wheels4Wagon />
      <Rect x="8" y="38" width="104" height="17" rx="1" style={{ fill: '#E65100', opacity: 0.85 }} />
      <Rect x="2" y="30" width="116" height="2.5" rx="0.5" style={{ fill: '#90A4AE' }} />
      <Rect x="2" y="34" width="116" height="2.5" rx="0.5" style={{ fill: '#90A4AE' }} />
      <Rect x="2" y="26" width="116" height="2.5" rx="0.5" style={{ fill: '#78909C' }} />
      <Rect x="2" y="22" width="116" height="2.5" rx="0.5" style={{ fill: '#78909C' }} />
      <Rect x="2" y="30" width="116" height="0.8" style={{ fill: '#CFD8DC', opacity: 0.8 }} />
      <Rect x="2" y="34" width="116" height="0.8" style={{ fill: '#CFD8DC', opacity: 0.8 }} />
      <Rect x="22" y="21" width="3" height="18" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="58" y="21" width="3" height="18" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="95" y="21" width="3" height="18" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="34" y="20" width="2" height="20" rx="0.5" style={{ fill: '#FFA000' }} />
      <Rect x="84" y="20" width="2" height="20" rx="0.5" style={{ fill: '#FFA000' }} />
      <AttelagesWagon />
    </Svg>
  )
}

// ============================================================
// 12. Wagon_pupitre
// ============================================================
export function WagonPupitreSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Wheels4Wagon />
      <Rect x="8" y="38" width="104" height="17" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="8" y="30" width="104" height="9" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="44" y="16" width="32" height="15" rx="2" style={{ fill: '#607D8B' }} />
      <Rect x="47" y="19" width="10" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="63" y="19" width="10" height="7" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="44" y="13" width="32" height="4" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="14" y="32" width="8" height="6" rx="1" style={{ fill: '#37474F' }} />
      <Rect x="98" y="32" width="8" height="6" rx="1" style={{ fill: '#37474F' }} />
      <AttelagesWagon />
    </Svg>
  )
}

// ============================================================
// Fonction de resolution : retourne le composant JSX react-pdf
// Meme logique de correspondance que getSVGMateriel cote web.
// ============================================================

const COMPONENTS: Record<string, () => React.JSX.Element> = {
  Loco: LocoSVGPDF,
  Ballastiere: BallastiereSVGPDF,
  Bigrue: BigrueSVGPDF,
  BML: BMLSVGPDF,
  Regaleuse: RegaleuseSVGPDF,
  Stabilisateur: StabilisateurSVGPDF,
  Wagon_vide: WagonVideSVGPDF,
  Wagon_ballast: WagonBallastSVGPDF,
  Wagon_traverses: WagonTraversesSVGPDF,
  Wagon_rails: WagonRailsSVGPDF,
  Wagon_lrs: WagonLrsSVGPDF,
  Wagon_pupitre: WagonPupitreSVGPDF,
}

function render(key: string): React.JSX.Element | null {
  const C = COMPONENTS[key]
  return C ? <C /> : null
}

export function getMaterielSVGPDF(type: string, designation?: string): React.JSX.Element | null {
  const d = (designation || '').toLowerCase()
  const t = type.toLowerCase()

  if (d.includes('ballastière') || d.includes('ballastiere') ||
      d.includes('d12') || d.includes('c12') || d.includes('ex 100') || d.includes('ex100'))
    return render('Ballastiere')

  if (d.includes('bigrue') || d.includes('dgs82'))
    return render('Bigrue')

  if (t === 'bml' || d.includes('bml') || d.includes('108-'))
    return render('BML')

  if (t === 'regaleuse' || d.includes('régaleuse') || d.includes('regaleuse') ||
      d.includes('ssp') || d.includes('r24 e'))
    return render('Regaleuse')

  if (t === 'stabilisateur' || d.includes('stabilisateur') || d.includes('dgs42') || d.includes('dgs72'))
    return render('Stabilisateur')

  if (d.includes('traverse'))
    return render('Wagon_traverses')

  if (d.includes('pupitre'))
    return render('Wagon_pupitre')

  if ((d.includes('ballast') || d.includes('appro')) && (t === 'wagon' || t === 'wagonlrs'))
    return render('Wagon_ballast')

  if (d.includes('lrs') || d.includes('goulotte') || d.includes('pousseur') ||
      d.includes('s03') || t === 'wagonlrs')
    return render('Wagon_lrs')

  if (d.includes('rail') || d.includes('60kg') || d.includes('50kg') || d.includes('jic'))
    return render('Wagon_rails')

  switch (t) {
    case 'loco':          return render('Loco')
    case 'ballastiere':   return render('Ballastiere')
    case 'bigrue':        return render('Bigrue')
    case 'bml':           return render('BML')
    case 'regaleuse':     return render('Regaleuse')
    case 'stabilisateur': return render('Stabilisateur')
    case 'wagon':         return render('Wagon_vide')
    case 'wagonlrs':      return render('Wagon_lrs')
    default:              return render('Wagon_vide')
  }
}
