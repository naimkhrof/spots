# 0002 — Carte : `mapbox-gl` direct, chargé dans le navigateur seulement

Date : 13 novembre 2026

## Contexte

La page d'accueil doit montrer sur une carte les aires que la liste affiche déjà. Deux contraintes :

- `mapbox-gl` dessine avec WebGL 2 et ne peut pas s'exécuter pendant le rendu serveur de React Router 8.
- La liste est le contenu ; la carte est un complément. La page doit rester complète sans jeton, sans WebGL et sans JavaScript.

Versions vérifiées le 13 novembre 2026 : `mapbox-gl` 3.35.0 (types TypeScript inclus, build ESM `mapbox-gl/esm` recommandé par le guide npm de Mapbox), `react-map-gl` 8.1.3 (point d'entrée `react-map-gl/mapbox`, pour `mapbox-gl` ≥ 3.5).

## Décision

### `mapbox-gl` direct, dans un seul composant

`app/features/spots/components/SpotMap.tsx` est le seul fichier qui connaît Mapbox. Il reçoit `spots`, `selected` et `onSelect` en props ; le reste de l'app ignore quelle librairie dessine la carte.

Ce dont la carte a besoin est impératif par nature : une source GeoJSON regroupée (`cluster: true`), quatre couches, `addInteraction` pour les clics, `getClusterExpansionZoom`, `fitBounds`. Avec `react-map-gl` il faudrait de toute façon descendre à l'instance (`mapRef`) pour les groupes et le cadrage ; le wrapper n'apporterait que la déclaration des couches en JSX, contre une dépendance de plus à tenir alignée sur les versions de `mapbox-gl`.

Le composant sépare trois effets : le cycle de vie de la carte (création, destruction), les données (`setData` + recadrage quand les aires changent), la sélection (`setData` + déplacement). React ne re-rend rien dans la carte ; il lui pousse des données.

### Cohabitation avec le rendu serveur

- Le serveur rend le cadre de la carte (ou le message de repli) et toute la liste.
- `mapbox-gl` et sa feuille de style sont chargés par `import()` dans un `useEffect`. Un effet ne s'exécute jamais côté serveur, donc la librairie n'y est jamais évaluée ; côté client, Vite la sort du bundle de la page (la route pèse environ 11 ko, Mapbox arrive ensuite dans ses propres fichiers).
- Le fichier n'importe de `mapbox-gl` que des types (`import type`), effacés à la compilation.

### Sélection dans l'URL

L'aire sélectionnée est le paramètre `spot` de l'URL, lu une seule fois dans la route et passé en props à la carte et à la liste. Pas d'état partagé, pas de contexte. Dans la liste, chaque aire est un lien : la sélection marche au clavier et sans JavaScript. `shouldRevalidate` évite de rappeler le `loader` quand seule la sélection change.

### Jeton

`VITE_MAPBOX_TOKEN`, lu avec `import.meta.env` (mécanisme de Vite, sur lequel repose React Router 8) et documenté dans `.env.example`. Un jeton public Mapbox est fait pour être envoyé au navigateur ; sa protection est la restriction par URL dans le compte Mapbox, pas le secret. La valeur est figée au build.

### Repli

Jeton absent : connu dès le rendu serveur, la page affiche un message et la liste en une colonne. WebGL indisponible, module non chargé, jeton refusé : même message, après l'échec. La mise en page à deux colonnes dépend de la présence réelle de la carte (`:has([data-map])`), sans état remonté dans la route.

## Options écartées

- **`react-map-gl`** : voir plus haut. Deviendrait intéressant avec beaucoup de marqueurs ou de popups rendus en React.
- **Module `.client.tsx`** (convention React Router) : exclut bien le fichier du bundle serveur, mais ses exports valent `undefined` côté serveur ; il faut quand même un garde au rendu, et la librairie reste dans le bundle de la page. L'`import()` dans l'effet règle les deux points.
- **Marqueurs DOM (`Marker`) par aire** : accessibles au clavier, mais pas de regroupement natif, et 167 liens en double de ceux de la liste. La liste est l'accès clavier.
- **Jeton lu par le `loader`** (`process.env`) : configurable sans rebuild, mais sans intérêt tant qu'il n'y a qu'un environnement.
- **MapLibre** : libre et sans jeton, mais demande de choisir et d'héberger un fond de carte ; hors sujet ici.

## Conséquences

- La carte n'est pas navigable au clavier point par point : c'est la liste qui l'est. Un lien d'évitement saute la carte.
- Sans jeton (CI, clone du dépôt), l'app se construit et fonctionne, sans carte.
- Changer de librairie de carte ne touche qu'un fichier ; `model/map.ts` (GeoJSON, emprise) est du TypeScript pur, testé, et resterait valable.
- Le style Mapbox et le composant ne sont pas couverts par des tests automatiques : seule la logique du modèle l'est.
