# Spots

Trouver une aire de callisthénie à Genève selon l'équipement disponible. Projet personnel, commencé en novembre 2026.

## État

- Liste des 167 aires de fitness du canton de Genève, filtrées par équipement. Le filtre vit dans l'URL : il se partage et fonctionne sans JavaScript.
- Détection de chevauchement de créneaux, écrite et testée, pas encore affichée.
- À venir : carte, séance composée selon l'équipement du spot, planification.

## Pile

React Router 8 (mode framework, rendu serveur), React 19, TypeScript strict, Tailwind 4, Zod, Vitest, ESLint.

## Architecture

```
app/
  routes/                 assemble les fonctionnalités, lit l'URL
  features/
    spots/
      model/              règles métier pures et leurs tests
      api/                accès aux données, validation à la frontière
      components/         interface
    sessions/
      model/              créneaux et conflits
```

Les dépendances vont dans un seul sens, `features` → `routes`, et le modèle n'importe ni React ni les données. ESLint le vérifie. Les décisions sont dans `docs/adr`.

## Commandes

```bash
pnpm install
pnpm dev
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm import:osm   # rafraîchit les données depuis OpenStreetMap
```

## Données

Aires de fitness © les contributeurs d'OpenStreetMap, licence ODbL, relevées via Overpass. Le fichier `app/features/spots/api/spots.geneve.json` garde la valeur brute du tag `fitness_station` ; l'app l'interprète dans `model/equipment.ts`.
