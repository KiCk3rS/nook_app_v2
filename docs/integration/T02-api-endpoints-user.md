# T02 — API : endpoints utilisateur manquants

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 3–5 j |
| **Dépend de** | T00, T01 |
| **Bloque** | T08 |
| **Statut** | ✅ terminé (2026-07-05) — checklist réalignée 2026-08-09 |

## Objectif

Implémenter côté API les routes que l'app appelle déjà (ou documentées) mais qui n'existent qu'en admin aujourd'hui.

## Prérequis

- [x] T00 : contrat audité, orchestrator audio existant
- [x] Redis + worker BullMQ si génération audio async requise

## Endpoints à créer

### Crédits utilisateur

- [x] `GET /api/v1/me/credits` — solde + quota abonnement (Bearer)
- [x] `POST /api/v1/me/credits/purchase` — achat pack (stub ou intégration store)

### Génération audio user (guide privé auteur)

- [x] `POST /api/v1/me/pois/:poiId/audio-guides/generate` → **202** + `{ jobId }`
- [x] `GET /api/v1/me/audio-guides/jobs/:jobId` — statut (auteur uniquement)
- [x] `GET /api/v1/me/pois/:poiId/audio-guides` — guides privés de l'utilisateur sur ce POI

## Étapes d'implémentation

- [x] Créer module/controller user (séparé de `admin/pois`) ou étendre `audio-generation`
- [x] Réutiliser `AudioGenerationOrchestrator` avec garde ownership (userId = auteur)
- [x] DTOs + validation stricte (whitelist NestJS)
- [x] Codes erreur métier : `402` `AUDIO_GUIDE_INSUFFICIENT_CREDITS` si applicable
- [x] Tests e2e par endpoint (règle `nook-api-tests-per-feature`)
- [x] Mettre à jour Swagger + `docs/api-client-reference.md`
- [x] Resynchroniser copie app `nook_app_v2/docs/api-client-reference.md`

## Fichiers concernés (indicatif)

- `src/audio-generation/` (orchestrator, controllers)
- Nouveau : `src/me-credits/` ou extension `users/`
- `docs/api-client-reference.md`
- Tests `*.e2e-spec.ts`

## Critères d'acceptation

- [x] Swagger documente les 5 routes user ci-dessus
- [x] `POST generate` retourne 202 ; job pollable ; guide visible dans `GET .../audio-guides`
- [x] Un user A ne peut pas lire le job de user B (404 ou 403)
- [x] Tests e2e verts sur CI locale
- [x] Copie contrat app synchronisée
- [x] `npm test` vert (specs service + controller user audio/credits)

## Notes

- Admin conserve `POST /admin/pois/:poiId/audio-guides/generate` pour contenu éditorial.
- Modèle crédits/abonnement : valider règles produit avec responsable avant implémentation définitive du POST purchase.

## Tests unitaires

### API — obligatoires (règle `nook-api-tests-per-feature`)

- [x] `me-credits.service.spec.ts` (ou équivalent) :
  - solde initial, décrément, refus 402 si crédits insuffisants
  - quota abonnement mois courant si applicable
- [x] `user-audio-guides.service.spec.ts` :
  - `POST generate` crée job lié au userId + poiId
  - user B ne peut pas lire le job de user A
  - liste guides privés filtrée par auteur + POI
- [x] Controller spec mocké : codes HTTP 202 / 402 / 404
- [x] Réutiliser mocks Prisma (`test-support/prisma-user.factory.ts`) et patterns `auth.service.spec.ts`

### API — e2e (complément, voir aussi T10)

- [x] Supertest : `GET /me/credits`, `POST generate` → poll job → `GET .../audio-guides`

### Exécution

- [x] `npm test` vert dans `nook_api_v2` ; mentionner résultat Jest en clôture de tâche
