# Spots

Trouver une aire de callisthénie à Genève selon l'équipement disponible. Projet personnel, commencé en novembre 2026.

## État

- Liste des 167 aires de fitness du canton de Genève, filtrées par équipement. Le filtre vit dans l'URL : il se partage et fonctionne sans JavaScript.
- Carte Mapbox des mêmes aires, regroupées à faible zoom ; disque plein pour un équipement renseigné, anneau creux sinon. L'aire sélectionnée vit dans l'URL (`?spot=…`) : cliquer un point la met en avant dans la liste, et inversement.
- La carte est un complément : sans jeton, sans WebGL ou sans JavaScript, la page affiche la liste seule.
- Détection de chevauchement de créneaux, écrite et testée, pas encore affichée.
- À venir : séance composée selon l'équipement du spot, planification.

## Pile

React Router 8 (mode framework, rendu serveur), React 19, TypeScript strict, Tailwind 4, Zod, Vitest, ESLint, Mapbox GL JS 3 (sans wrapper React, voir `docs/adr/0002-carte-mapbox-sans-wrapper.md`).

## Architecture

```
app/
  routes/                 assemble les fonctionnalités, lit l'URL
  features/
    spots/
      model/              règles métier pures et leurs tests (filtre, URL, GeoJSON, emprise)
      api/                accès aux données, validation à la frontière
      components/         interface
    sessions/
      model/              créneaux et conflits
```

Les dépendances vont dans un seul sens, `features` → `routes`, et le modèle n'importe ni React ni les données. ESLint le vérifie. Les décisions sont dans `docs/adr`.

## Commandes

```bash
pnpm install
cp .env.example .env   # puis y placer un jeton public Mapbox (facultatif)
pnpm dev
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm import:osm   # rafraîchit les données depuis OpenStreetMap
```

## Carte

La carte demande un jeton public Mapbox dans `VITE_MAPBOX_TOKEN` (fichier `.env`, ignoré par git). Sans jeton, l'app fonctionne et affiche la liste seule. `mapbox-gl` n'est chargé que dans le navigateur, après le rendu serveur.

## Données

Aires de fitness © les contributeurs d'OpenStreetMap, licence ODbL, relevées via Overpass. Le fichier `app/features/spots/api/spots.geneve.json` garde la valeur brute du tag `fitness_station` ; l'app l'interprète dans `model/equipment.ts`. Fond de carte © Mapbox © OpenStreetMap, attribution affichée sur la carte.
