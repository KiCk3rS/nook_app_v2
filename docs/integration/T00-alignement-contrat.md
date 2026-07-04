# T00 — Alignement contrat et fondations dev

| | |
|---|---|
| **Dépôts** | `nook_api_v2` + `nook_app_v2` |
| **Durée** | 1–2 j |
| **Dépend de** | — |
| **Bloque** | T01, T02, T03, T04 |

## Objectif

Une source de vérité contractuelle unique et un environnement de développement où l'app peut joindre l'API (health OK, données POI, S3 pour audio).

## Prérequis

- [x] Docker disponible (Postgres PostGIS via `nook_api_v2/docker-compose.yml`)
- [x] Node.js LTS sur les deux dépôts

## Étapes

### API (`nook_api_v2`)

- [x] Démarrer Postgres : `docker compose up -d` (port hôte **5435**)
- [x] Copier `.env.example` → `.env`, configurer `DATABASE_URL`, `JWT_ACCESS_SECRET`
- [x] Lancer l'API : `npm run start:dev` (port **3000** par défaut)
- [x] Vérifier `GET http://localhost:3000/api/health` → `{ "status": "ok" }`
- [x] Auditer divergence entre `docs/api-client-reference.md` (API) et copie app
- [x] Marquer « prévu / non implémenté » les routes absentes : `/me/credits`, génération audio user
- [x] Vérifier ou créer **seed** POI publiés suffisants pour dev (`prisma/seed.ts`, `npm run db:seed`)
- [x] Configurer **S3 ou MinIO** local pour éviter 503 sur `GET .../playback` — contournement documenté (voir Notes)
- [x] Documenter variables S3 dans `.env.example` si manquant

### App (`nook_app_v2`)

- [x] Copier `.env.example` → `.env` (existant ; adapter `API_BASE_URL` selon plateforme)
- [x] Définir `API_BASE_URL` selon plateforme :
  - iOS simulateur : `http://localhost:3000`
  - Android émulateur : `http://10.0.2.2:3000`
  - Appareil physique : `http://<IP-LAN>:3000`
- [x] Documenter ces cas dans `.env.example`
- [x] Créer `lib/api/health.ts` avec `fetchHealth()` → `GET /api/health`
- [x] Ajouter types DTO de base dans `types/api.ts` :
  - `PaginatedResponse<T>`
  - `PoiSummary`, `PoiDetail`
  - `DiscoveryItem`, `AudioTrack`, `PlaybackUrl`

## Fichiers concernés

| Dépôt | Fichiers |
|-------|----------|
| API | `.env`, `.env.example`, `docs/api-client-reference.md`, `prisma/seed.ts` |
| App | `.env`, `.env.example`, `lib/api/health.ts`, `types/api.ts`, `jest.config.js`, `lib/api/__tests__/health.test.ts` |

## Critères d'acceptation

- [x] Health OK depuis navigateur et depuis l'app (ou script curl documenté)
- [x] Contrat API synchronisé ; routes non implémentées clairement identifiées
- [x] Au moins un POI publié visible via Swagger `GET /api/v1/pois`
- [x] S3/MinIO configuré OU plan de contournement documenté pour T04
- [x] Jest configuré dans l'app ; `npm test` vert (premiers tests health)

## Notes

- En prod API sans `CORS_ORIGIN`, les origines sont refusées — traité en T10.
- Swagger live : `http://localhost:3000/api/docs`
- **S3 / MinIO (T04)** : sans variables `S3_*`, `GET .../audios/:audioId/playback` renvoie **503**. Contournement acceptable jusqu’à T04 : tester métadonnées audio (`GET .../audios`) et documenter la config MinIO locale (`S3_ENDPOINT=http://localhost:9000`, `S3_FORCE_PATH_STYLE=true`) ou un bucket AWS de dev.
- **Health check manuel** : `curl http://localhost:3000/api/health` → `{"status":"ok"}`

## Audit contrat (T00)

| Élément | Statut |
|---------|--------|
| `docs/api-client-reference.md` API ↔ app | Synchronisé (section F-015 user marquée **prévu / non implémenté**) |
| `GET /api/v1/me/credits` | **Prévu** — non implémenté API |
| `POST /api/v1/me/pois/:poiId/audio-guides/generate` | **Prévu** — non implémenté API |
| `GET /api/v1/me/audio-guides/jobs/:jobId` | **Prévu** — non implémenté API |
| Voie admin génération audio | **Implémentée** (annexe contrat) |

## Tests unitaires

### App — mise en place (obligatoire, aucune infra test aujourd'hui)

- [x] Installer et configurer **Jest + jest-expo** (`devDependencies`, `jest.config.js`, script `"test": "jest"` dans `package.json`)
- [x] Créer `lib/api/__tests__/health.test.ts` :
  - mock `fetch` → `fetchHealth()` parse `{ status: "ok" }`
  - cas erreur réseau / status non-2xx
- [x] Si helpers purs ajoutés dans `types/api.ts` (ex. guard type) : test colocalisé `types/__tests__/` — N/A (interfaces uniquement)

### API — si fichiers `src/` modifiés

- [x] Seed/scripts : pas de test unitaire requis (hors `src/`)
- [x] Si health controller ou bootstrap touché : mettre à jour spec existant ou ajouter `health.controller.spec.ts` — N/A (non modifié)
- [x] `npm test` vert avant clôture

### Critères tests

- [x] `npm test` passe dans `nook_app_v2` (première exécution verte)
- [x] `npm test` passe dans `nook_api_v2` (aucune régression)
