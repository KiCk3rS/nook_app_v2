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

- [ ] T18 : hub ville branché
- [ ] Spec F-018 phase 3 / quartiers validée avec produit

## Option d'implémentation (à trancher en kickoff)

| Option | API | Avantage |
|--------|-----|----------|
| A | `GET /cities/:slug/hub` inclut `districts[]` | Un seul appel |
| B | `GET /cities/:citySlug/districts/:districtSlug/hub` | Aligné routes app actuelles |

## Étapes API

- [ ] Modèle `District` (ou entité nested) + seed Marais / Montmartre
- [ ] Endpoint hub quartier avec POI ancres, itinéraires par catégorie (éditorial mock OK)
- [ ] Tests service + e2e

## Étapes App

- [ ] Client + hook `useDistrictHub(citySlug, districtSlug)`
- [ ] `app/city/[slug]/district/[districtSlug]/index.tsx`
- [ ] `app/city/.../district/.../itineraries/[categorySlug].tsx` — listes depuis hub ou mock éditorial
- [ ] `lib/placeNavigation.ts` — `getDistrictByAnchorPoiId` : API ou supprimer si navigation refaite

## Critères d'acceptation

- [ ] Hub quartier Marais / Montmartre navigable en prod avec données API
- [ ] `mockDistricts` conservé offline uniquement
- [ ] `npm test` vert (les deux dépôts)

## Références

- [ecran-A4.5-hub-quartier.md](../ecran-A4.5-hub-quartier.md) (si présent)
- [mock-inventory.md INV-06](./mock-inventory.md)
