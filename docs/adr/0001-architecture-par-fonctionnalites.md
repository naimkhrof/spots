# 0001 — Architecture par fonctionnalités, frontières vérifiées par le lint

Date : 13 novembre 2026

## Contexte

L'app doit rester lisible quand elle grandira (carte, séances, planification) et servir de support pour expliquer des choix d'architecture.

## Décision

- Le code est rangé par fonctionnalité : `app/features/<nom>/{model,api,components}`. Les routes (`app/routes`) assemblent les fonctionnalités.
- Les dépendances vont dans un seul sens : `shared` → `features` → `routes`.
- `model` est du TypeScript pur : pas de React, pas d'accès aux données. C'est là que vivent les règles métier et leurs tests.
- Ces règles sont vérifiées par ESLint (`no-restricted-imports` dans `eslint.config.js`), pas par convention.
- La source de données est convertie une seule fois, dans `api/*.server.ts`, avec un schéma Zod.

## Options écartées

- **Rangement par type** (`components/`, `hooks/`) : simple, mais une fonctionnalité se retrouve éparpillée dès quelques écrans.
- **Feature-Sliced Design complet** : sept couches et leur vocabulaire sont disproportionnés pour une app de cette taille. L'idée utile, le sens unique des dépendances, est gardée.
- **Plugin d'architecture dédié** (`eslint-plugin-boundaries`) : plus expressif, mais une dépendance de plus alors que la règle native suffit pour trois frontières.

## Conséquences

- Un import interdit casse la CI.
- Le dossier `shared` n'existe pas encore : il sera créé quand deux fonctionnalités partageront réellement du code.
- « Équipement inconnu » est un état du modèle (`null`), distinct de « aucun équipement » : 126 des 167 aires genevoises d'OpenStreetMap n'ont pas d'équipement renseigné.
