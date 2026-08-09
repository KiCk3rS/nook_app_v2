# T26 — App : génération audioguide admin (post-POI)

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 1–2 j |
| **Dépend de** | T25 ; T11/T12 (pour `wikipediaUrl` sur fiche en prod) |
| **Bloque** | — |
| **Priorité** | Admin |
| **Features** | F-015 (voie éditoriale admin) ; B6 / B7 via app ; B9 |
| **Priorité écran** | Admin |
| **Statut** | ✅ terminé (2026-08-09) |

## Objectif

Après création d’un POI (ou depuis sa fiche), un **ADMIN** peut lancer la génération d’audioguide via les routes **admin** existantes, suivre le job jusqu’à `ready` / `error`, **sans** débit de crédits utilisateur.

## Prérequis

- [x] T25 : POI créable depuis Wikipedia ; navigation fiche
- [x] API déjà en place :
  - `POST /api/v1/admin/pois/:poiId/audio-guides/generate`
  - `GET /api/v1/admin/audio-guides/jobs/:jobId`
  - (optionnel) `POST .../jobs/:jobId/retry`
- [x] T11/T12 : `wikipediaUrl` disponible sur détail POI pour préremplir / valider le CTA fiche
- [x] Pattern user existant à mirroir : [`generateAudioGuideAndAwaitJob`](../../lib/api/audioGuides.ts) (routes `/me/...` — **ne pas** réutiliser tel quel)

## Endpoints consommés

| Méthode | Route | Usage |
|---------|-------|--------|
| POST | `/api/v1/admin/pois/:poiId/audio-guides/generate` | Body `{ wikipediaUrl, language?, targetDurationMinutes? }` → 202 + `jobId` |
| GET | `/api/v1/admin/audio-guides/jobs/:jobId` | Poll statut |
| POST | `/api/v1/admin/audio-guides/jobs/:jobId/retry` | Relance si exposé et utile UX |

## Étapes

### Client API

- [x] `lib/api/adminAudioGuides.ts` (ou extension `adminPois.ts`) :
  - `generateAdminAudioGuide(poiId, payload)`
  - `getAdminAudioGuideJob(jobId)`
  - `generateAdminAudioGuideAndAwaitJob(...)` — poll aligné sur la politique user (intervalles / timeout)
- [x] Ne pas toucher au solde crédits / `CreditsContext`

### UI

- [x] CTA post-création (feuille succès T25) : « Générer l’audioguide »
- [x] CTA sur fiche **A3.1** si `isAdmin` && `wikipediaUrl` présent
- [x] Paramètres minimaux V1 : langue dérivée URL ou préférence app ; durée cible optionnelle (défaut API)
- [x] États : launching, pending, ready, error (+ retry si dispo)
- [x] Succès : rafraîchir détail POI / liste audios ; accès lecteur A3.2 si piste publiée
- [x] Microcopy distincte de A3.3 (pas de mentions crédits / abonnement)

### Hors scope T26

- Pipeline UI jobs multi-POI (B7 backlog)
- Édition script / voice ElevenLabs avancée
- Génération user (`/me/...`) — déjà T08

## Fichiers concernés (indicatif)

| Créer / modifier | Notes |
|------------------|-------|
| `lib/api/adminAudioGuides.ts` | Client + await job |
| `lib/api/__tests__/adminAudioGuides.test.ts` | Mock fetch / poll |
| Composant feuille ou section fiche admin | CTA + états job |
| `app/place/[id].tsx` | Afficher CTA admin |
| Flux succès T25 | Enchaînement optionnel |

## Critères d’acceptation

- [x] Admin peut lancer generate après création Wikipedia sans perdre de crédits
- [x] User non-admin : aucun CTA génération admin
- [x] Job suivi jusqu’à état terminal (ready ou error) avec message compréhensible
- [x] Ready : audio visible / jouable selon règles publication admin
- [x] `npm test` vert

## Tests unitaires

- [x] `generateAdminAudioGuide` : URL path `/admin/pois/.../generate`, body, 202
- [x] `generateAdminAudioGuideAndAwaitJob` : poll jusqu’à ready ; échec si error ; timeout
- [x] Pas d’appel `/me/credits` dans ce flux

## Références

- [T22](./T22-spec-ecran-admin-wikipedia-poi.md) états job
- [T25](./T25-app-admin-wikipedia-poi.md)
- [T08](./T08-credits-guide-ia.md) — contraste voie user
- [T11](./T11-api-poi-media-sources.md) / [T12](./T12-app-poi-media-sources.md)
- API : `nook_api_v2` `AdminPoiAudioGenerationController`, `audio-generation-jobs.controller.ts`
- Contrat : `docs/api-client-reference.md` § admin audio-guides
