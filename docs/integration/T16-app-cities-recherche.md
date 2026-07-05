# T16 — App : villes API — recherche & discovery

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T15 |
| **Bloque** | T18 |
| **Priorité** | P1 — [INV-04](../mock-inventory.md) |
| **Priorité écran** | P1 — A2.1, A4.1 |

## Objectif

Remplacer `mockCities` + `searchDiscovery.ts` (slugs hardcodés) par `GET /cities` en production pour la recherche et les carrousels villes.

## Prérequis

- [ ] T15 : `GET /cities` opérationnel
- [ ] T03 / T05 terminées (recherche, discovery)

## Étapes

### Client API

- [ ] `lib/api/cities.ts` : `fetchCities(query)`, helpers `fetchPromotedCities`, `fetchPopularCities`, `searchCities`
- [ ] Types `CitySummary` dans `types/api.ts`
- [ ] Mapper `cityDtoToMockCity` ou migration types UI (`MockCity` → `CityView`)

### Intégration écrans

- [ ] `lib/searchPlaces.ts` — `searchCitiesLocal` → API si configurée
- [ ] `components/search/SearchDiscoveryView.tsx` — fetch promoted/popular au mount
- [ ] `components/discovery/DiscoveryFeedView.tsx` — liens ville depuis API
- [ ] Conserver `mockCities` si `!isApiConfigured()` ou erreur réseau (fallback documenté)

### Config

- [ ] Déprécier `constants/searchDiscovery.ts` slugs en prod (garder pour offline)

## Fichiers concernés

- `lib/api/cities.ts`, `lib/mappers/cities.ts` (nouveau)
- `lib/searchPlaces.ts`
- `components/search/SearchDiscoveryView.tsx`
- `components/discovery/DiscoveryFeedView.tsx`
- `components/search/SearchCityResultRow.tsx`, `PromotedCityCard.tsx`, `PopularCityCard.tsx`

## Critères d'acceptation

- [ ] Recherche : villes depuis API + POI depuis API (hybride complet)
- [ ] Villes promues/populaires dynamiques (plus de slugs `paris`/`lyon` hardcodés en prod)
- [ ] Tap ville → navigation `/city/:slug` (hub encore mock jusqu'à T18)
- [ ] Points de contrôle audit #1 validés
- [ ] `npm test` vert

## Tests unitaires

- [ ] `lib/api/__tests__/cities.test.ts`
- [ ] `lib/mappers/__tests__/cities.test.ts`
- [ ] `lib/__tests__/searchPlaces.test.ts` : villes API mockées

## Références

- [T15-api-cities-f018-phase1.md](./T15-api-cities-f018-phase1.md)
