# T18 — App : hub ville A4.3

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 3–4 j |
| **Dépend de** | T16, T17 |
| **Bloque** | T19 |
| **Priorité** | P2 — [INV-05](../mock-inventory.md) |
| **Priorité écran** | P1 — A4.3 |

## Objectif

Brancher `app/city/[slug]/index.tsx` et `TerritorialHubView` sur `GET /cities/:slug/hub` ; supprimer `getCityBySlug` en production.

## Prérequis

- [x] T17 : endpoint hub ville
- [x] T16 : navigation recherche → `/city/:slug` avec slugs API
- [ ] T12 recommandé (images POI must-see)

## Étapes

- [x] `lib/api/cities.ts` → `fetchCityHub(slugOrId)`
- [x] Hook `useCityHub(slug)` — loading / error / 404
- [x] Mapper hub DTO → props `TerritorialHubView`
- [x] `app/city/[slug]/index.tsx` — fetch API ; fallback `mockCities` si `!isApiConfigured()`
- [x] Must-see / recommended : snippets API (plus `getPlaceById` pour coords)
- [x] Itinéraires éditoriaux section : **rester mock** jusqu'à T21 (documenter)
- [x] Tourist pass / affiliation : afficher si API renvoie données ; sinon masquer section

## Fichiers concernés

- `app/city/[slug]/index.tsx`
- `components/city/TerritorialHubView.tsx`
- `lib/api/cities.ts`, `lib/mappers/cityHub.ts`
- `hooks/useCityHub.ts`

## Critères d'acceptation

- [x] `/city/paris` affiche données API (validé en local 2026-09-01 : must-see, catégories, premium)
- [x] Point de contrôle audit #2 validé en local
- [x] 404 ville inconnue gérée
- [x] Mode démo inchangé
- [x] `npm test` vert

## Tests unitaires

- [x] `lib/mappers/__tests__/cityHub.test.ts`
- [x] `hooks/useCityHub` via helper pur si extrait

## Références

- [T17-api-hub-ville-f018.md](./T17-api-hub-ville-f018.md)
