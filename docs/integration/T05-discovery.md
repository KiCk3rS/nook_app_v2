# T05 — Discovery (fil de découverte)

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T03 |
| **Priorité écran** | P0 — A4.1 |

## Objectif

Alimenter le fil de découverte depuis les 3 endpoints API au lieu de `discoveryFeed` mock.

## Prérequis

- [ ] T03 : navigation vers fiche lieu par `poiId` API

## Endpoints

| GET | Route | Section UI |
|-----|-------|------------|
| `/api/v1/discovery/latest` | Derniers publiés |
| `/api/v1/discovery/popular` | Plus écoutés (7 j) |
| `/api/v1/discovery/top-rated` | Mieux notés |

Query : `limit`, `offset` — réponse `{ items, total, limit, offset }`.

## Étapes

- [ ] Créer `lib/api/discovery.ts` :
  - `fetchDiscoveryLatest(query)`
  - `fetchDiscoveryPopular(query)`
  - `fetchDiscoveryTopRated(query)`
- [ ] Refactor `components/discovery/DiscoveryFeedView.tsx` :
  - 3 sections parallèles (Promise.all)
  - Pagination `loadMore` via offset
  - Placeholder si `coverImage: null`
- [ ] Adapter `components/discovery/DiscoveryPlaceCard.tsx` aux champs `DiscoveryPoiItemDto`
- [ ] Supprimer ou isoler `constants/discoveryFeed.ts` (fallback mock si `!isApiConfigured()`)

## Fichiers concernés

- `lib/api/discovery.ts` (nouveau)
- `components/discovery/DiscoveryFeedView.tsx`, `DiscoveryPlaceCard.tsx`
- `constants/discoveryFeed.ts`

## Critères d'acceptation

- [ ] Les 3 sections affichent des POI réels avec API configurée
- [ ] Scroll / load more charge la page suivante (offset)
- [ ] Tap sur carte → fiche lieu API (T03)
- [ ] Fallback mock si pas d'API

## Notes

- Pas d'endpoint agrégé `discovery/sections` — 3 appels distincts pour l'instant.

## Tests unitaires

### App

- [ ] `lib/api/__tests__/discovery.test.ts` :
  - 3 fonctions appellent les bons chemins (`/latest`, `/popular`, `/top-rated`)
  - parse réponse paginée ; `loadMore` incrémente `offset`
- [ ] Test mapper carte discovery → props `DiscoveryPlaceCard` (`coverImage: null` → placeholder flag)

### API — si touché

- [ ] `discovery.service.spec.ts` à jour

### Exécution

- [ ] `npm test` vert dans `nook_app_v2`
