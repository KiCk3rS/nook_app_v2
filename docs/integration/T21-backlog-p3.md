# T21 — Backlog P3 : éditorial, auth reset, IAP

| | |
|---|---|
| **Dépôt** | `nook_api_v2` + `nook_app_v2` |
| **Durée** | variable (epic) |
| **Dépend de** | T10 |
| **Bloque** | — |
| **Priorité** | P3 — [INV-10](./mock-inventory.md) à [INV-12](./mock-inventory.md) |
| **Statut** | ✅ **terminé** (2026-08-09) — D2/D3 = oui, 100 % API (mock démo offline conservé) |

## Objectif

Regrouper les chantiers **hors périmètre T10** restant en mock. Chaque sous-lot peut devenir une tâche dédiée (T22+) une fois priorisé.

## Sous-lots

### 21a — Itinéraires éditoriaux NOOK (INV-10) ✅

**Décision D2** : **oui** — module API public.

| | Actions |
|--------|---------|
| API | `GET /editorial-itineraries`, détail `:idOrSlug`, filtres ville/catégorie/quartier ; hubs `itineraryCategories` / `featuredPremiumItinerary` |
| App | A5.6–A5.7, paywall, guidage éditorial branchés API (mock si `!isApiConfigured`) |

### 21b — Favoris itinéraires serveur (INV-10, D3) ✅

- `me/favorites` étendu : `targetType: poi | editorial_itinerary`
- Sync `FavoritesContext` au login + toggle avec rollback

### 21c — Réinitialisation mot de passe (INV-11) ✅

- [x] API `POST /auth/forgot-password` + token **logué en non-production** (pas SMTP V1) ; `POST /auth/reset-password`
- [x] App `app/auth/forgot-password.tsx` — appel réel, gestion erreurs

### 21d — Catalogue packs crédits IAP (INV-12) ✅

- [x] API : `GET /me/credits/packs` ; `POST purchase` stub (pack catalogue, **sans** validation store — option A)
- [x] App : `CreditsPackSheet` charge le catalogue API (fallback local démo)

## Critères d'acceptation (par sous-lot activé)

- [x] Sous-lot validé par responsable produit (D2/D3 + option IAP A)
- [x] Contrat documenté + tests
- [x] Mock conservé pour démo offline

## Références

- [mock-inventory.md §6 Décisions produit](./mock-inventory.md)
- [README § Hors périmètre](./README.md)
- Contrat : `nook_api_v2/docs/api-client-reference.md` (auth reset, editorial-itineraries, credits/packs, favorites targetType)
