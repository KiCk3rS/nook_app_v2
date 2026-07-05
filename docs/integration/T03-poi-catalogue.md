# T03 — Catalogue POI : carte, recherche, fiche lieu

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 4–6 j |
| **Dépend de** | T01 |
| **Bloque** | T04, T05, T06 |
| **Priorité écran** | P0 — A1.1, A2.x, A3.1 |

## Objectif

Remplacer les mocks catalogue (`mockPlaces`, recherche locale) par les endpoints POI et catégories de l'API.

## Prérequis

- [x] T01 terminée
- [x] T00 : POI publiés en base

## Endpoints

| Méthode | Route | Usage |
|---------|-------|-------|
| GET | `/api/v1/categories` | Filtres, slider catégories |
| GET | `/api/v1/pois?bbox=...` | Carte accueil |
| GET | `/api/v1/pois?lat=&lng=&radiusMeters=` | Proximité |
| GET | `/api/v1/pois?q=&category=&sort=` | Recherche textuelle |
| GET | `/api/v1/pois/:id?includeAudios=true` | Fiche lieu |
| GET | `/api/v1/pois/:id/children` | Sous-lieux |

## Étapes

### Modules API client

- [x] Créer `lib/api/categories.ts` → `fetchCategories()`
- [x] Créer `lib/api/pois.ts` :
  - `fetchPois(query)` avec bbox / geo / recherche
  - `fetchPoiById(id, { includeAudios })`
  - `fetchPoiChildren(id, pagination)`
- [x] Créer mappers DTO → modèles UI (`lib/mappers/poi.ts` ou inline)

### Hooks / data

- [x] `hooks/usePoisInBbox.ts` — debounce on region change
- [x] `hooks/usePoiDetail.ts` — loading / error / empty

### Écrans et composants

- [x] `app/(tabs)/index.tsx` + `components/home/HomeMap.tsx` — fetch bbox
- [x] `lib/searchPlaces.ts` — appeler API au lieu du filtre mock
- [x] `app/place/[id].tsx` — détail depuis API
- [x] `components/home/PoiPreviewCard.tsx`, `PlaceMapMarker.tsx` — props depuis DTO
- [x] Adapter layer : API si `isApiConfigured()`, sinon mock existant

## Fichiers concernés

| Nouveau | Existant à migrer |
|---------|-------------------|
| `lib/api/pois.ts`, `lib/api/categories.ts` | `constants/mockPlaces.ts` |
| `hooks/usePoisInBbox.ts`, `hooks/usePoiDetail.ts` | `app/(tabs)/index.tsx`, `lib/searchPlaces.ts` |
| | `app/place/[id].tsx`, `components/home/*` |

## Critères d'acceptation

- [x] Carte affiche des POI réels quand `API_BASE_URL` est défini
- [x] Recherche textuelle retourne résultats API (pas mock)
- [x] Fiche lieu charge titre, description, images, audios metadata depuis API
- [x] Mode sans API : comportement mock inchangé
- [x] États loading / erreur / vide gérés (spec A1.3 partiel)

## Specs écrans liées

- [`docs/ecran-A2.1-recherche-textuelle.md`](../ecran-A2.1-recherche-textuelle.md)
- [`docs/ecran-A3.1-fiche-lieu.md`](../ecran-A3.1-fiche-lieu.md)

## Notes

- `GET /pois` exige `q` **ou** bbox **ou** lat+lng+radius — ne jamais appeler sans filtre géo/recherche.
- Tri déterministe côté API ; respecter pagination `limit`/`offset` si listes longues.

## Tests unitaires

### App

- [x] `lib/api/__tests__/pois.test.ts` :
  - `fetchPois` construit URL bbox / lat+lng+radius / `q` correctement
  - parse `{ items, total, limit, offset }`
  - propage `ApiError` 422 si filtre manquant (côté client : ne pas appeler sans filtre — test guard local)
- [x] `lib/api/__tests__/categories.test.ts` : parse `{ items: [...] }`
- [x] `lib/mappers/__tests__/poi.test.ts` (si mapper extrait) :
  - DTO API → props `PoiPreviewCard` / marqueur carte
  - champs optionnels (`images`, `categories`) null-safe
- [x] `lib/searchPlaces.test.ts` ou `__tests__/searchPlaces.test.ts` :
  - délègue à API quand configurée ; fallback mock sinon

### API — si correction côté serveur

- [ ] Compléter `pois.service.spec.ts` / `list-pois.query.dto.spec.ts` si nouveaux filtres touchés

### Exécution

- [x] `npm test` vert dans `nook_app_v2` (+ API si modifiée)
