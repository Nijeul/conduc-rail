# CLAUDE.md — [NOM DU PROJET]
# Fichier lu automatiquement par Claude Code à chaque session.
# Modèle issu de Conduc Rail : même stack, même charte VINCI, même mise en forme.
# → Remplacer tous les [CROCHETS] avant le premier lancement.

---

## PRÉSENTATION DU PROJET

**[Nom du projet]** est une application web de [objet de l'application].
Utilisateurs : [profil des utilisateurs, contexte d'usage — ex. tablette/PC portable].
Équipe : [N] utilisateurs simultanés, chaque utilisateur voit uniquement ses [entités principales].

---

## STACK TECHNIQUE — OBLIGATOIRE

```
Framework        : Next.js 14+ App Router, TypeScript strict (strict: true)
Styles           : Tailwind CSS + shadcn/ui
Icônes           : lucide-react
Base de données  : PostgreSQL via Prisma ORM → Supabase (cloud)
Auth             : NextAuth.js v5 (credentials email/password)
PDF web          : @react-pdf/renderer
State local      : Zustand
Server state     : TanStack React Query v5
Mutations        : Next.js Server Actions UNIQUEMENT (jamais d'API Routes custom)
Validation       : Zod
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
ROUGE TRÈS CLAIR  #FDEAED    → fonds alerte, lignes en erreur
GRIS VINCI        #B5ABA1    → éléments neutres, bordures fortes
GRIS CLAIR        #F0F0F0    → fonds alternés tables, surfaces neutres
GRIS BORDURE      #DCDCDC    → bordures standard
NOIR              #000000    → texte principal
TEXTE SECONDAIRE  #5A5A5A    → texte muted
BLANC             #FFFFFF    → fond carte, texte sur fond coloré
```

### Palette secondaire VINCI (modules, graphiques, badges sémantiques)

```
Vert              #7AA536  fond clair #E8EFDA   → succès, validé
Vert vif          #A9D461  fond clair #C9E39E
Bleu moyen        #307BFF  fond clair #E5F1F9   → info
Bleu ciel         #80B4FF  fond clair #B2D4FC
Jaune doré        #F2AB1B  fond clair #FFF7D1   → avertissement
Orange brun       #C26A32  fond clair #F9E9D9   → alerte
Rose              #F25799  fond clair #FFE8E8
Violet            #A152E5  fond clair #FCE8FF
Gris chaud        #B5ABA1  fond clair #F0F0F0   → autre, neutre
```

### Typographie

```
Police principale : VINCI Sans (fichiers .woff2 dans public/fonts/, déclarés en @font-face dans globals.css)
Fallback          : Arial, Helvetica, sans-serif
Condensed         : VINCI Sans Condensed (tableaux denses)
Serif             : VINCI Serif (usage éditorial uniquement)
Taille body       : 14px
Taille tables     : 12-13px
```

→ Copier le dossier `public/fonts/` et les blocs `@font-face` de `src/app/globals.css` depuis Conduc Rail.

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

### Fichier `src/lib/design-tokens.ts` (à créer tel quel)

```typescript
export const VINCI = {
  bleu: '#004489', bleuDark: '#003370', bleuLight: '#0056B3', bleuXLight: '#E5EFF8',
  rouge: '#E20025', rougeDark: '#B8001E', rougeXLight: '#FDEAED',
  gris: '#B5ABA1', grisLight: '#F0F0F0', noir: '#000000', blanc: '#FFFFFF',
  fontFamily: '"VINCI Sans", Arial, Helvetica, sans-serif',
  fontFamilyCondensed: '"VINCI Sans Condensed", "Arial Narrow", Arial, sans-serif',
  fontFamilySerif: '"VINCI Serif", Georgia, serif',
  tableHeaderBg: '#004489', tableHeaderText: '#FFFFFF', tableRowAlt: '#F0F0F0',
  tableSelected: '#E5EFF8', tableBorder: '#DCDCDC',
  navBg: '#004489', navHover: '#003370', navActiveIndicator: '#E20025',
  navText: '#FFFFFF', navTextMuted: 'rgba(255,255,255,0.70)',
} as const

export const VINCI_PDF = {
  headerBg: '#004489', headerText: '#FFFFFF', rowAlt: '#F0F0F0',
  footerBg: '#003370', footerText: '#FFFFFF', border: '#DCDCDC',
  textMain: '#000000', textMuted: '#B5ABA1',
} as const
```

### Extension Tailwind (`tailwind.config.ts`)

```typescript
theme: {
  extend: {
    colors: {
      primary: { DEFAULT: '#004489', light: '#0056B3' },
      accent:  { DEFAULT: '#E20025' },
      danger:  { DEFAULT: '#E20025' },
      border:  '#DCDCDC',
      vinci: {
        bleu: '#004489', 'bleu-dark': '#003370', 'bleu-light': '#0056B3', 'bleu-xlight': '#E5EFF8',
        rouge: '#E20025', 'rouge-dark': '#B8001E', 'rouge-xlight': '#FDEAED',
        gris: '#B5ABA1', 'gris-light': '#F0F0F0', noir: '#000000',
      },
    },
    fontFamily: {
      sans:      ['VINCI Sans', 'Arial', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
      condensed: ['VINCI Sans Condensed', 'Arial Narrow', 'Arial', 'sans-serif'],
      serif:     ['VINCI Serif', 'Georgia', 'serif'],
    },
    fontSize: { table: ['13px', { lineHeight: '1.4' }] },
  },
},
plugins: [require('tailwindcss-animate')],
```

---

## MISE EN PAGE (SHELL)

### Sidebar (`src/components/layout/Sidebar.tsx`)

```
Largeur          : w-60, fixe à gauche, h-screen, z-40
Fond             : #004489
En-tête          : nom de l'app en MAJUSCULES, gras, blanc (text-lg)
                   + sous-titre text-xs rgba(255,255,255,0.50)
                   séparateur bas 1px rgba(255,255,255,0.15)
Liens            : icône lucide h-4 w-4 + libellé text-sm font-medium, px-3 py-2 rounded-md
  inactif        : texte rgba(255,255,255,0.70), bordure gauche 4px transparente
  hover          : fond #003370, texte blanc
  actif          : texte blanc, fond rgba(255,255,255,0.08), bordure gauche 4px #E20025
Pied             : nom + email utilisateur (lien /profil) · bouton Déconnexion
                   · lien Politique de confidentialité (text-xs, rgba(255,255,255,0.40))
```

Sidebar principale : [Entrée 1] · [Entrée 2] · [Entrée 3] · [Nom utilisateur → /profil]

### Contenu principal

```
Décalage         : ml-60 (largeur sidebar)
Fond page        : #FFFFFF (surfaces neutres #F0F0F0)
Topbar           : titre de l'entité courante + actions à droite (boutons selon règles 8-11)
Navigation N1    : onglets — actif fond #E5EFF8, bordure basse #004489 2px
Navigation N2    : sous-menus — actif bordure basse #E20025 2px
```

---

## ARCHITECTURE DES FICHIERS

```
[nom-projet]/
├── CLAUDE.md                         ← CE FICHIER
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/fonts/                     ← polices VINCI (.woff2)
├── src/
│   ├── app/
│   │   ├── globals.css               ← @font-face VINCI + variables shadcn
│   │   ├── (auth)/login/page.tsx
│   │   └── (app)/
│   │       ├── layout.tsx            ← shell auth + sidebar
│   │       ├── [entite]/
│   │       │   ├── page.tsx          ← liste
│   │       │   └── [id]/
│   │       │       ├── layout.tsx    ← nav onglets + topbar
│   │       │       └── [module]/page.tsx
│   │       └── profil/page.tsx
│   ├── components/
│   │   ├── ui/                       ← shadcn/ui UNIQUEMENT (via CLI)
│   │   ├── layout/                   ← Sidebar, Topbar, Nav, Shell
│   │   └── modules/                  ← composants par module (sous-dossiers)
│   ├── lib/
│   │   ├── prisma.ts                 ← singleton Prisma
│   │   ├── auth.ts                   ← config NextAuth v5
│   │   ├── design-tokens.ts          ← CHARTE VINCI — source de vérité
│   │   ├── utils.ts                  ← fonctions utilitaires FR
│   │   └── pdf/                      ← générateurs PDF par module
│   ├── hooks/                        ← custom React Query hooks
│   ├── stores/                       ← Zustand stores
│   ├── actions/                      ← Server Actions (1 fichier par module)
│   └── types/                        ← types TypeScript partagés
```

---

## NAVIGATION DE [L'ENTITÉ PRINCIPALE]

```
[ONGLET 1]    → [Module A] · [Module B] · [Module C]
[ONGLET 2]    → [Module D] · [Module E]
[ONGLET 3]    → [Module F] · [Module G]
```

---

## PATTERNS OBLIGATOIRES

### Server Action (copier pour chaque nouvelle action)

```typescript
'use server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function monAction(entiteId: string, data: unknown) {
  // 1. Auth
  const session = await auth()
  if (!session?.user?.id) throw new Error('Non authentifié')
  // 2. Membership (pour toute action liée à une entité partagée)
  const member = await prisma.[entite]Member.findUnique({
    where: { userId_[entite]Id: { userId: session.user.id, [entite]Id: entiteId } }
  })
  if (!member) throw new Error('Accès refusé')
  // 3. Validation Zod
  const schema = z.object({ /* champs */ })
  const parsed = schema.parse(data)
  // 4. Mutation Prisma
  const result = await prisma.MODEL.create({ data: { [entite]Id: entiteId, ...parsed } })
  // 5. Revalidation
  revalidatePath(`/[entite]/${entiteId}/MODULE`)
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

---

## FONCTIONS UTILITAIRES OBLIGATOIRES (`src/lib/utils.ts`)

```typescript
export function cn(...inputs: ClassValue[]): string          // clsx + tailwind-merge
export function formatNombreFR(n: number, decimales = 2): string   // 1234.5 → "1 234,50"
export function formatMontant(n: number): string                   // → "1 234,50 €"
export function formatDateFR(date: Date): string                   // → "01/04/2026"
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null
```

---

## PDF — RÈGLES COMMUNES

Tous les PDFs doivent avoir :
```
En-tête : bande #004489 · logo utilisateur à gauche · "[NOM APP]" + nom entité à droite
En-tête tableau : fond #004489 texte blanc gras
Lignes alternées : blanc / #F0F0F0
Pied de tableau : fond #003370 texte blanc
Pied de page : ligne fine #DCDCDC · "Page X / Y" · texte #B5ABA1
Police PDF : Helvetica (intégrée dans @react-pdf/renderer)
Formatage : fonctions françaises de lib/utils.ts
Couleurs : importer VINCI_PDF depuis design-tokens.ts
```

---

## RÈGLES SPÉCIFIQUES PAR MODULE

### [Module A]
- [règle métier]

### [Module B]
- [règle métier]

---

## SCHÉMA PRISMA — MODÈLES EXISTANTS

```
User · [Entite] · [Entite]Member · [Modèles métier...]
```

---

## COMPTES DE TEST (seed)

```
admin@[domaine].fr / demo1234  → owner de "[Entité de démo]"
user@[domaine].fr  / demo1234  → member de "[Entité de démo]"
```

---

## CE QU'IL NE FAUT JAMAIS FAIRE

```
✗ Créer des API Routes (/api/...) — utiliser les Server Actions
✗ Utiliser localStorage ou sessionStorage
✗ Hardcoder des couleurs hors palette VINCI
✗ Imbriquer un Dialog dans un Sheet (bug overlay z-index) — les placer au même niveau
✗ Appeler exportPDF() sans le hook useExportPDF (double téléchargement)
✗ Utiliser toLocaleString() directement — utiliser formatNombreFR()
✗ Modifier les fichiers dans src/components/ui/ — shadcn/ui via CLI uniquement
✗ Utiliser fetch() côté client pour les mutations — Server Actions uniquement
✗ Oublier revalidatePath() après une mutation Prisma
✗ Oublier la vérification de membership dans les Server Actions
```
