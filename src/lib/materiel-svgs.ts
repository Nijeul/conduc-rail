/**
 * SVG inline pour chaque type de materiel ferroviaire.
 * Vue de cote stylisee, viewBox="0 0 120 60".
 */

export const MATERIEL_SVGS: Record<string, string> = {
  Loco: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelage gauche -->
  <rect x="0" y="30" width="6" height="3" rx="1" fill="#455A64"/>
  <!-- Attelage droit -->
  <rect x="114" y="30" width="6" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis -->
  <rect x="8" y="28" width="104" height="8" rx="2" fill="#FF8F00"/>
  <!-- Capot moteur -->
  <rect x="10" y="12" width="52" height="16" rx="2" fill="#E65100"/>
  <!-- Grilles moteur -->
  <line x1="20" y1="14" x2="20" y2="26" stroke="#FF8F00" stroke-width="1"/>
  <line x1="28" y1="14" x2="28" y2="26" stroke="#FF8F00" stroke-width="1"/>
  <line x1="36" y1="14" x2="36" y2="26" stroke="#FF8F00" stroke-width="1"/>
  <line x1="44" y1="14" x2="44" y2="26" stroke="#FF8F00" stroke-width="1"/>
  <line x1="52" y1="14" x2="52" y2="26" stroke="#FF8F00" stroke-width="1"/>
  <!-- Pot d'echappement -->
  <rect x="30" y="7" width="6" height="5" rx="1" fill="#546E7A"/>
  <rect x="31" y="5" width="4" height="3" rx="1" fill="#78909C"/>
  <!-- Cabine -->
  <rect x="64" y="6" width="46" height="22" rx="2" fill="#FF8F00"/>
  <!-- Fenetre cabine avant -->
  <rect x="96" y="9" width="11" height="10" rx="1" fill="#B3E5FC"/>
  <rect x="96" y="9" width="11" height="10" rx="1" stroke="#E65100" stroke-width="0.5" fill="none"/>
  <!-- Fenetre cabine laterale -->
  <rect x="68" y="9" width="10" height="10" rx="1" fill="#B3E5FC"/>
  <rect x="68" y="9" width="10" height="10" rx="1" stroke="#E65100" stroke-width="0.5" fill="none"/>
  <rect x="82" y="9" width="10" height="10" rx="1" fill="#B3E5FC"/>
  <rect x="82" y="9" width="10" height="10" rx="1" stroke="#E65100" stroke-width="0.5" fill="none"/>
  <!-- Bogies -->
  <rect x="14" y="36" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="20" cy="44" r="5" fill="#37474F"/>
  <circle cx="20" cy="44" r="3" fill="#546E7A"/>
  <circle cx="31" cy="44" r="5" fill="#37474F"/>
  <circle cx="31" cy="44" r="3" fill="#546E7A"/>
  <rect x="84" y="36" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="89" cy="44" r="5" fill="#37474F"/>
  <circle cx="89" cy="44" r="3" fill="#546E7A"/>
  <circle cx="100" cy="44" r="5" fill="#37474F"/>
  <circle cx="100" cy="44" r="3" fill="#546E7A"/>
</svg>`,

  Wagon_vide: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <rect x="114" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis -->
  <rect x="8" y="26" width="104" height="6" rx="1" fill="#546E7A"/>
  <!-- Caisse tombeau -->
  <rect x="12" y="8" width="96" height="18" rx="1" fill="#546E7A" stroke="#455A64" stroke-width="0.5"/>
  <!-- Interieur vide -->
  <rect x="14" y="10" width="92" height="14" rx="1" fill="#ECEFF1"/>
  <!-- Renforts caisse -->
  <line x1="36" y1="8" x2="36" y2="26" stroke="#455A64" stroke-width="0.8"/>
  <line x1="60" y1="8" x2="60" y2="26" stroke="#455A64" stroke-width="0.8"/>
  <line x1="84" y1="8" x2="84" y2="26" stroke="#455A64" stroke-width="0.8"/>
  <!-- Bogies -->
  <rect x="14" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="20" cy="42" r="5" fill="#37474F"/>
  <circle cx="20" cy="42" r="3" fill="#546E7A"/>
  <circle cx="31" cy="42" r="5" fill="#37474F"/>
  <circle cx="31" cy="42" r="3" fill="#546E7A"/>
  <rect x="84" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="89" cy="42" r="5" fill="#37474F"/>
  <circle cx="89" cy="42" r="3" fill="#546E7A"/>
  <circle cx="100" cy="42" r="5" fill="#37474F"/>
  <circle cx="100" cy="42" r="3" fill="#546E7A"/>
</svg>`,

  Wagon_ballast: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <rect x="114" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis -->
  <rect x="8" y="26" width="104" height="6" rx="1" fill="#546E7A"/>
  <!-- Caisse -->
  <rect x="12" y="10" width="96" height="16" rx="1" fill="#78909C" stroke="#455A64" stroke-width="0.5"/>
  <!-- Tas de ballast irregulier -->
  <polygon points="14,10 18,5 28,3 40,6 50,2 60,4 72,3 82,5 92,3 100,6 106,4 108,10" fill="#90A4AE"/>
  <!-- Grains de ballast simules -->
  <circle cx="25" cy="7" r="0.8" fill="#78909C"/>
  <circle cx="35" cy="5" r="0.7" fill="#78909C"/>
  <circle cx="45" cy="6" r="0.9" fill="#78909C"/>
  <circle cx="55" cy="4" r="0.8" fill="#78909C"/>
  <circle cx="65" cy="5" r="0.7" fill="#78909C"/>
  <circle cx="75" cy="4" r="0.9" fill="#78909C"/>
  <circle cx="85" cy="6" r="0.8" fill="#78909C"/>
  <circle cx="95" cy="5" r="0.7" fill="#78909C"/>
  <circle cx="30" cy="9" r="0.6" fill="#607D8B"/>
  <circle cx="50" cy="8" r="0.6" fill="#607D8B"/>
  <circle cx="70" cy="9" r="0.6" fill="#607D8B"/>
  <circle cx="90" cy="8" r="0.6" fill="#607D8B"/>
  <!-- Renforts caisse -->
  <line x1="36" y1="10" x2="36" y2="26" stroke="#455A64" stroke-width="0.8"/>
  <line x1="60" y1="10" x2="60" y2="26" stroke="#455A64" stroke-width="0.8"/>
  <line x1="84" y1="10" x2="84" y2="26" stroke="#455A64" stroke-width="0.8"/>
  <!-- Bogies -->
  <rect x="14" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="20" cy="42" r="5" fill="#37474F"/>
  <circle cx="20" cy="42" r="3" fill="#546E7A"/>
  <circle cx="31" cy="42" r="5" fill="#37474F"/>
  <circle cx="31" cy="42" r="3" fill="#546E7A"/>
  <rect x="84" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="89" cy="42" r="5" fill="#37474F"/>
  <circle cx="89" cy="42" r="3" fill="#546E7A"/>
  <circle cx="100" cy="42" r="5" fill="#37474F"/>
  <circle cx="100" cy="42" r="3" fill="#546E7A"/>
</svg>`,

  Wagon_traverses: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <rect x="114" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis wagon plat -->
  <rect x="8" y="26" width="104" height="6" rx="1" fill="#546E7A"/>
  <!-- Ridelles basses -->
  <rect x="10" y="22" width="3" height="10" fill="#546E7A"/>
  <rect x="107" y="22" width="3" height="10" fill="#546E7A"/>
  <!-- Rang de traverses 1 (dessous) -->
  <rect x="14" y="16" width="92" height="5" rx="0.5" fill="#8D6E63"/>
  <rect x="14" y="21" width="92" height="5" rx="0.5" fill="#A1887F"/>
  <!-- Separations traverses -->
  <line x1="24" y1="16" x2="24" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="34" y1="16" x2="34" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="44" y1="16" x2="44" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="54" y1="16" x2="54" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="64" y1="16" x2="64" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="74" y1="16" x2="74" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="84" y1="16" x2="84" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="94" y1="16" x2="94" y2="26" stroke="#6D4C41" stroke-width="0.5"/>
  <!-- Rang de traverses 2 (dessus) -->
  <rect x="14" y="6" width="92" height="5" rx="0.5" fill="#8D6E63"/>
  <rect x="14" y="11" width="92" height="5" rx="0.5" fill="#A1887F"/>
  <line x1="24" y1="6" x2="24" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="34" y1="6" x2="34" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="44" y1="6" x2="44" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="54" y1="6" x2="54" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="64" y1="6" x2="64" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="74" y1="6" x2="74" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="84" y1="6" x2="84" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <line x1="94" y1="6" x2="94" y2="16" stroke="#6D4C41" stroke-width="0.5"/>
  <!-- Sangles jaunes -->
  <rect x="30" y="4" width="2" height="24" rx="0.5" fill="#FFA000" opacity="0.8"/>
  <rect x="58" y="4" width="2" height="24" rx="0.5" fill="#FFA000" opacity="0.8"/>
  <rect x="86" y="4" width="2" height="24" rx="0.5" fill="#FFA000" opacity="0.8"/>
  <!-- Bogies -->
  <rect x="14" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="20" cy="42" r="5" fill="#37474F"/>
  <circle cx="20" cy="42" r="3" fill="#546E7A"/>
  <circle cx="31" cy="42" r="5" fill="#37474F"/>
  <circle cx="31" cy="42" r="3" fill="#546E7A"/>
  <rect x="84" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="89" cy="42" r="5" fill="#37474F"/>
  <circle cx="89" cy="42" r="3" fill="#546E7A"/>
  <circle cx="100" cy="42" r="5" fill="#37474F"/>
  <circle cx="100" cy="42" r="3" fill="#546E7A"/>
</svg>`,

  Wagon_rails: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <rect x="114" y="28" width="6" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis wagon plat -->
  <rect x="8" y="26" width="104" height="6" rx="1" fill="#546E7A"/>
  <!-- Ridelles basses -->
  <rect x="10" y="22" width="3" height="10" fill="#546E7A"/>
  <rect x="107" y="22" width="3" height="10" fill="#546E7A"/>
  <!-- Supports de calage -->
  <rect x="25" y="14" width="4" height="12" rx="0.5" fill="#455A64"/>
  <rect x="55" y="14" width="4" height="12" rx="0.5" fill="#455A64"/>
  <rect x="85" y="14" width="4" height="12" rx="0.5" fill="#455A64"/>
  <!-- 4 rails paralleles argentes -->
  <rect x="10" y="15" width="100" height="2" rx="0.5" fill="#90A4AE"/>
  <rect x="10" y="15" width="100" height="0.5" fill="#B0BEC5" opacity="0.6"/>
  <rect x="10" y="19" width="100" height="2" rx="0.5" fill="#78909C"/>
  <rect x="10" y="19" width="100" height="0.5" fill="#90A4AE" opacity="0.6"/>
  <rect x="10" y="23" width="100" height="2" rx="0.5" fill="#90A4AE"/>
  <rect x="10" y="23" width="100" height="0.5" fill="#B0BEC5" opacity="0.6"/>
  <rect x="10" y="11" width="100" height="2" rx="0.5" fill="#78909C"/>
  <rect x="10" y="11" width="100" height="0.5" fill="#90A4AE" opacity="0.6"/>
  <!-- Bogies -->
  <rect x="14" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="20" cy="42" r="5" fill="#37474F"/>
  <circle cx="20" cy="42" r="3" fill="#546E7A"/>
  <circle cx="31" cy="42" r="5" fill="#37474F"/>
  <circle cx="31" cy="42" r="3" fill="#546E7A"/>
  <rect x="84" y="32" width="22" height="5" rx="1" fill="#37474F"/>
  <circle cx="89" cy="42" r="5" fill="#37474F"/>
  <circle cx="89" cy="42" r="3" fill="#546E7A"/>
  <circle cx="100" cy="42" r="5" fill="#37474F"/>
  <circle cx="100" cy="42" r="3" fill="#546E7A"/>
</svg>`,

  Ballastiere: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="26" width="5" height="3" rx="1" fill="#455A64"/>
  <rect x="115" y="26" width="5" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis bleu -->
  <rect x="6" y="24" width="108" height="7" rx="1" fill="#1565C0"/>
  <!-- Tremies sous chassis -->
  <polygon points="20,31 28,38 12,38" fill="#0D47A1"/>
  <polygon points="50,31 58,38 42,38" fill="#0D47A1"/>
  <polygon points="80,31 88,38 72,38" fill="#0D47A1"/>
  <!-- Caisse centrale -->
  <rect x="20" y="8" width="80" height="16" rx="2" fill="#1976D2"/>
  <!-- Marquage jaune -->
  <rect x="22" y="18" width="76" height="2" fill="#FFA000"/>
  <!-- Cabine gauche -->
  <rect x="6" y="6" width="18" height="18" rx="2" fill="#1565C0" stroke="#0D47A1" stroke-width="0.5"/>
  <rect x="9" y="9" width="12" height="8" rx="1" fill="#B3E5FC"/>
  <!-- Cabine droite -->
  <rect x="96" y="6" width="18" height="18" rx="2" fill="#1565C0" stroke="#0D47A1" stroke-width="0.5"/>
  <rect x="99" y="9" width="12" height="8" rx="1" fill="#B3E5FC"/>
  <!-- Bogies -->
  <rect x="12" y="38" width="18" height="4" rx="1" fill="#37474F"/>
  <circle cx="17" cy="46" r="4.5" fill="#37474F"/>
  <circle cx="17" cy="46" r="2.5" fill="#546E7A"/>
  <circle cx="26" cy="46" r="4.5" fill="#37474F"/>
  <circle cx="26" cy="46" r="2.5" fill="#546E7A"/>
  <rect x="50" y="38" width="18" height="4" rx="1" fill="#37474F"/>
  <circle cx="55" cy="46" r="4.5" fill="#37474F"/>
  <circle cx="55" cy="46" r="2.5" fill="#546E7A"/>
  <circle cx="64" cy="46" r="4.5" fill="#37474F"/>
  <circle cx="64" cy="46" r="2.5" fill="#546E7A"/>
  <rect x="88" y="38" width="18" height="4" rx="1" fill="#37474F"/>
  <circle cx="93" cy="46" r="4.5" fill="#37474F"/>
  <circle cx="93" cy="46" r="2.5" fill="#546E7A"/>
  <circle cx="102" cy="46" r="4.5" fill="#37474F"/>
  <circle cx="102" cy="46" r="2.5" fill="#546E7A"/>
</svg>`,

  Bourreuse: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="24" width="5" height="3" rx="1" fill="#455A64"/>
  <rect x="115" y="24" width="5" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis -->
  <rect x="6" y="22" width="108" height="7" rx="1" fill="#FFA000"/>
  <!-- Corps machine -->
  <rect x="20" y="8" width="80" height="14" rx="2" fill="#FF8F00"/>
  <!-- Cabine gauche -->
  <rect x="6" y="4" width="18" height="18" rx="2" fill="#E65100"/>
  <rect x="9" y="7" width="12" height="8" rx="1" fill="#B3E5FC"/>
  <!-- Cabine droite -->
  <rect x="96" y="4" width="18" height="18" rx="2" fill="#E65100"/>
  <rect x="99" y="7" width="12" height="8" rx="1" fill="#B3E5FC"/>
  <!-- Equipements toit -->
  <rect x="35" y="4" width="12" height="4" rx="1" fill="#E65100"/>
  <rect x="55" y="4" width="8" height="4" rx="1" fill="#E65100"/>
  <rect x="70" y="4" width="14" height="4" rx="1" fill="#E65100"/>
  <!-- Bras de bourrage descendant -->
  <rect x="52" y="22" width="3" height="14" rx="0.5" fill="#BF360C"/>
  <rect x="58" y="22" width="3" height="14" rx="0.5" fill="#BF360C"/>
  <rect x="64" y="22" width="3" height="14" rx="0.5" fill="#BF360C"/>
  <rect x="49" y="34" width="21" height="3" rx="0.5" fill="#BF360C"/>
  <!-- 6 bogies (machine lourde) -->
  <rect x="8" y="29" width="14" height="4" rx="1" fill="#37474F"/>
  <circle cx="12" cy="37" r="4" fill="#37474F"/>
  <circle cx="12" cy="37" r="2.5" fill="#546E7A"/>
  <circle cx="19" cy="37" r="4" fill="#37474F"/>
  <circle cx="19" cy="37" r="2.5" fill="#546E7A"/>
  <rect x="30" y="29" width="14" height="4" rx="1" fill="#37474F"/>
  <circle cx="34" cy="37" r="4" fill="#37474F"/>
  <circle cx="34" cy="37" r="2.5" fill="#546E7A"/>
  <circle cx="41" cy="37" r="4" fill="#37474F"/>
  <circle cx="41" cy="37" r="2.5" fill="#546E7A"/>
  <rect x="75" y="29" width="14" height="4" rx="1" fill="#37474F"/>
  <circle cx="79" cy="37" r="4" fill="#37474F"/>
  <circle cx="79" cy="37" r="2.5" fill="#546E7A"/>
  <circle cx="86" cy="37" r="4" fill="#37474F"/>
  <circle cx="86" cy="37" r="2.5" fill="#546E7A"/>
  <rect x="96" y="29" width="14" height="4" rx="1" fill="#37474F"/>
  <circle cx="100" cy="37" r="4" fill="#37474F"/>
  <circle cx="100" cy="37" r="2.5" fill="#546E7A"/>
  <circle cx="107" cy="37" r="4" fill="#37474F"/>
  <circle cx="107" cy="37" r="2.5" fill="#546E7A"/>
  <!-- Bogies supplementaires centre -->
  <rect x="48" y="37" width="10" height="3" rx="1" fill="#37474F"/>
  <circle cx="51" cy="43" r="3.5" fill="#37474F"/>
  <circle cx="51" cy="43" r="2" fill="#546E7A"/>
  <circle cx="56" cy="43" r="3.5" fill="#37474F"/>
  <circle cx="56" cy="43" r="2" fill="#546E7A"/>
</svg>`,

  Locotracteur: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="28" width="8" height="3" rx="1" fill="#455A64"/>
  <rect x="112" y="28" width="8" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis -->
  <rect x="15" y="26" width="90" height="8" rx="2" fill="#2E7D32"/>
  <!-- Capot gauche -->
  <rect x="15" y="14" width="30" height="12" rx="2" fill="#388E3C"/>
  <!-- Grilles ventilation capot -->
  <line x1="22" y1="16" x2="22" y2="24" stroke="#2E7D32" stroke-width="1"/>
  <line x1="28" y1="16" x2="28" y2="24" stroke="#2E7D32" stroke-width="1"/>
  <line x1="34" y1="16" x2="34" y2="24" stroke="#2E7D32" stroke-width="1"/>
  <line x1="40" y1="16" x2="40" y2="24" stroke="#2E7D32" stroke-width="1"/>
  <!-- Pot d'echappement -->
  <rect x="28" y="9" width="5" height="5" rx="1" fill="#546E7A"/>
  <!-- Cabine centrale -->
  <rect x="48" y="6" width="40" height="20" rx="2" fill="#2E7D32" stroke="#1B5E20" stroke-width="0.5"/>
  <!-- Grandes fenetres -->
  <rect x="52" y="9" width="14" height="10" rx="1" fill="#B3E5FC"/>
  <rect x="52" y="9" width="14" height="10" rx="1" stroke="#1B5E20" stroke-width="0.5" fill="none"/>
  <rect x="70" y="9" width="14" height="10" rx="1" fill="#B3E5FC"/>
  <rect x="70" y="9" width="14" height="10" rx="1" stroke="#1B5E20" stroke-width="0.5" fill="none"/>
  <!-- Capot droit -->
  <rect x="90" y="18" width="15" height="8" rx="2" fill="#388E3C"/>
  <!-- Grilles ventilation -->
  <line x1="94" y1="20" x2="94" y2="24" stroke="#2E7D32" stroke-width="1"/>
  <line x1="99" y1="20" x2="99" y2="24" stroke="#2E7D32" stroke-width="1"/>
  <!-- 2 grosses roues -->
  <circle cx="35" cy="42" r="7" fill="#37474F"/>
  <circle cx="35" cy="42" r="4.5" fill="#546E7A"/>
  <circle cx="35" cy="42" r="1.5" fill="#37474F"/>
  <circle cx="85" cy="42" r="7" fill="#37474F"/>
  <circle cx="85" cy="42" r="4.5" fill="#546E7A"/>
  <circle cx="85" cy="42" r="1.5" fill="#37474F"/>
  <!-- Ressorts -->
  <rect x="28" y="34" width="14" height="3" rx="1" fill="#455A64"/>
  <rect x="78" y="34" width="14" height="3" rx="1" fill="#455A64"/>
</svg>`,

  Draisine: `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Attelages -->
  <rect x="0" y="30" width="8" height="3" rx="1" fill="#455A64"/>
  <rect x="112" y="30" width="8" height="3" rx="1" fill="#455A64"/>
  <!-- Chassis -->
  <rect x="18" y="28" width="84" height="6" rx="2" fill="#6A1B9A"/>
  <!-- Caisse basse -->
  <rect x="20" y="14" width="80" height="14" rx="2" fill="#7B1FA2"/>
  <!-- Toit -->
  <rect x="22" y="8" width="76" height="6" rx="2" fill="#6A1B9A"/>
  <!-- Grandes fenetres -->
  <rect x="26" y="16" width="16" height="8" rx="1" fill="#B3E5FC"/>
  <rect x="26" y="16" width="16" height="8" rx="1" stroke="#4A148C" stroke-width="0.5" fill="none"/>
  <rect x="46" y="16" width="16" height="8" rx="1" fill="#B3E5FC"/>
  <rect x="46" y="16" width="16" height="8" rx="1" stroke="#4A148C" stroke-width="0.5" fill="none"/>
  <rect x="66" y="16" width="16" height="8" rx="1" fill="#B3E5FC"/>
  <rect x="66" y="16" width="16" height="8" rx="1" stroke="#4A148C" stroke-width="0.5" fill="none"/>
  <rect x="86" y="16" width="12" height="8" rx="1" fill="#B3E5FC"/>
  <rect x="86" y="16" width="12" height="8" rx="1" stroke="#4A148C" stroke-width="0.5" fill="none"/>
  <!-- Gyrophare jaune -->
  <rect x="56" y="4" width="8" height="4" rx="2" fill="#FFC107"/>
  <rect x="58" y="2" width="4" height="2" rx="1" fill="#FFD54F"/>
  <!-- 2 roues -->
  <circle cx="35" cy="40" r="6" fill="#37474F"/>
  <circle cx="35" cy="40" r="3.5" fill="#546E7A"/>
  <circle cx="35" cy="40" r="1.5" fill="#37474F"/>
  <circle cx="85" cy="40" r="6" fill="#37474F"/>
  <circle cx="85" cy="40" r="3.5" fill="#546E7A"/>
  <circle cx="85" cy="40" r="1.5" fill="#37474F"/>
  <!-- Ressorts -->
  <rect x="28" y="34" width="14" height="3" rx="1" fill="#455A64"/>
  <rect x="78" y="34" width="14" height="3" rx="1" fill="#455A64"/>
</svg>`,
}

/**
 * Recherche le SVG correspondant au type/designation du materiel.
 * Cherche d'abord par mots-cles dans la designation, puis par type exact.
 */
export function getSVGMateriel(type: string, designation?: string): string | null {
  const desigLower = (designation || '').toLowerCase()

  // Recherche par mots-cles dans la designation
  if (desigLower.includes('ballast') && desigLower.includes('iere')) {
    return MATERIEL_SVGS['Ballastiere'] || null
  }
  if (desigLower.includes('bourreuse')) {
    return MATERIEL_SVGS['Bourreuse'] || null
  }
  if (desigLower.includes('draisine')) {
    return MATERIEL_SVGS['Draisine'] || null
  }
  if (desigLower.includes('locotracteur')) {
    return MATERIEL_SVGS['Locotracteur'] || null
  }
  if (desigLower.includes('ballast')) {
    return MATERIEL_SVGS['Wagon_ballast'] || null
  }
  if (desigLower.includes('traverse')) {
    return MATERIEL_SVGS['Wagon_traverses'] || null
  }
  if (desigLower.includes('rail')) {
    return MATERIEL_SVGS['Wagon_rails'] || null
  }
  if (desigLower.includes('vide') || desigLower.includes('tombeau')) {
    return MATERIEL_SVGS['Wagon_vide'] || null
  }

  // Recherche par type exact
  if (MATERIEL_SVGS[type]) {
    return MATERIEL_SVGS[type]
  }

  // Recherche par type generique
  const typeLower = type.toLowerCase()
  if (typeLower === 'loco' || typeLower === 'locomotive') {
    return MATERIEL_SVGS['Loco']
  }
  if (typeLower === 'locotracteur') {
    return MATERIEL_SVGS['Locotracteur']
  }
  if (typeLower === 'draisine') {
    return MATERIEL_SVGS['Draisine']
  }
  if (typeLower === 'bourreuse') {
    return MATERIEL_SVGS['Bourreuse']
  }
  if (typeLower === 'wagon' || typeLower === 'wagonlrs') {
    return MATERIEL_SVGS['Wagon_vide']
  }
  if (typeLower === 'ballastiere') {
    return MATERIEL_SVGS['Ballastiere']
  }
  if (typeLower === 'bigrue') {
    // Fallback to Bourreuse (large machine with multiple bogies)
    return MATERIEL_SVGS['Bourreuse']
  }
  if (typeLower === 'bml') {
    // Fallback to Bourreuse (track maintenance machine)
    return MATERIEL_SVGS['Bourreuse']
  }
  if (typeLower === 'regaleuse') {
    // Fallback to Ballastiere (ballast-related machine)
    return MATERIEL_SVGS['Ballastiere']
  }
  if (typeLower === 'stabilisateur') {
    // Fallback to Bourreuse (similar track maintenance machine)
    return MATERIEL_SVGS['Bourreuse']
  }

  return null
}
