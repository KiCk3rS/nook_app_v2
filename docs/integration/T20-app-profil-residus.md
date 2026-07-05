# T20 — App : profil & résidus hybrides

| | |
|---|---|
| **Dépôt** | `nook_app_v2` (+ API mineure optionnelle) |
| **Durée** | 2–3 j |
| **Dépend de** | T07, T12 |
| **Bloque** | — |
| **Priorité** | P2 — [INV-07](../mock-inventory.md), [INV-08](../mock-inventory.md), [INV-09](../mock-inventory.md), [INV-13](../mock-inventory.md) |

## Objectif

Combler les écarts **app-only** identifiés par l'audit : parcours récents profil, covers parcours user, enrichissement favoris sans `getPlaceById`, preview carte hors bbox.

## Prérequis

- [ ] T07 : `fetchItineraries` en place
- [ ] T12 recommandé : images POI API pour covers

## Lots de travail

### Lot A — Profil parcours récents (INV-07)

- [ ] `app/(tabs)/profil.tsx` : `recentRoutes` via `fetchItineraries({ limit: 3 })` quand `!useMockData`
- [ ] Réutiliser `UserItineraryCard` / mapper existant

### Lot B — Cover parcours user (INV-08)

- [ ] `UserItineraryCard.resolveCoverImageUrl` : utiliser `coverImageUrl` API si ajouté à `UserItinerary` **ou** fetch snippet premier POI
- [ ] Si besoin API : étendre `GET /itineraries` avec `coverPoi` snippet (petite tâche API coordonnée)

### Lot C — Profil memberSince (INV-09)

- [ ] API : exposer `createdAt` sur `GET /me` si absent
- [ ] App : `buildProfileStats` — formater `memberSinceLabel` depuis `user.createdAt`
- [ ] `citiesCount` : reporter ou masquer en prod jusqu'à stats dédiées

### Lot D — Résidus `getPlaceById` (dette §7)

- [ ] `lib/mappers/favorites.ts` — API-only en prod
- [ ] `app/(tabs)/index.tsx` — preview hors bbox : `fetchPoiById` léger ou accepter null
- [ ] Documenter appels restants légitimes (guidage éditorial mock → T21)

## Critères d'acceptation

- [ ] Profil connecté prod : section parcours récents peuplée si `routesCount > 0`
- [ ] Point de contrôle audit #6 validé
- [ ] Covers parcours : image API ou placeholder explicite (pas mock silencieux)
- [ ] `memberSince` affiché si `createdAt` API disponible
- [ ] `npm test` vert

## Tests unitaires

- [ ] `lib/profile/__tests__/profileStats.test.ts` : memberSince depuis ISO date
- [ ] Tests mapper parcours cover si logique extraite

## Références

- [mock-inventory.md §7](./mock-inventory.md)
