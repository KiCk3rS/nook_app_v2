# T06 — Favoris synchronisés

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2 j |
| **Dépend de** | T03 |
| **Bloque** | T09 |
| **Priorité écran** | P2 — A6.5 |
| **Statut** | ✅ terminé (2026-07-05) — checklist réalignée 2026-08-09 |

## Objectif

Synchroniser les favoris avec l'API pour les utilisateurs connectés ; conserver le stockage local en mode demo / offline.

## Prérequis

- [x] T03 : POI identifiables par UUID API
- [x] Auth fonctionnelle (déjà en place)

## Endpoints

| Méthode | Route | Notes |
|---------|-------|-------|
| GET | `/api/v1/me/favorites` | Paginé |
| POST | `/api/v1/me/favorites` | Body `{ poiId }` → 201 ou 200 |
| POST | `/api/v1/me/favorites/:poiId` | Variante par chemin |
| DELETE | `/api/v1/me/favorites/:poiId` | 204 idempotent |

## Étapes

- [x] Créer `lib/api/favorites.ts` :
  - `fetchFavorites(query)`
  - `addFavorite(poiId)`
  - `removeFavorite(poiId)`
- [x] Refactor `contexts/FavoritesContext.tsx` :
  - User connecté + API → source of truth serveur
  - Demo / offline → AsyncStorage existant (`lib/favoritesStorage.ts`)
  - Sync au login (fetch initial)
- [x] Mettre à jour composants favoris pour snippets POI depuis réponse API :
  - `components/favorites/FavoritePlaceRow.tsx`
  - `components/favorites/FavoriteSuggestionRow.tsx`
  - Écran favoris (depuis profil)
- [x] Toggle favori sur fiche lieu → API si connecté

## Fichiers concernés

- `lib/api/favorites.ts` (nouveau)
- `contexts/FavoritesContext.tsx`, `lib/favoritesStorage.ts`
- `components/favorites/*`, `app/place/[id].tsx`

## Critères d'acceptation

- [x] Ajout/suppression favori persisté serveur après re-login
- [x] POST duplicate → 200 sans erreur UI
- [x] DELETE idempotent sans crash
- [x] Mode demo : comportement local inchangé

## Tests unitaires

### App

- [x] `lib/api/__tests__/favorites.test.ts` :
  - GET parse `{ items, total, ... }`
  - POST / DELETE appellent bons chemins et méthodes
- [x] Extraire logique sync (ex. `lib/favorites/syncFavorites.ts`) et tester :
  - merge IDs serveur + local offline
  - mode demo → ignore API
  - optimistic update rollback sur erreur

### API — si touché

- [x] `favorites.service.spec.ts` : POST duplicate 200, DELETE idempotent

### Exécution

- [x] `npm test` vert dans `nook_app_v2`
