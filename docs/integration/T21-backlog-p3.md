# T21 — Backlog P3 : éditorial, auth reset, IAP

| | |
|---|---|
| **Dépôt** | `nook_api_v2` + `nook_app_v2` |
| **Durée** | variable (epic) |
| **Dépend de** | T10 |
| **Bloque** | — |
| **Priorité** | P3 — [INV-10](../mock-inventory.md) à [INV-12](../mock-inventory.md) |
| **Statut** | ⏸️ **En attente décision produit** — ne pas démarrer sans accord D2, D3 |

## Objectif

Regrouper les chantiers **hors périmètre T10** restant en mock. Chaque sous-lot peut devenir une tâche dédiée (T22+) une fois priorisé.

## Sous-lots

### 21a — Itinéraires éditoriaux NOOK (INV-10)

**Décision D2** : module API public pour `mockItineraries.ts` ?

| Si oui | Actions |
|--------|---------|
| API | `GET /editorial-itineraries`, détail, filtres ville/catégorie |
| App | Brancher A5.6–A5.7, paywall, guidage éditorial |

**Si non** : conserver mock ; documenter dans README.

### 21b — Favoris itinéraires serveur (INV-10, D3)

- Étendre `me/favorites` avec `targetType: itinerary` **ou** endpoint dédié
- Sync `FavoritesContext` `itineraryIds` au login
- **Recommandation audit** : reporter tant que 21a = non

### 21c — Réinitialisation mot de passe (INV-11)

- [ ] API `POST /auth/forgot-password` + email (ou token dev)
- [ ] App `app/auth/forgot-password.tsx` — appel réel, gestion erreurs

### 21d — Catalogue packs crédits IAP (INV-12)

- [ ] API : `GET /me/credits/packs` ou config publique ; validation reçu store sur `POST purchase`
- [ ] App : remplacer `CREDIT_PACK_OPTIONS` hardcodé dans `mockAudioGuideCreation.ts`

## Critères d'acceptation (par sous-lot activé)

- [ ] Sous-lot validé par responsable produit
- [ ] Contrat documenté + tests
- [ ] Mock conservé pour démo offline

## Références

- [mock-inventory.md §6 Décisions produit](./mock-inventory.md)
- [README § Hors périmètre](./README.md)
