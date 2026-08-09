# T07 — Parcours utilisateur (CRUD complet)

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T01 |
| **Priorité écran** | P1 — A5.1, A5.4, A5.5 |
| **Statut** | ✅ terminé (2026-07-05) — checklist réalignée 2026-08-09 |

## Objectif

Corriger le client itinéraires (pagination API) et compléter create/update ; aligner le guidage sur `steps[]` API.

## Prérequis

- [x] T01 : helper pagination
- [x] Auth + POI API (T03 recommandé pour sélection POI)

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

- [x] Corriger `fetchItineraries()` — extraire `items` + exposer `total` pour pagination UI
- [x] Aligner types `UserItinerary` / `UserItineraryDetail` sur DTO API (`steps[]` avec lat/lng)
- [x] Ajouter `createItinerary(payload)` → POST
- [x] Ajouter `patchItinerary(id, payload)` → PATCH
- [x] Mettre à jour `app/itineraries/index.tsx` — liste paginée
- [x] Mettre à jour `app/itinerary/[id]/guide.tsx` — steps depuis API
- [x] Composants carte guidage : `GuidanceExperience.tsx`, `ItineraryRouteMapPreview.tsx`

## Hors scope (rester mock)

- [x] Documenter dans README integration : itinéraires **éditoriaux** (`mockItineraries.ts`) sans API publique
- [x] Hubs ville (`TerritorialHubView.tsx`) inchangés

## Fichiers concernés

- `lib/api/itineraries.ts`, `types/api.ts`
- `app/itineraries/index.tsx`, `app/itinerary/[id]/guide.tsx`
- `components/guidance/*`, `components/itineraries/*`

## Critères d'acceptation

- [x] Liste parcours affiche les parcours du user connecté (pas vide / pas crash parse)
- [x] Création parcours ≥ 2 POI → visible en liste
- [x] Guidage affiche étapes ordonnées avec coords carte
- [x] Suppression → 204, disparaît de la liste
- [x] Mock session : fallback existant conservé

## Specs écrans liées

- [`docs/ecran-A5.1-liste-parcours.md`](../ecran-A5.1-liste-parcours.md)
- [`docs/ecran-A5.5-mode-guidage.md`](../ecran-A5.5-mode-guidage.md)

## Tests unitaires

### App — priorité haute (bug pagination connu)

- [x] `lib/api/__tests__/itineraries.test.ts` :
  - **`fetchItineraries` extrait `items`** depuis `{ items, total, limit, offset }` (régression)
  - `fetchItineraryById` mappe `steps[]` (order, poiId, lat, lng)
  - `createItinerary` / `patchItinerary` sérialisent payload (`poiIds`, `difficulty`)
  - `deleteItinerary` gère réponse 204 vide
- [x] Test pur ordre steps → coords polyligne guidage si helper extrait

### API — si touché

- [x] `itineraries.service.spec.ts` : création ≥ 2 POI, ordre steps conservé

### Exécution

- [x] `npm test` vert dans `nook_app_v2`
