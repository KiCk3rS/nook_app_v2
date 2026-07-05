# T10 — Runbook déploiement staging / production

Guide opérationnel pour déployer **nook_api_v2** et **nook_app_v2** après intégration T00–T09.

## URLs et environnements

| Environnement | API | App (EAS) | Notes |
|---------------|-----|-----------|-------|
| **Local** | `http://localhost:3000` | Expo dev (`npx expo start`) | Android émulateur : `http://10.0.2.2:3000` |
| **Staging** | `https://api-staging.<domaine>` | profil EAS `preview` | Build interne TestFlight / APK |
| **Production** | `https://api.<domaine>` | profil EAS `production` | Stores |

Swagger : `{API_BASE_URL}/api/docs`  
Health : `{API_BASE_URL}/api/health`

---

## API (nook_api_v2)

### Checklist variables (`.env` / secrets hébergeur)

| Variable | Staging / Prod |
|----------|----------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | PostgreSQL + PostGIS (migrations : `npm run db:migrate:deploy`) |
| `JWT_ACCESS_SECRET` | Secret fort (≥ 32 caractères aléatoires) |
| `JWT_ACCESS_EXPIRES` | `15m` (recommandé) |
| `JWT_REFRESH_EXPIRES` | `7d` |
| `CORS_ORIGIN` | Origines app : Expo web, domaine web, schémas deep link si besoin |
| `S3_*` + `MEDIA_SIGNING_EXPIRES_SECONDS` | Bucket médias ; requis pour `GET .../playback` |
| `REDIS_URL` | Requis si génération audio IA (BullMQ) |
| `ANTHROPIC_*` / `ELEVENLABS_*` | Requis pour jobs F-015 et guide-chat |

Référence complète : [`nook_api_v2/.env.example`](../../../nook_api_v2/.env.example)

### Déploiement API

1. Appliquer les migrations : `npm run db:migrate:deploy`
2. (Optionnel) seed données de démo : `npm run db:seed`
3. Build : `npm run build`
4. Démarrage : `npm run start:prod`
5. Vérifier : `GET /api/health` → `{ "status": "ok" }`

### Rollback API

1. Revenir au artefact / image précédente sur l’hébergeur
2. Si migration incompatible : restaurer snapshot BDD **ou** déployer une migration de rollback Prisma préparée à l’avance
3. Vérifier health + auth + un parcours POI/audio

---

## App (nook_app_v2)

### Secrets EAS (obligatoires)

`API_BASE_URL` et `GOOGLE_MAPS_API_KEY` sont lus au build via `process.env` dans `app.config.js`. **Ne pas** les committer dans `eas.json` — utiliser uniquement les secrets EAS :

```bash
# Staging (profil preview)
eas secret:create --name API_BASE_URL --value "https://api-staging.votre-domaine.com" --scope project

# Production — mettre à jour la valeur du secret avant release store
eas secret:delete --name API_BASE_URL
eas secret:create --name API_BASE_URL --value "https://api.votre-domaine.com" --scope project

# Carte Google (obligatoire en build EAS)
eas secret:create --name GOOGLE_MAPS_API_KEY --value "VOTRE_CLE" --scope project
```

Les profils `preview` et `production` dans `eas.json` n’embarquent pas d’URL : la source de vérité est le secret `API_BASE_URL` du projet EAS.

### Build preview (staging)

```bash
eas build --profile preview --platform all
```

Installer le build sur appareil, pointer vers l’API staging, valider le parcours P0 (carte → fiche → audio → favoris → profil).

### Build production

```bash
eas build --profile production --platform all
eas submit --profile production --platform all
```

### Rollback app

- Publier un build EAS précédent connu stable (même `API_BASE_URL` ou reconfigurer le secret si l’API a été rollback)

---

## Qualification automatisée (gate T10)

| Dépôt | Commande | Attendu |
|-------|----------|---------|
| API | `npm test` | 178+ tests unitaires verts |
| API | `npm run test:e2e` | 28 tests Supertest (mocks Prisma / S3 / LLM) |
| App | `npm test` | Suite Jest complète verte |

CI : workflows GitHub Actions `.github/workflows/test.yml` sur chaque dépôt.

---

## Matrice manuelle (extraits P0)

À exécuter sur build **preview** + API **staging** avant release :

| Écran | Connecté | Offline | API down |
|-------|----------|---------|----------|
| Carte accueil | POI réels, pas de mock silencieux | message dégradé | mode limité (T09) |
| Fiche + audio | lecture URL signée | cache / erreur explicite | pas de crash |
| Favoris | sync API | état local cohérent | rollback optimiste |
| Profil | stats API si dispo | — | health + message |

Référence complète : [`T10-qa-production.md`](./T10-qa-production.md)

---

## Hors périmètre (rester mock)

- Hubs ville / pays (F-018)
- Itinéraires éditoriaux NOOK
- Reset mot de passe (pas d’endpoint API)
