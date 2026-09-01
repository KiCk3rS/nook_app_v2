# T27 — Hub site POI conteneur A4.6 (API + App)

| | |
|---|---|
| **Dépôt** | `nook_api_v2` + `nook_app_v2` |
| **Durée** | 3–5 j |
| **Dépend de** | T19 (pattern hub) ; F-006 hiérarchie POI |
| **Bloque** | — |
| **Priorité** | P2 — A4.6 |
| **Priorité écran** | P2 — A4.6 |
| **Statut** | ✅ **terminé** — validé produit 2026-09-01 |

## Validation (checklist)

### API locale (`localhost:3000`)

| # | Vérification | Commande / action | Résultat 2026-09-01 |
|---|--------------|-------------------|---------------------|
| 1 | Health | `GET /api/health` | ✅ `{"status":"ok"}` |
| 2 | Louvre = hub | `GET /api/v1/pois?q=louvre` | ✅ `presentation: "HUB"`, id `373b303d-…` |
| 3 | Hub site payload | `GET /api/v1/pois/{louvreId}/hub` | ✅ 4 must-see (Joconde, Vénus de Milo, Victoire de Samothrace, Liberté guidant le peuple) |
| 4 | Villes promues | `GET /api/v1/cities?promoted=true` | ✅ Paris |
| 5 | Hub ville | `GET /api/v1/cities/paris/hub` | ✅ must-see + catégories itinéraires |

### App (validé produit 2026-09-01)

| # | Scénario | Attendu | Statut |
|---|----------|---------|--------|
| 6 | Recherche « louvre » → tap résultat | Navigation `/place/{id}/hub` (pas fiche A3.1) | ✅ |
| 7 | Hub site Louvre | Héros + carte + 4 incontournables API | ✅ |
| 8 | Tap must-see enfant | Fiche A3.1 enfant | ✅ |
| 9 | POI non-hub (ex. Tour Eiffel) | Fiche A3.1 inchangée | ✅ |
| 10 | Mode offline (`!API_BASE_URL`) | Mock Louvre via `mockSiteHubs` | ✅ |

### Qualité

| # | Vérification | Résultat |
|---|--------------|----------|
| 11 | `npm test` API | ✅ 286 tests |
| 12 | `npm test` app (T27) | ✅ `placeNavigation`, `pois`, `searchPlaces` ; 1 échec préexistant `audioGuides.test.ts` (hors périmètre) |

## Objectif

Exposer une vitrine hub pour les **gros POI conteneurs** (Musée du Louvre en MVP) : même gabarit que ville / quartier, basé sur le POI (`presentation: hub`) — **option A**.

## Prérequis

- [x] Spec [ecran-A4.6-hub-site.md](../ecran-A4.6-hub-site.md)
- [x] Hiérarchie `parentPoiId` / `GET /pois/:id/children` (F-006)
- [x] Pattern hub T17–T19 (`TerritorialHubView`, snippets)
- [x] Décision produit seuils : **reprendre A4.5** (figé — appliqué côté seed Louvre)

## Décisions figées

| Sujet | Choix |
|-------|--------|
| Modèle | Flag `presentation: hub` sur `Poi` (pas d’entité SiteHub) |
| Endpoint | `GET /api/v1/pois/:id/hub` |
| Seed MVP | Louvre + ≥ 4 enfants must-see |
| V1 contenu | Héros + map + must-see/recommended ; stubs catégories / premium / expériences |
| Routing app | `/place/[id]/hub` si hub ; sinon `/place/[id]` |

## Étapes API

- [x] Champ / enum `presentation` sur `Poi` (défaut fiche / hub)
- [x] Table curation `poi_hub_pois` (MUST_SEE / RECOMMENDED) — miroir city/district
- [x] `GET /pois/:idOrSlug/hub` → DTO aligné `DistrictHubResponseDto` (sans `touristPasses` utiles)
- [x] Signal routing sur snippets / liste / détail (`presentation`)
- [x] Seed Louvre + enfants + liens hub
- [x] Tests service + e2e (stub)

## Étapes App

- [x] Types + `fetchPoiHub` + mapper → `TerritorialHubData`
- [x] Hook `usePoiHub` (via `useTerritorialHubResource`)
- [x] Écran `app/place/[id]/hub.tsx`
- [x] `placeNavigation` : hub site si `presentation === 'HUB'`
- [x] Mock offline Louvre
- [x] Tests mappers / navigation

## Critères d'acceptation

- [x] `/place/{louvreId}/hub` navigable avec must-see enfants API (validé produit 2026-09-01)
- [x] POI non-hub → fiche A3.1 inchangée
- [x] Mock offline conservé si `!isApiConfigured()`
- [x] `npm test` vert API ; app T27 OK (1 échec préexistant hors périmètre)

## Hors V1 (dépend T21 / F-018-c/d)

- Itinéraires éditoriaux site réels
- Expériences GetYourGuide persistées
- Seed Delphes

## Références

- [ecran-A4.6-hub-site.md](../ecran-A4.6-hub-site.md)
- [ecran-A4.5-hub-quartier.md](../ecran-A4.5-hub-quartier.md)
- [T19-hubs-quartier-f018.md](./T19-hubs-quartier-f018.md)
