# T16 — App : villes API — recherche & discovery

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T15 |
| **Bloque** | T18 |
| **Priorité** | P1 — [INV-04](../mock-inventory.md) |
| **Priorité écran** | P1 — A2.1, A4.1 |
| **Statut** | ✅ **terminé** (2026-09-01) — réalignement doc ; code livré depuis 2026-08 |

## Objectif

Remplacer `mockCities` + `searchDiscovery.ts` (slugs hardcodés) par `GET /cities` en production pour la recherche et les carrousels villes.

## Prérequis

- [x] T15 : `GET /cities` opérationnel
- [x] T03 / T05 terminées (recherche, discovery)

## Étapes

### Client API

- [x] `lib/api/cities.ts` : `fetchCities(query)`, helpers `fetchPromotedCities`, `fetchPopularCities`, `searchCities`
- [x] Types `CitySummary` dans `types/api.ts`
- [x] Mapper `citySummaryToCityView` / `mockCityToCityView` (`lib/mappers/cities.ts`)

### Intégration écrans

- [x] `lib/searchPlaces.ts` — `searchCities` API si configurée
- [x] `components/search/SearchDiscoveryView.tsx` — `useCityCarousels` au mount
- [x] `components/discovery/DiscoveryFeedView.tsx` — liens ville via `useCityCarousels`
- [x] Conserver `mockCities` si `!isApiConfigured()` ou erreur réseau (fallback documenté)

### Config

- [x] `constants/searchDiscovery.ts` — slugs conservés pour fallback offline uniquement

## Fichiers concernés

- `lib/api/cities.ts`, `lib/mappers/cities.ts`
- `hooks/useCityCarousels.ts`
- `lib/searchPlaces.ts`
- `components/search/SearchDiscoveryView.tsx`
- `components/discovery/DiscoveryFeedView.tsx`

## Critères d'acceptation

- [x] Recherche : villes depuis API + POI depuis API (hybride complet)
- [x] Villes promues/populaires dynamiques (plus de slugs hardcodés en prod)
- [x] Tap ville → navigation `/city/:slug` (hub API depuis T18)
- [x] Point de contrôle audit #1 validé en local (2026-09-01) : `GET /cities?promoted=true` → Paris
- [x] `npm test` vert (`cities.test.ts`, `searchPlaces.test.ts`)

## Tests unitaires

- [x] `lib/api/__tests__/cities.test.ts`
- [x] `lib/mappers/__tests__/cities.test.ts`
- [x] `lib/__tests__/searchPlaces.test.ts` : villes API mockées

## Références

- [T15-api-cities-f018-phase1.md](./T15-api-cities-f018-phase1.md)
