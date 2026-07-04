# T10 — Qualification et mise en production

| | |
|---|---|
| **Dépôts** | `nook_api_v2` + `nook_app_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T02–T09 |

## Objectif

Valider l'intégration de bout en bout, préparer staging/prod (CORS, secrets, S3, EAS).

## Prérequis

- [ ] Toutes les tâches T00–T09 terminées ou explicitement reportées avec accord

## Checklist API (staging/prod)

- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` inclut origines app (Expo web, deep links si applicable)
- [ ] Secrets JWT forts (access + refresh)
- [ ] `DATABASE_URL` production
- [ ] S3 bucket + credentials ; test `GET .../playback`
- [ ] Redis + worker audio si génération IA activée
- [ ] Throttle / rate limits acceptables pour usage mobile

## Checklist App (staging/prod)

- [ ] `API_BASE_URL` via EAS secrets (`eas.json` profils preview/production)
- [ ] Build preview pointant vers API staging
- [ ] SecureStore tokens en release
- [ ] Pas de clés secrètes dans repo

## Tests API (e2e)

- [ ] Auth register/login/refresh/logout
- [ ] POI list/detail/children
- [ ] Audios + playback (mock S3 ou bucket test)
- [ ] Discovery × 3
- [ ] Favorites CRUD
- [ ] Listen-history GET/POST
- [ ] Itineraries CRUD
- [ ] Guide-chat GET/POST (+ 402 si testable)
- [ ] Credits + audio generation user (T02)

## Tests App (manuel — matrice)

| Écran | Anonyme | Connecté | Offline | API down |
|-------|---------|----------|---------|----------|
| Carte accueil | | | | |
| Recherche | | | | |
| Fiche lieu + audio | | | | |
| Discovery | | | | |
| Favoris | | | | |
| Historique | | | | |
| Parcours | | | | |
| Génération guide | | | | |
| Guide-chat | | | | |
| Profil / settings | | | | |

Référence priorités : [`docs/ecrans.md`](../ecrans.md) P0 → P2.

## Critères d'acceptation globaux

- [ ] Tous les critères T00–T09 validés
- [ ] Aucune régression mock/demo non documentée
- [ ] Build EAS preview installable + parcours P0 complet sur staging
- [ ] Runbook déploiement documenté (URLs, secrets, rollback)

## Livrables documentation

- [ ] Mettre à jour tableau suivi dans [`README.md`](./README.md)
- [ ] Optionnel : entrée `memory/project-agent-log.md` API si accord responsable

## Tests unitaires et qualification automatisée

### Gate obligatoire avant clôture T10

- [ ] **`npm test` vert** dans `nook_api_v2` (suite complète)
- [ ] **`npm test` vert** dans `nook_app_v2` (suite complète introduite dès T00)
- [ ] Couverture minimale : chaque module `lib/api/*.ts` a son fichier `__tests__/*.test.ts`

### API — e2e (Supertest)

- [ ] Bootstrap module test + flux auth → POI → audios → discovery → favorites → itineraries → guide-chat → credits user
- [ ] Mocks HTTP externes (S3 signing, LLM, ElevenLabs) — pas d'appel réseau en CI

### App — ce qui reste manuel vs automatisé

| Domaine | Unitaire (Jest) | Manuel / E2E device |
|---------|-----------------|---------------------|
| Client HTTP / parsers | oui | — |
| Mappers DTO | oui | — |
| Contexts (sync favoris, crédits) | oui (helpers extraits) | — |
| Carte / Maps / lecteur audio natif | logique pure seulement | oui |
| Parcours UI complets | — | matrice ci-dessus |

### CI (recommandé)

- [ ] Job GitHub Actions ou EAS : `npm test` sur PR app + API
- [ ] Échec CI = tâche T10 non clôturée
