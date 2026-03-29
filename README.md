# Conduc Rail

Application de gestion de chantiers ferroviaires.

## Prérequis
- Node.js 20+
- Compte Supabase

## Installation
1. `npm install`
2. Copier `.env.example` → `.env.local` et remplir les variables
3. `npx prisma db push`
4. `npx ts-node prisma/seed.ts`
5. `npm run dev`

## Comptes de test
- admin@conducrail.fr / demo1234
- user@conducrail.fr / demo1234

## Modules
- **Projets** : CRUD projets avec membership
- **Personnel** : Gestion globale du personnel
- **Détail Estimatif** : Lignes DE avec drag & drop et PDF
- **Tableau de Service** : Planification multi-tableaux
- **Rapports Journaliers** : Suivi quotidien avec travaux
- **Situation de Travaux** : Agrégation et avancement
- **Suivi ARF** : Analyse des temps de travail
- **Soudures Aluminothermiques** : Suivi SA avec double en-tête
- **Composition TTx** : Composition des trains de travaux

## Variables d'environnement
- `DATABASE_URL` : URL PostgreSQL Supabase
- `NEXTAUTH_SECRET` : Secret pour NextAuth
- `NEXTAUTH_URL` : URL de l'application (http://localhost:3000)
