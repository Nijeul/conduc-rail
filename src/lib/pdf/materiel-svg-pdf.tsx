import { Svg, Rect, Circle, Line, Polygon, G, Text as SvgText } from '@react-pdf/renderer'
import React from 'react'

// ============================================================
// SVG react-pdf components pour chaque type de materiel
// viewBox="0 0 120 60", rendu a width=90 height=50
// ============================================================

const W = 90
const H = 50
const VB = "0 0 120 60"

function Bogies2Standard() {
  return (
    <G>
      <Rect x="14" y="32" width="22" height="5" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="20" cy="42" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="20" cy="42" r="3" style={{ fill: '#546E7A' }} />
      <Circle cx="31" cy="42" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="31" cy="42" r="3" style={{ fill: '#546E7A' }} />
      <Rect x="84" y="32" width="22" height="5" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="89" cy="42" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="89" cy="42" r="3" style={{ fill: '#546E7A' }} />
      <Circle cx="100" cy="42" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="100" cy="42" r="3" style={{ fill: '#546E7A' }} />
    </G>
  )
}

function Attelages(props: { y?: number }) {
  const y = props.y ?? 28
  return (
    <G>
      <Rect x="0" y={y} width="6" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="114" y={y} width="6" height="3" rx="1" style={{ fill: '#455A64' }} />
    </G>
  )
}

export function LocoSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Attelages y={30} />
      <Rect x="8" y="28" width="104" height="8" rx="2" style={{ fill: '#FF8F00' }} />
      <Rect x="10" y="12" width="52" height="16" rx="2" style={{ fill: '#E65100' }} />
      <Line x1="20" y1="14" x2="20" y2="26" style={{ stroke: '#FF8F00', strokeWidth: 1 }} />
      <Line x1="28" y1="14" x2="28" y2="26" style={{ stroke: '#FF8F00', strokeWidth: 1 }} />
      <Line x1="36" y1="14" x2="36" y2="26" style={{ stroke: '#FF8F00', strokeWidth: 1 }} />
      <Line x1="44" y1="14" x2="44" y2="26" style={{ stroke: '#FF8F00', strokeWidth: 1 }} />
      <Line x1="52" y1="14" x2="52" y2="26" style={{ stroke: '#FF8F00', strokeWidth: 1 }} />
      <Rect x="30" y="7" width="6" height="5" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="31" y="5" width="4" height="3" rx="1" style={{ fill: '#78909C' }} />
      <Rect x="64" y="6" width="46" height="22" rx="2" style={{ fill: '#FF8F00' }} />
      <Rect x="96" y="9" width="11" height="10" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="68" y="9" width="10" height="10" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="82" y="9" width="10" height="10" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="14" y="36" width="22" height="5" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="20" cy="44" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="20" cy="44" r="3" style={{ fill: '#546E7A' }} />
      <Circle cx="31" cy="44" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="31" cy="44" r="3" style={{ fill: '#546E7A' }} />
      <Rect x="84" y="36" width="22" height="5" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="89" cy="44" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="89" cy="44" r="3" style={{ fill: '#546E7A' }} />
      <Circle cx="100" cy="44" r="5" style={{ fill: '#37474F' }} />
      <Circle cx="100" cy="44" r="3" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

export function WagonVideSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Attelages />
      <Rect x="8" y="26" width="104" height="6" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="12" y="8" width="96" height="18" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="14" y="10" width="92" height="14" rx="1" style={{ fill: '#ECEFF1' }} />
      <Line x1="36" y1="8" x2="36" y2="26" style={{ stroke: '#455A64', strokeWidth: 0.8 }} />
      <Line x1="60" y1="8" x2="60" y2="26" style={{ stroke: '#455A64', strokeWidth: 0.8 }} />
      <Line x1="84" y1="8" x2="84" y2="26" style={{ stroke: '#455A64', strokeWidth: 0.8 }} />
      <Bogies2Standard />
    </Svg>
  )
}

export function WagonBallastSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Attelages />
      <Rect x="8" y="26" width="104" height="6" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="12" y="10" width="96" height="16" rx="1" style={{ fill: '#78909C' }} />
      <Polygon points="14,10 18,5 28,3 40,6 50,2 60,4 72,3 82,5 92,3 100,6 106,4 108,10" style={{ fill: '#90A4AE' }} />
      <Circle cx="25" cy="7" r="0.8" style={{ fill: '#78909C' }} />
      <Circle cx="45" cy="6" r="0.9" style={{ fill: '#78909C' }} />
      <Circle cx="65" cy="5" r="0.7" style={{ fill: '#78909C' }} />
      <Circle cx="85" cy="6" r="0.8" style={{ fill: '#78909C' }} />
      <Line x1="36" y1="10" x2="36" y2="26" style={{ stroke: '#455A64', strokeWidth: 0.8 }} />
      <Line x1="60" y1="10" x2="60" y2="26" style={{ stroke: '#455A64', strokeWidth: 0.8 }} />
      <Line x1="84" y1="10" x2="84" y2="26" style={{ stroke: '#455A64', strokeWidth: 0.8 }} />
      <Bogies2Standard />
    </Svg>
  )
}

export function WagonTraversesSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Attelages />
      <Rect x="8" y="26" width="104" height="6" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="10" y="22" width="3" height="10" style={{ fill: '#546E7A' }} />
      <Rect x="107" y="22" width="3" height="10" style={{ fill: '#546E7A' }} />
      <Rect x="14" y="16" width="92" height="5" rx="0.5" style={{ fill: '#8D6E63' }} />
      <Rect x="14" y="21" width="92" height="5" rx="0.5" style={{ fill: '#A1887F' }} />
      <Rect x="14" y="6" width="92" height="5" rx="0.5" style={{ fill: '#8D6E63' }} />
      <Rect x="14" y="11" width="92" height="5" rx="0.5" style={{ fill: '#A1887F' }} />
      <Rect x="30" y="4" width="2" height="24" rx="0.5" style={{ fill: '#FFA000', opacity: 0.8 }} />
      <Rect x="58" y="4" width="2" height="24" rx="0.5" style={{ fill: '#FFA000', opacity: 0.8 }} />
      <Rect x="86" y="4" width="2" height="24" rx="0.5" style={{ fill: '#FFA000', opacity: 0.8 }} />
      <Bogies2Standard />
    </Svg>
  )
}

export function WagonRailsSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Attelages />
      <Rect x="8" y="26" width="104" height="6" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="10" y="22" width="3" height="10" style={{ fill: '#546E7A' }} />
      <Rect x="107" y="22" width="3" height="10" style={{ fill: '#546E7A' }} />
      <Rect x="25" y="14" width="4" height="12" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="55" y="14" width="4" height="12" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="85" y="14" width="4" height="12" rx="0.5" style={{ fill: '#455A64' }} />
      <Rect x="10" y="11" width="100" height="2" rx="0.5" style={{ fill: '#78909C' }} />
      <Rect x="10" y="15" width="100" height="2" rx="0.5" style={{ fill: '#90A4AE' }} />
      <Rect x="10" y="19" width="100" height="2" rx="0.5" style={{ fill: '#78909C' }} />
      <Rect x="10" y="23" width="100" height="2" rx="0.5" style={{ fill: '#90A4AE' }} />
      <Bogies2Standard />
    </Svg>
  )
}

export function BallastiereSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Rect x="0" y="26" width="5" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="115" y="26" width="5" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="6" y="24" width="108" height="7" rx="1" style={{ fill: '#1565C0' }} />
      <Polygon points="20,31 28,38 12,38" style={{ fill: '#0D47A1' }} />
      <Polygon points="50,31 58,38 42,38" style={{ fill: '#0D47A1' }} />
      <Polygon points="80,31 88,38 72,38" style={{ fill: '#0D47A1' }} />
      <Rect x="20" y="8" width="80" height="16" rx="2" style={{ fill: '#1976D2' }} />
      <Rect x="22" y="18" width="76" height="2" style={{ fill: '#FFA000' }} />
      <Rect x="6" y="6" width="18" height="18" rx="2" style={{ fill: '#1565C0' }} />
      <Rect x="9" y="9" width="12" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="96" y="6" width="18" height="18" rx="2" style={{ fill: '#1565C0' }} />
      <Rect x="99" y="9" width="12" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="12" y="38" width="18" height="4" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="17" cy="46" r="4.5" style={{ fill: '#37474F' }} />
      <Circle cx="17" cy="46" r="2.5" style={{ fill: '#546E7A' }} />
      <Circle cx="26" cy="46" r="4.5" style={{ fill: '#37474F' }} />
      <Circle cx="26" cy="46" r="2.5" style={{ fill: '#546E7A' }} />
      <Rect x="50" y="38" width="18" height="4" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="55" cy="46" r="4.5" style={{ fill: '#37474F' }} />
      <Circle cx="55" cy="46" r="2.5" style={{ fill: '#546E7A' }} />
      <Circle cx="64" cy="46" r="4.5" style={{ fill: '#37474F' }} />
      <Circle cx="64" cy="46" r="2.5" style={{ fill: '#546E7A' }} />
      <Rect x="88" y="38" width="18" height="4" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="93" cy="46" r="4.5" style={{ fill: '#37474F' }} />
      <Circle cx="93" cy="46" r="2.5" style={{ fill: '#546E7A' }} />
      <Circle cx="102" cy="46" r="4.5" style={{ fill: '#37474F' }} />
      <Circle cx="102" cy="46" r="2.5" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

export function BourreuseSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Rect x="0" y="24" width="5" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="115" y="24" width="5" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="6" y="22" width="108" height="7" rx="1" style={{ fill: '#FFA000' }} />
      <Rect x="20" y="8" width="80" height="14" rx="2" style={{ fill: '#FF8F00' }} />
      <Rect x="6" y="4" width="18" height="18" rx="2" style={{ fill: '#E65100' }} />
      <Rect x="9" y="7" width="12" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="96" y="4" width="18" height="18" rx="2" style={{ fill: '#E65100' }} />
      <Rect x="99" y="7" width="12" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="35" y="4" width="12" height="4" rx="1" style={{ fill: '#E65100' }} />
      <Rect x="55" y="4" width="8" height="4" rx="1" style={{ fill: '#E65100' }} />
      <Rect x="70" y="4" width="14" height="4" rx="1" style={{ fill: '#E65100' }} />
      <Rect x="52" y="22" width="3" height="14" rx="0.5" style={{ fill: '#BF360C' }} />
      <Rect x="58" y="22" width="3" height="14" rx="0.5" style={{ fill: '#BF360C' }} />
      <Rect x="64" y="22" width="3" height="14" rx="0.5" style={{ fill: '#BF360C' }} />
      <Rect x="49" y="34" width="21" height="3" rx="0.5" style={{ fill: '#BF360C' }} />
      <Rect x="8" y="29" width="14" height="4" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="12" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="12" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Circle cx="19" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="19" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Rect x="30" y="29" width="14" height="4" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="34" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="34" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Circle cx="41" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="41" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Rect x="75" y="29" width="14" height="4" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="79" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="79" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Circle cx="86" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="86" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Rect x="96" y="29" width="14" height="4" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="100" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="100" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Circle cx="107" cy="37" r="4" style={{ fill: '#37474F' }} />
      <Circle cx="107" cy="37" r="2.5" style={{ fill: '#546E7A' }} />
      <Rect x="48" y="37" width="10" height="3" rx="1" style={{ fill: '#37474F' }} />
      <Circle cx="51" cy="43" r="3.5" style={{ fill: '#37474F' }} />
      <Circle cx="51" cy="43" r="2" style={{ fill: '#546E7A' }} />
      <Circle cx="56" cy="43" r="3.5" style={{ fill: '#37474F' }} />
      <Circle cx="56" cy="43" r="2" style={{ fill: '#546E7A' }} />
    </Svg>
  )
}

export function LocotracteurSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Rect x="0" y="28" width="8" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="112" y="28" width="8" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="15" y="26" width="90" height="8" rx="2" style={{ fill: '#2E7D32' }} />
      <Rect x="15" y="14" width="30" height="12" rx="2" style={{ fill: '#388E3C' }} />
      <Line x1="22" y1="16" x2="22" y2="24" style={{ stroke: '#2E7D32', strokeWidth: 1 }} />
      <Line x1="28" y1="16" x2="28" y2="24" style={{ stroke: '#2E7D32', strokeWidth: 1 }} />
      <Line x1="34" y1="16" x2="34" y2="24" style={{ stroke: '#2E7D32', strokeWidth: 1 }} />
      <Line x1="40" y1="16" x2="40" y2="24" style={{ stroke: '#2E7D32', strokeWidth: 1 }} />
      <Rect x="28" y="9" width="5" height="5" rx="1" style={{ fill: '#546E7A' }} />
      <Rect x="48" y="6" width="40" height="20" rx="2" style={{ fill: '#2E7D32' }} />
      <Rect x="52" y="9" width="14" height="10" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="70" y="9" width="14" height="10" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="90" y="18" width="15" height="8" rx="2" style={{ fill: '#388E3C' }} />
      <Circle cx="35" cy="42" r="7" style={{ fill: '#37474F' }} />
      <Circle cx="35" cy="42" r="4.5" style={{ fill: '#546E7A' }} />
      <Circle cx="35" cy="42" r="1.5" style={{ fill: '#37474F' }} />
      <Circle cx="85" cy="42" r="7" style={{ fill: '#37474F' }} />
      <Circle cx="85" cy="42" r="4.5" style={{ fill: '#546E7A' }} />
      <Circle cx="85" cy="42" r="1.5" style={{ fill: '#37474F' }} />
      <Rect x="28" y="34" width="14" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="78" y="34" width="14" height="3" rx="1" style={{ fill: '#455A64' }} />
    </Svg>
  )
}

export function DraisineSVGPDF() {
  return (
    <Svg width={W} height={H} viewBox={VB}>
      <Rect x="0" y="30" width="8" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="112" y="30" width="8" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="18" y="28" width="84" height="6" rx="2" style={{ fill: '#6A1B9A' }} />
      <Rect x="20" y="14" width="80" height="14" rx="2" style={{ fill: '#7B1FA2' }} />
      <Rect x="22" y="8" width="76" height="6" rx="2" style={{ fill: '#6A1B9A' }} />
      <Rect x="26" y="16" width="16" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="46" y="16" width="16" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="66" y="16" width="16" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="86" y="16" width="12" height="8" rx="1" style={{ fill: '#B3E5FC' }} />
      <Rect x="56" y="4" width="8" height="4" rx="2" style={{ fill: '#FFC107' }} />
      <Rect x="58" y="2" width="4" height="2" rx="1" style={{ fill: '#FFD54F' }} />
      <Circle cx="35" cy="40" r="6" style={{ fill: '#37474F' }} />
      <Circle cx="35" cy="40" r="3.5" style={{ fill: '#546E7A' }} />
      <Circle cx="35" cy="40" r="1.5" style={{ fill: '#37474F' }} />
      <Circle cx="85" cy="40" r="6" style={{ fill: '#37474F' }} />
      <Circle cx="85" cy="40" r="3.5" style={{ fill: '#546E7A' }} />
      <Circle cx="85" cy="40" r="1.5" style={{ fill: '#37474F' }} />
      <Rect x="28" y="34" width="14" height="3" rx="1" style={{ fill: '#455A64' }} />
      <Rect x="78" y="34" width="14" height="3" rx="1" style={{ fill: '#455A64' }} />
    </Svg>
  )
}

// ============================================================
// Fonction de resolution : retourne le composant JSX react-pdf
// ============================================================

const COMPONENTS: Record<string, () => React.JSX.Element> = {
  Loco: LocoSVGPDF,
  Wagon_vide: WagonVideSVGPDF,
  Wagon_ballast: WagonBallastSVGPDF,
  Wagon_traverses: WagonTraversesSVGPDF,
  Wagon_rails: WagonRailsSVGPDF,
  Ballastiere: BallastiereSVGPDF,
  Bourreuse: BourreuseSVGPDF,
  Locotracteur: LocotracteurSVGPDF,
  Draisine: DraisineSVGPDF,
}

/**
 * Retourne le composant SVG react-pdf pour le type/designation donne.
 * Meme logique de recherche que getSVGMateriel cote web.
 */
export function getMaterielSVGPDF(type: string, designation?: string): React.JSX.Element | null {
  const desigLower = (designation || '').toLowerCase()

  // Recherche par mots-cles dans la designation
  if (desigLower.includes('ballast') && desigLower.includes('iere')) {
    const C = COMPONENTS['Ballastiere']
    return C ? <C /> : null
  }
  if (desigLower.includes('bourreuse')) {
    const C = COMPONENTS['Bourreuse']
    return C ? <C /> : null
  }
  if (desigLower.includes('draisine')) {
    const C = COMPONENTS['Draisine']
    return C ? <C /> : null
  }
  if (desigLower.includes('locotracteur')) {
    const C = COMPONENTS['Locotracteur']
    return C ? <C /> : null
  }
  if (desigLower.includes('ballast')) {
    const C = COMPONENTS['Wagon_ballast']
    return C ? <C /> : null
  }
  if (desigLower.includes('traverse')) {
    const C = COMPONENTS['Wagon_traverses']
    return C ? <C /> : null
  }
  if (desigLower.includes('rail')) {
    const C = COMPONENTS['Wagon_rails']
    return C ? <C /> : null
  }
  if (desigLower.includes('vide') || desigLower.includes('tombeau')) {
    const C = COMPONENTS['Wagon_vide']
    return C ? <C /> : null
  }

  // Recherche par type exact
  if (COMPONENTS[type]) {
    const C = COMPONENTS[type]
    return <C />
  }

  // Recherche par type generique
  const typeLower = type.toLowerCase()
  if (typeLower === 'loco' || typeLower === 'locomotive') {
    return <LocoSVGPDF />
  }
  if (typeLower === 'locotracteur') {
    return <LocotracteurSVGPDF />
  }
  if (typeLower === 'draisine') {
    return <DraisineSVGPDF />
  }
  if (typeLower === 'bourreuse') {
    return <BourreuseSVGPDF />
  }
  if (typeLower === 'wagon') {
    return <WagonVideSVGPDF />
  }

  return null
}
