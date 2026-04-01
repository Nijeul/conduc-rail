# CLAUDE.md — CONDUC RAIL
# Fichier lu automatiquement par Claude Code à chaque session.
# NE PAS MODIFIER sans mettre à jour tous les agents.

---

## PRÉSENTATION DU PROJET

**Conduc Rail** est une application web de gestion de chantiers ferroviaires.
Utilisateurs : conducteurs de travaux ferroviaires, travail de nuit sur tablette/PC portable.
Équipe : 2 à 5 utilisateurs simultanés, chaque utilisateur voit uniquement ses projets.

---

## STACK TECHNIQUE — OBLIGATOIRE

```
Framework        : Next.js 14+ App Router, TypeScript strict (strict: true)
Styles           : Tailwind CSS + shadcn/ui
Base de données  : PostgreSQL via Prisma ORM → Supabase (cloud)
Auth             : NextAuth.js v5 (credentials email/password)
PDF web          : @react-pdf/renderer
PDF capture      : html2canvas + jsPDF (frise uniquement)
State local      : Zustand
Server state     : TanStack React Query v5
Mutations        : Next.js Server Actions UNIQUEMENT (jamais d'API Routes custom)
Virtualisation   : @tanstack/react-virtual (tables > 100 lignes)
Drag & drop      : @dnd-kit/sortable
```

**Interdits absolus** : next-pwa · WebSocket · Redis · tRPC · API Routes custom · localStorage

---

## CHARTE GRAPHIQUE — VINCI CONSTRUCTION (v1.1 Février 2023)

### Couleurs — importer depuis `src/lib/design-tokens.ts`

```
BLEU VINCI        #004489    → couleur primaire, nav, en-têtes tables, boutons CTA
BLEU FONCÉ        #003370    → hover nav, pieds de tableaux, onglet actif fond
BLEU CLAIR        #0056B3    → états intermédiaires
BLEU TRÈS CLAIR   #E5EFF8    → fonds sélection, onglet actif fond N1
ROUGE VINCI       #E20025    → accent, boutons danger, indicateur onglet actif N2
ROUGE FONCÉ       #B8001E    → hover rouge
ROUGE TRÈS CLAIR  #FDEAED    → fonds alerte, lignes HS
GRIS VINCI        #B5ABA1    → éléments neutres, bordures fortes
GRIS CLAIR        #F0F0F0    → fonds alternés tables, surfaces neutres
GRIS BORDURE      #DCDCDC    → bordures standard
NOIR              #000000    → texte principal
TEXTE SECONDAIRE  #5A5A5A    → texte muted
BLANC             #FFFFFF    → fond carte, texte sur fond coloré
```

### Palette secondaire VINCI (pour modules, frise, badges sémantiques)

```
Vert              #7AA536  fond clair #E8EFDA   → succès, validé, contrat
Vert vif          #A9D461  fond clair #C9E39E   → étude diffusion
Bleu moyen        #307BFF  fond clair #E5F1F9   → groupement, info
Bleu ciel         #80B4FF  fond clair #B2D4FC   → suivi/impact
Jaune doré        #F2AB1B  fond clair #FFF7D1   → avertissement, heures prévues, SOS terrain
Orange brun       #C26A32  fond clair #F9E9D9   → alerte
Rose              #F25799  fond clair #FFE8E8   → VISA étude
Violet            #A152E5  fond clair #FCE8FF   → EBGC
Gris chaud        #B5ABA1  fond clair #F0F0F0   → autre, neutre
```

### Typographie

```
Police principale : Arial, "Helvetica Neue", Helvetica, sans-serif
(Substitution officielle VINCI quand VINCI Sans indisponible — page 17 de la charte)
Taille body       : 14px
Taille tables     : 12-13px
```

### Règles design inviolables

```
1. JAMAIS de couleur hors palette VINCI ci-dessus
2. JAMAIS d'ancien bleu indigo #1A237E
3. JAMAIS d'ambre #F9A825 (remplacé par jaune VINCI #F2AB1B)
4. Toujours importer depuis src/lib/design-tokens.ts
5. Tables : en-tête fond #004489 texte blanc gras
6. Tables : lignes alternées blanc / #F0F0F0
7. Tables : ligne sélectionnée fond #E5EFF8 texte #003370
8. Bouton primaire : fond #004489 texte blanc
9. Bouton danger/supprimer : fond #E20025 texte blanc
10. Bouton secondaire : fond blanc bordure #004489 texte #004489
11. Bouton toolbar : fond #F0F0F0 bordure #DCDCDC texte #000000
12. Focus inputs : bordure #004489
13. Sidebar : fond #004489, indicateur actif = trait gauche rouge #E20025
14. Onglet N1 actif : fond #E5EFF8 bordure basse #004489 2px
15. Sous-menu N2 actif : bordure basse rouge #E20025 2px
16. PDF en-tête : bande #004489 texte blanc, pied #003370
```

---

## ARCHITECTURE DES FICHIERS

```
conduc-rail/
├── CLAUDE.md                         ← CE FICHIER
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── seed-materiel.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   └── (app)/
│   │       ├── layout.tsx            ← shell auth + sidebar
│   │       ├── projets/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       ├── layout.tsx    ← nav 3 onglets + topbar
│   │       │       ├── infos/page.tsx
│   │       │       ├── detail-estimatif/page.tsx
│   │       │       ├── tableau-service/page.tsx
│   │       │       ├── suivi/
│   │       │       │   ├── rapports/page.tsx
│   │       │       │   ├── situation/page.tsx
│   │       │       │   ├── arf/page.tsx
│   │       │       │   ├── journal/page.tsx
│   │       │       │   └── sa/page.tsx
│   │       │       ├── composition/page.tsx
│   │       │       └── courriers/
│   │       │           ├── page.tsx
│   │       │           └── [courrierId]/page.tsx
│   │       ├── personnel/page.tsx
│   │       ├── materiel/
│   │       │   └── composition/page.tsx
│   │       └── profil/page.tsx
│   ├── components/
│   │   ├── ui/                       ← shadcn/ui UNIQUEMENT (via CLI)
│   │   ├── layout/                   ← Sidebar, Topbar, ProjetNav, Shell
│   │   └── modules/                  ← composants par module (sous-dossiers)
│   ├── lib/
│   │   ├── prisma.ts                 ← singleton Prisma
│   │   ├── auth.ts                   ← config NextAuth v5
│   │   ├── design-tokens.ts          ← CHARTE VINCI — source de vérité
│   │   ├── materiel-svgs.ts          ← SVG des engins TTx
│   │   ├── materiel-types.ts         ← types et couleurs matériel
│   │   ├── courriers-templates.ts    ← templates de courriers
│   │   ├── utils.ts                  ← fonctions utilitaires FR
│   │   └── pdf/                      ← générateurs PDF par module
│   ├── hooks/                        ← custom React Query hooks
│   ├── stores/                       ← Zustand stores
│   ├── actions/                      ← Server Actions (1 fichier par module)
│   └── types/                        ← types TypeScript partagés
```

---

## NAVIGATION DU PROJET (3 onglets)

```
GESTION CONTRACTUELLE    → Infos · Courriers · Journal
GESTION FINANCIÈRE       → Détail Estimatif · Situation · Suivi ARF
GESTION DE CHANTIER      → Tableau de Service · Rapports · Composition TTx · SA
```

Sidebar principale : Projets · Personnel · Matériel · [Nom utilisateur → /profil]

---

## PATTERNS OBLIGATOIRES

### Server Action (copier pour chaque nouvelle action)

```typescript
'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function monAction(projetId: string, data: unknown) {
  // 1. Auth
  const session = await auth()
  if (!session?.user?.id) throw new Error('Non authentifié')
  // 2. Membership (pour toute action liée à un projet)
  const member = await prisma.projetMember.findUnique({
    where: { userId_projetId: { userId: session.user.id, projetId } }
  })
  if (!member) throw new Error('Accès refusé')
  // 3. Validation Zod
  const schema = z.object({ /* champs */ })
  const parsed = schema.parse(data)
  // 4. Mutation Prisma
  const result = await prisma.MODEL.create({ data: { projetId, ...parsed } })
  // 5. Revalidation
  revalidatePath(`/projets/${projetId}/MODULE`)
  return { success: true, data: result }
}
```

### Auto-save debounced (tables éditables)

```typescript
const saveRef = useRef<NodeJS.Timeout>()
const scheduleSave = useCallback((data: unknown) => {
  clearTimeout(saveRef.current)
  saveRef.current = setTimeout(() => saveAction(data), 500)
}, [])
```

### Export PDF anti-double-téléchargement

```typescript
// Toujours utiliser ce hook — jamais appeler exportPDF() directement
import { useExportPDF } from '@/hooks/useExportPDF'
const { exportAvecGuard, isExporting } = useExportPDF()
// Usage : exportAvecGuard(() => genererPDF(data))
```

### Formatage français (toujours utiliser lib/utils.ts)

```typescript
formatNombreFR(1234.5)        // → "1 234,50"
formatMontant(1234.5)         // → "1 234,50 €"
parseHeure("630")             // → "06:30"
calcDureeMinutes("22:00", "06:00", true)  // poste nuit → 480 min
formatDuree(480)              // → "8h"
formatDateFR(new Date())      // → "01/04/2026"
```

---

## FONCTIONS UTILITAIRES OBLIGATOIRES (`src/lib/utils.ts`)

```typescript
export function formatNombreFR(n: number, decimales = 2): string
export function formatMontant(n: number): string
export function parseHeure(input: string): string | null
export function calcDureeMinutes(debut: string, fin: string, posteNuit: boolean): number
export function formatDuree(minutes: number): string
export function formatDateFR(date: Date): string
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null
```

---

## RÈGLES SPÉCIFIQUES PAR MODULE

### Toutes les tables

- Virtualisation obligatoire si peut dépasser 100 lignes : `@tanstack/react-virtual`
- Modules concernés : SA (soudures), rapports, matériel TTx

### Détail Estimatif

- Auto-save 500ms sur chaque cellule
- Ctrl+S force la sauvegarde immédiate
- Le Dialog d'export PDF NE DOIT PAS être imbriqué dans le Sheet
  (bug boutons non cliquables) → placer le Dialog au même niveau que le Sheet

### Tableau de Service

- Les types de lignes ont des couleurs fixes (voir TYPES_LIGNES dans le code)
- Ces couleurs métier sont une exception à la règle VINCI — elles restent
- Les contrôles (boutons, toolbar, dialog) suivent la charte VINCI

### ARF — Calcul heures de nuit

```typescript
// Toute heure < "12:00" sur un poste de nuit = lendemain matin → +24h
// Exemple : début 22:00, fin 06:00 → durée = 8h (pas -16h)
if (posteNuit && heureFinMinutes < 12 * 60) heureFinMinutes += 24 * 60
```

### Composition TTx

- Sélection du matériel via `MaterielTTx` (BDD), jamais en saisie libre
- SVG des engins : `src/lib/materiel-svgs.ts`
- Badge ×N affiché quand nombre > 1 (un seul bloc dans le visuel)
- PDF : utiliser les composants de `src/lib/pdf/materiel-svg-pdf.tsx`

### Frise chronologique

- Rendu : HTML/CSS avec positions absolues calculées en JS
- Anti-chevauchement : algorithme dans `FriseChronologique.tsx`
- Export : `html2canvas` + `jsPDF` (pas @react-pdf/renderer)
- Couleurs catégories : palette secondaire VINCI (voir design-tokens.ts)

### PDF — règles communes

Tous les PDFs doivent avoir :
```
En-tête : bande #004489 · logo utilisateur à gauche · "CONDUC RAIL" + projet à droite
En-tête tableau : fond #004489 texte blanc gras
Lignes alternées : blanc / #F0F0F0
Pied de tableau : fond #003370 texte blanc
Pied de page : ligne fine #DCDCDC · "Page X / Y" · texte #B5ABA1
Police PDF : Helvetica (intégrée dans @react-pdf/renderer)
Formatage : fonctions françaises de lib/utils.ts
```

---

## SCHÉMA PRISMA — MODÈLES EXISTANTS

```
User · Projet · ProjetMember · Personnel
TableauService · LigneDE · RapportJournalier
SoudureAluminothermique · CompositionTTx
MaterielTTx · LigneFicheEcart
EvenementChantier · FichierEvenement · CourrierChantier
```

Champs ajoutés à `User` : `logoSociete · nomSociete · adresseSociete · telSociete · faxSociete · certifications`
Champs ajoutés à `Projet` : `moaNom · moaPrenom · moaAdresse · numeroAffaire · numeroCommande · numeroOTP · adresseChantier · dateDebut · dateFin`

---

## COMPTES DE TEST (seed)

```
admin@conducrail.fr / demo1234  → owner du projet "Chantier LGV Sud"
user@conducrail.fr  / demo1234  → member du projet "Chantier LGV Sud"
```

---

## CE QU'IL NE FAUT JAMAIS FAIRE

```
✗ Créer des API Routes (/api/...) — utiliser les Server Actions
✗ Utiliser localStorage ou sessionStorage
✗ Hardcoder des couleurs hors palette VINCI
✗ Imbriquer un Dialog dans un Sheet (bug overlay z-index)
✗ Appeler exportPDF() sans le hook useExportPDF (double téléchargement)
✗ Utiliser toLocaleString() directement — utiliser formatNombreFR()
✗ Modifier les fichiers dans src/components/ui/ — shadcn/ui via CLI uniquement
✗ Supprimer ou modifier les engins système (estSysteme: true) dans MaterielTTx
✗ Utiliser fetch() côté client pour les mutations — Server Actions uniquement
✗ Oublier revalidatePath() après une mutation Prisma
✗ Oublier la vérification ProjetMember dans les Server Actions de projet
```
