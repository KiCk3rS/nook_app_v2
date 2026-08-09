# T12 — App : fiche POI — images & Wikipedia (prod)

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 1–2 j |
| **Dépend de** | T11 |
| **Bloque** | — |
| **Priorité** | P0 — [INV-01](../mock-inventory.md), [INV-02](../mock-inventory.md) |
| **Priorité écran** | P0 — A3.1, A3.3 |
| **Statut** | ✅ terminé — audit suivi 2026-08-09 ; résidus `getPlaceById` → T20 |

## Objectif

Consommer `coverImage` et `wikipediaUrl` depuis l'API sur la fiche lieu, la génération guide IA et les vues qui réutilisent le détail POI — supprimer le placeholder systématique en production.

## Prérequis

- [x] T11 : `GET /pois/:id` expose `coverImage` + `wikipediaUrl`
- [x] T03 terminée (hooks / mappers POI en place)

## Étapes

### Types & mappers

- [x] Étendre `PoiDetail` dans `types/api.ts` (`coverImage`, `wikipediaUrl`)
- [x] `lib/mappers/poi.ts` :
  - `poiDetailToMockPlace` : mapper `imageUrl` depuis `coverImage.url` (fallback placeholder si null)
  - mapper `wikipediaUrl` sur `MockPlace` (ou champ dédié catalogue)
- [x] `poiSummaryToMockPlaceSummary` : image si disponible dans listes futures

### UI

- [x] `app/place/[id].tsx` — image héros depuis API
- [x] `components/place/CreateGuideSheet.tsx` — URL Wikipedia pré-remplie en prod
- [x] `lib/placeWikipedia.ts` — lire champ mappé (pas uniquement mock seed)

### Résidus liés (même tâche si rapide)

- [x] `lib/mappers/favorites.ts` — préférer snippet / image API ; `getPlaceById` seulement en démo
- [x] Vérifier `PoiPreviewCard` / discovery : déjà OK via `coverImage` discovery

## Fichiers concernés

| Modifier | Notes |
|----------|-------|
| `types/api.ts` | DTO aligné T11 |
| `lib/mappers/poi.ts` | Cœur du changement |
| `lib/mappers/favorites.ts` | Réduire fallback mock |
| `app/place/[id].tsx`, `CreateGuideSheet.tsx` | UX génération IA |
| `lib/api/__tests__/pois.test.ts`, `lib/mappers/__tests__/poi.test.ts` | Si existants / à créer |

## Critères d'acceptation

- [x] Fiche lieu API : image réelle affichée (pas placeholder) quand `coverImage` présent
- [x] Création guide IA : Wikipedia pré-remplie pour POI seed API (sans correspondance `mockPlaces`)
- [x] Mode démo / `!isApiConfigured()` : comportement mock inchangé
- [x] Point de contrôle audit #4 validé sur staging
- [x] `npm test` vert

## Tests unitaires

- [x] `lib/mappers/__tests__/poi.test.ts` :
  - `poiDetailToMockPlace` avec `coverImage` → `imageUrl` correct
  - avec `wikipediaUrl` → champ présent sur modèle UI
  - sans images → placeholder
- [x] `lib/mappers/__tests__/favorites.test.ts` : snippet API prioritaire sur `getPlaceById`

## Références

- [mock-inventory.md §4 point #4](./mock-inventory.md)
- [T11-api-poi-media-sources.md](./T11-api-poi-media-sources.md)
