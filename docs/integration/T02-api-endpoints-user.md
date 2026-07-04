# T02 — API : endpoints utilisateur manquants

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 3–5 j |
| **Dépend de** | T00, T01 |
| **Bloque** | T08 |

## Objectif

Implémenter côté API les routes que l'app appelle déjà (ou documentées) mais qui n'existent qu'en admin aujourd'hui.

## Prérequis

- [ ] T00 : contrat audité, orchestrator audio existant
- [ ] Redis + worker BullMQ si génération audio async requise

## Endpoints à créer

### Crédits utilisateur

- [ ] `GET /api/v1/me/credits` — solde + quota abonnement (Bearer)
- [ ] `POST /api/v1/me/credits/purchase` — achat pack (stub ou intégration store)

### Génération audio user (guide privé auteur)

- [ ] `POST /api/v1/me/pois/:poiId/audio-guides/generate` → **202** + `{ jobId }`
- [ ] `GET /api/v1/me/audio-guides/jobs/:jobId` — statut (auteur uniquement)
- [ ] `GET /api/v1/me/pois/:poiId/audio-guides` — guides privés de l'utilisateur sur ce POI

## Étapes d'implémentation

- [ ] Créer module/controller user (séparé de `admin/pois`) ou étendre `audio-generation`
- [ ] Réutiliser `AudioGenerationOrchestrator` avec garde ownership (userId = auteur)
- [ ] DTOs + validation stricte (whitelist NestJS)
- [ ] Codes erreur métier : `402` `AUDIO_GUIDE_INSUFFICIENT_CREDITS` si applicable
- [ ] Tests e2e par endpoint (règle `nook-api-tests-per-feature`)
- [ ] Mettre à jour Swagger + `docs/api-client-reference.md`
- [ ] Resynchroniser copie app `nook_app_v2/docs/api-client-reference.md`

## Fichiers concernés (indicatif)

- `src/audio-generation/` (orchestrator, controllers)
- Nouveau : `src/me-credits/` ou extension `users/`
- `docs/api-client-reference.md`
- Tests `*.e2e-spec.ts`

## Critères d'acceptation

- [ ] Swagger documente les 5 routes user ci-dessus
- [ ] `POST generate` retourne 202 ; job pollable ; guide visible dans `GET .../audio-guides`
- [ ] Un user A ne peut pas lire le job de user B (404 ou 403)
- [ ] Tests e2e verts sur CI locale
- [ ] Copie contrat app synchronisée
- [ ] `npm test` vert (specs service + controller user audio/credits)

## Notes

- Admin conserve `POST /admin/pois/:poiId/audio-guides/generate` pour contenu éditorial.
- Modèle crédits/abonnement : valider règles produit avec responsable avant implémentation définitive du POST purchase.

## Tests unitaires

### API — obligatoires (règle `nook-api-tests-per-feature`)

- [ ] `me-credits.service.spec.ts` (ou équivalent) :
  - solde initial, décrément, refus 402 si crédits insuffisants
  - quota abonnement mois courant si applicable
- [ ] `user-audio-guides.service.spec.ts` :
  - `POST generate` crée job lié au userId + poiId
  - user B ne peut pas lire le job de user A
  - liste guides privés filtrée par auteur + POI
- [ ] Controller spec mocké : codes HTTP 202 / 402 / 404
- [ ] Réutiliser mocks Prisma (`test-support/prisma-user.factory.ts`) et patterns `auth.service.spec.ts`

### API — e2e (complément, voir aussi T10)

- [ ] Supertest : `GET /me/credits`, `POST generate` → poll job → `GET .../audio-guides`

### Exécution

- [ ] `npm test` vert dans `nook_api_v2` ; mentionner résultat Jest en clôture de tâche
