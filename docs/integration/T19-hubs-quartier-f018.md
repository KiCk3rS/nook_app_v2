# T19 — Hubs quartier A4.5 (API + App)

| | |
|---|---|
| **Dépôt** | `nook_api_v2` + `nook_app_v2` |
| **Durée** | 3–5 j |
| **Dépend de** | T18 |
| **Bloque** | — |
| **Priorité** | P2 — [INV-06](../mock-inventory.md) |
| **Priorité écran** | P2 — A4.5 |

## Objectif

Remplacer `constants/mockDistricts.ts` et les écrans `app/city/[slug]/district/**` par des données API (extension F-018 ou ressource `districts`).

## Prérequis

- [x] T18 : hub ville branché
- [x] Spec F-018 phase 3 / quartiers validée avec produit (option B kickoff)

## Option d'implémentation (à trancher en kickoff)

| Option | API | Avantage |
|--------|-----|----------|
| A | `GET /cities/:slug/hub` inclut `districts[]` | Un seul appel |
| B | `GET /cities/:citySlug/districts/:districtSlug/hub` | Aligné routes app actuelles |

**Choix :** **B** (2026-08-09).

## Étapes API

- [x] Modèle `District` (ou entité nested) + seed Marais / Montmartre
- [x] Endpoint hub quartier avec POI ancres, itinéraires par catégorie (éditorial mock OK)
- [x] Tests service + e2e

## Étapes App

- [x] Client + hook `useDistrictHub(citySlug, districtSlug)`
- [x] `app/city/[slug]/district/[districtSlug]/index.tsx`
- [x] `app/city/.../district/.../itineraries/[categorySlug].tsx` — listes depuis hub ou mock éditorial
- [x] `lib/placeNavigation.ts` — ancre via `districtHub` sur le POI (contrat API) ; mock offline uniquement
- [x] Refactor qualité : cache global supprimé ; hook hub unifié ; snippets hub factorisés

## Critères d'acceptation

- [x] Hub quartier Marais / Montmartre navigable en prod avec données API
- [x] `mockDistricts` conservé offline uniquement
- [x] `npm test` vert (les deux dépôts)

## Références

- [ecran-A4.5-hub-quartier.md](../ecran-A4.5-hub-quartier.md) (si présent)
- [mock-inventory.md INV-06](./mock-inventory.md)

## Livré

### API (`nook_api_v2`)

- Tables `districts`, `district_images`, `district_hub_pois`
- `GET /api/v1/cities/:citySlug/districts/:districtSlug/hub` → `DistrictHubResponseDto`
- Seed Paris : `le-marais`, `montmartre`
- `stats.districtHubCount` réel sur `GET /cities`

### App (`nook_app_v2`)

- `fetchDistrictHub` / `useDistrictHub` / `districtHubToHubData`
- Navigation ancre via `districtHub` sur snippets / carte / détail POI (plus de cache process)
- CTA carte : région en query params (`focusLat` / …)
- Écran A4.5 branché API ; fallback `mockDistricts` si `!isApiConfigured()`
- `useTerritorialHubResource` partagé ville / quartier
