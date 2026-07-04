# T07 — Parcours utilisateur (CRUD complet)

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T01 |
| **Priorité écran** | P1 — A5.1, A5.4, A5.5 |

## Objectif

Corriger le client itinéraires (pagination API) et compléter create/update ; aligner le guidage sur `steps[]` API.

## Prérequis

- [ ] T01 : helper pagination
- [ ] Auth + POI API (T03 recommandé pour sélection POI)

## Endpoints (déjà existants API)

| Méthode | Route |
|---------|-------|
| GET | `/api/v1/itineraries` |
| POST | `/api/v1/itineraries` |
| GET | `/api/v1/itineraries/:id` |
| PATCH | `/api/v1/itineraries/:id` |
| DELETE | `/api/v1/itineraries/:id` |

## Bug connu à corriger

`lib/api/itineraries.ts` parse la réponse comme un tableau brut ; l'API renvoie `{ items, total, limit, offset }`.

## Étapes

- [ ] Corriger `fetchItineraries()` — extraire `items` + exposer `total` pour pagination UI
- [ ] Aligner types `UserItinerary` / `UserItineraryDetail` sur DTO API (`steps[]` avec lat/lng)
- [ ] Ajouter `createItinerary(payload)` → POST
- [ ] Ajouter `patchItinerary(id, payload)` → PATCH
- [ ] Mettre à jour `app/itineraries/index.tsx` — liste paginée
- [ ] Mettre à jour `app/itinerary/[id]/guide.tsx` — steps depuis API
- [ ] Composants carte guidage : `GuidanceExperience.tsx`, `ItineraryRouteMapPreview.tsx`

## Hors scope (rester mock)

- [ ] Documenter dans README integration : itinéraires **éditoriaux** (`mockItineraries.ts`) sans API publique
- [ ] Hubs ville (`TerritorialHubView.tsx`) inchangés

## Fichiers concernés

- `lib/api/itineraries.ts`, `types/api.ts`
- `app/itineraries/index.tsx`, `app/itinerary/[id]/guide.tsx`
- `components/guidance/*`, `components/itineraries/*`

## Critères d'acceptation

- [ ] Liste parcours affiche les parcours du user connecté (pas vide / pas crash parse)
- [ ] Création parcours ≥ 2 POI → visible en liste
- [ ] Guidage affiche étapes ordonnées avec coords carte
- [ ] Suppression → 204, disparaît de la liste
- [ ] Mock session : fallback existant conservé

## Specs écrans liées

- [`docs/ecran-A5.1-liste-parcours.md`](../ecran-A5.1-liste-parcours.md)
- [`docs/ecran-A5.5-mode-guidage.md`](../ecran-A5.5-mode-guidage.md)

## Tests unitaires

### App — priorité haute (bug pagination connu)

- [ ] `lib/api/__tests__/itineraries.test.ts` :
  - **`fetchItineraries` extrait `items`** depuis `{ items, total, limit, offset }` (régression)
  - `fetchItineraryById` mappe `steps[]` (order, poiId, lat, lng)
  - `createItinerary` / `patchItinerary` sérialisent payload (`poiIds`, `difficulty`)
  - `deleteItinerary` gère réponse 204 vide
- [ ] Test pur ordre steps → coords polyligne guidage si helper extrait

### API — si touché

- [ ] `itineraries.service.spec.ts` : création ≥ 2 POI, ordre steps conservé

### Exécution

- [ ] `npm test` vert dans `nook_app_v2`
