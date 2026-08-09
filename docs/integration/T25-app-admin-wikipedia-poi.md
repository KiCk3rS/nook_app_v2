# T25 — App : recherche Wikipedia + création POI (admin)

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T22, T23, T24 |
| **Bloque** | T26 |
| **Priorité** | Admin |
| **Features** | F-014 ; écran B9 / A1.1 → A3.1 |
| **Priorité écran** | Admin — B9 |

## Objectif

Dans l’app, un compte **ADMIN** peut ouvrir le flux « Ajouter un lieu », rechercher Wikipedia via l’API NOOK, sélectionner un article et créer le POI, puis naviguer vers la fiche lieu.

## Prérequis

- [ ] T22 : spec B9 validée
- [ ] T23 : `GET /api/v1/admin/wikipedia/search`
- [ ] T24 : `POST /api/v1/admin/pois/from-wikipedia`
- [ ] Auth app : `user.role` déjà présent sur [`types/api.ts`](../../types/api.ts) / session

## Étapes

### Auth & gate

- [ ] Helper pur `isAdmin(user)` (ex. `lib/auth/roles.ts`) — `role === 'ADMIN'`
- [ ] Exposer au besoin `isAdmin` via `useAuth()` ou dériver dans les écrans
- [ ] Aucune entrée UI si non authentifié ou non admin

### Clients API

- [ ] `lib/api/adminWikipedia.ts` — `searchWikipedia({ q, lang?, limit? })`
- [ ] `lib/api/adminPois.ts` — `createPoiFromWikipedia(payload)`
- [ ] Types réponse alignés contrat T23/T24
- [ ] Réutiliser `apiRequest` + bearer existants

### UI

- [ ] Entrée sur carte **A1.1** (`app/(tabs)/index.tsx` ou composant carte) : bouton « Ajouter un lieu » si admin
- [ ] Feuille / écran recherche (debounce `q`, langue app)
- [ ] Liste résultats → sélection → confirmation (titre, description, alerte sans coords)
- [ ] Appel création → navigation `/place/[id]`
- [ ] États : loading, vide, erreur, 403
- [ ] i18n : clés FR (et EN si le projet le fait déjà pour écrans proches)

### Hors scope T25

- Génération audio (→ T26)
- Upload images / catégories avancées
- Édition lat/lng sur carte (open question T22 — V1.1)

## Fichiers concernés (indicatif)

| Créer / modifier | Notes |
|------------------|-------|
| `lib/auth/roles.ts` | Helper `isAdmin` |
| `lib/api/adminWikipedia.ts` | Client search |
| `lib/api/adminPois.ts` | Client from-wikipedia |
| `lib/api/__tests__/adminWikipedia.test.ts` | Mock fetch |
| `lib/api/__tests__/adminPois.test.ts` | Mock fetch |
| `components/admin/…` ou `components/home/…` | Feuille recherche |
| `app/(tabs)/index.tsx` | Point d’entrée carte |

## Critères d’acceptation

- [ ] Compte `USER` : aucun bouton / route admin de création visible
- [ ] Compte `ADMIN` : recherche → sélection → POI créé → fiche ouverte
- [ ] Erreurs API affichées avec action réessayer
- [ ] Mode démo / API absente : pas de crash ; message explicite ou masquage contrôlé
- [ ] `npm test` vert (clients + helper rôle)

## Tests unitaires

- [ ] `lib/auth/__tests__/roles.test.ts` : USER / ADMIN / null
- [ ] Clients API : query string, parsing items, propagation `ApiError` (401/403/422)

## Références

- [T22](./T22-spec-ecran-admin-wikipedia-poi.md) / fiche B9
- [T23](./T23-api-wikipedia-search.md), [T24](./T24-api-poi-from-wikipedia.md)
- [T26](./T26-app-admin-audio-guide.md)
- Pattern client : `lib/api/audioGuides.ts`, `lib/api/pois.ts`
