# T20 — App : profil & résidus hybrides

| | |
|---|---|
| **Dépôt** | `nook_app_v2` (+ API mineure optionnelle) |
| **Durée** | 2–3 j |
| **Dépend de** | T07, T12 |
| **Bloque** | — |
| **Priorité** | P2 — [INV-07](../mock-inventory.md), [INV-08](../mock-inventory.md), [INV-09](../mock-inventory.md), [INV-13](../mock-inventory.md) |
| **Statut** | ✅ terminé (app-only) — covers via placeholder / `coverImageUrl` (pas d’extension `coverPoi` API) |

## Objectif

Combler les écarts **app-only** identifiés par l'audit : parcours récents profil, covers parcours user, enrichissement favoris sans `getPlaceById`, preview carte hors bbox.

## Prérequis

- [x] T07 : `fetchItineraries` en place
- [x] T12 recommandé : images POI API pour covers

## Lots de travail

### Lot A — Profil parcours récents (INV-07)

- [x] `app/(tabs)/profil.tsx` : `recentRoutes` via `fetchItineraries({ limit: 3 })` quand `!useMockData`
- [x] Réutiliser `UserItineraryCard` / mapper existant

### Lot B — Cover parcours user (INV-08)

- [x] `UserItineraryCard.resolveCoverImageUrl` : utiliser `coverImageUrl` API si ajouté à `UserItinerary` **ou** fetch snippet premier POI
- [x] Si besoin API : étendre `GET /itineraries` avec `coverPoi` snippet (petite tâche API coordonnée) — **reporté** ; placeholder explicite en attendant

### Lot C — Profil memberSince (INV-09)

- [x] API : exposer `createdAt` sur `GET /me` si absent (déjà présent)
- [x] App : `buildProfileStats` — formater `memberSinceLabel` depuis `user.createdAt`
- [x] `citiesCount` : retiré du pipeline stats UI jusqu’à stats dédiées

### Lot D — Résidus `getPlaceById` (dette §7)

- [x] `lib/mappers/favorites.ts` — API-only en prod
- [x] `app/(tabs)/index.tsx` — preview hors bbox : `fetchPoiById` léger ou accepter null
- [x] Documenter appels restants légitimes (guidage éditorial mock → T21)

## Critères d'acceptation

- [x] Profil connecté prod : section parcours récents peuplée si `routesCount > 0`
- [x] Point de contrôle audit #6 validé
- [x] Covers parcours : image API ou placeholder explicite (pas mock silencieux)
- [x] `memberSince` affiché si `createdAt` API disponible
- [x] `npm test` vert

## Tests unitaires

- [x] `lib/profile/__tests__/profileStats.test.ts` : memberSince depuis ISO date
- [x] Tests mapper parcours cover si logique extraite

## Références

- [mock-inventory.md §7](./mock-inventory.md)
