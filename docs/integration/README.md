# Intégration API NOOK — Tâches exécutables

Découpage du plan d'intégration [`nook_api_v2` → `nook_app_v2`](../../.cursor/plans/intégration_api_nook_6cfc7cdc.plan.md) en **11 tâches** (T00–T10), puis **11 tâches post-audit mock** (T11–T21) dérivées de [mock-inventory.md](./mock-inventory.md), puis **5 tâches admin Wikipedia → POI → audio** (T22–T26).

## Comment utiliser ce dossier

1. Lire la tâche courante (fichier `.md` numéroté).
2. Vérifier les **prérequis** et marquer la tâche `en cours` dans le tableau ci-dessous.
3. Cocher les **étapes** et **critères d'acceptation** dans le fichier.
4. Passer à la tâche suivante uniquement quand tous les critères sont remplis.

## Ordre recommandé

| # | Fichier | Dépôt | Durée estimée | Dépend de |
|---|---------|-------|---------------|-----------|
| 0 | [T00-alignement-contrat.md](./T00-alignement-contrat.md) | API + App | 1–2 j | — |
| 1 | [T01-client-http.md](./T01-client-http.md) | App | 1 j | T00 |
| 2 | [T02-api-endpoints-user.md](./T02-api-endpoints-user.md) | API | 3–5 j | T00, T01 |
| 3 | [T03-poi-catalogue.md](./T03-poi-catalogue.md) | App | 4–6 j | T01 |
| 4 | [T04-audio-playback.md](./T04-audio-playback.md) | App | 3–4 j | T00, T03 |
| 5 | [T05-discovery.md](./T05-discovery.md) | App | 2–3 j | T03 |
| 6 | [T06-favoris.md](./T06-favoris.md) | App | 2 j | T03 |
| 7 | [T07-itineraires.md](./T07-itineraires.md) | App | 2–3 j | T01 |
| 8 | [T08-credits-guide-ia.md](./T08-credits-guide-ia.md) | App | 2 j | T02 |
| 9 | [T09-auth-ux-degrade.md](./T09-auth-ux-degrade.md) | App | 1–2 j | T04, T06 |
| 10 | [T10-qa-production.md](./T10-qa-production.md) | API + App | 2–3 j | T02–T09 |

### Post-T10 — fermeture des mocks (audit 2026-07-05)

| # | Fichier | Dépôt | Durée | Dépend de | P |
|---|---------|-------|-------|-----------|---|
| 11 | [T11-api-poi-media-sources.md](./T11-api-poi-media-sources.md) | API | 2–3 j | T10 | P0 |
| 12 | [T12-app-poi-media-sources.md](./T12-app-poi-media-sources.md) | App | 1–2 j | T11 | P0 |
| 13 | [T13-api-transcript-audio.md](./T13-api-transcript-audio.md) | API | 2–3 j | T10 | P1 |
| 14 | [T14-app-transcript-audio.md](./T14-app-transcript-audio.md) | App | 1 j | T13 | P1 |
| 15 | [T15-api-cities-f018-phase1.md](./T15-api-cities-f018-phase1.md) | API | 3–5 j | T10 | P1 |
| 16 | [T16-app-cities-recherche.md](./T16-app-cities-recherche.md) | App | 2–3 j | T15 | P1 |
| 17 | [T17-api-hub-ville-f018.md](./T17-api-hub-ville-f018.md) | API | 4–6 j | T15 | P2 |
| 18 | [T18-app-hub-ville.md](./T18-app-hub-ville.md) | App | 3–4 j | T16, T17 | P2 |
| 19 | [T19-hubs-quartier-f018.md](./T19-hubs-quartier-f018.md) | API + App | 3–5 j | T18 | P2 |
| 20 | [T20-app-profil-residus.md](./T20-app-profil-residus.md) | App (+ API mineure) | 2–3 j | T07, T12 | P2 |
| 21 | [T21-backlog-p3.md](./T21-backlog-p3.md) | API + App | epic | T10, décision produit | P3 |

### Admin — Wikipedia → POI → Audio (T22–T26)

Flux opérationnel mobile pour un compte `role: ADMIN` : recherche Wikipedia (proxy API) → création POI → génération audio éditoriale (F-015). Documentation uniquement au départ ; implémentation tâche par tâche.

| # | Fichier | Dépôt | Durée | Dépend de | P |
|---|---------|-------|-------|-----------|---|
| 22 | [T22-spec-ecran-admin-wikipedia-poi.md](./T22-spec-ecran-admin-wikipedia-poi.md) | App (docs) | 0,5–1 j | — | Admin |
| 23 | [T23-api-wikipedia-search.md](./T23-api-wikipedia-search.md) | API | 1–2 j | T22 | Admin |
| 24 | [T24-api-poi-from-wikipedia.md](./T24-api-poi-from-wikipedia.md) | API | 2–3 j | T23, T11 | Admin |
| 25 | [T25-app-admin-wikipedia-poi.md](./T25-app-admin-wikipedia-poi.md) | App | 2–3 j | T22, T23, T24 | Admin |
| 26 | [T26-app-admin-audio-guide.md](./T26-app-admin-audio-guide.md) | App | 1–2 j | T25, T11/T12 | Admin |

## Parallélisation possible

- **T02** (API endpoints user) ∥ **T03, T05, T07** après T01.
- **T04** attend T03 ; **T06** attend T03 ; **T08** attend T02.
- **T09** attend T04 + T06 ; **T10** en dernier.

**Post-T10 :**

- **T11** ∥ **T13** ∥ **T15** après T10 (P0/P1 indépendants).
- **T12** attend T11 ; **T14** attend T13 ; **T16** attend T15.
- **T17** attend T15 ; **T18** attend T16 + T17.
- **T19** attend T18 ; **T20** peut démarrer après **T12** (en parallèle de F-018).
- **T21** : bloqué décisions produit D2/D3.

**Admin Wikipedia → POI → Audio :**

- **T22** (spec) en premier ; puis **T23** (search API).
- **T11** (persistance / exposition `wikipediaUrl`) doit être prêt avant ou pendant **T24**.
- **T24** attend T23 (+ T11) ; **T25** attend T22–T24 ; **T26** attend T25 (+ T11/T12 pour la fiche).

## Suivi d'avancement

| Tâche | Statut | Date début | Date fin | Notes |
|-------|--------|------------|----------|-------|
| T00 | ✅ terminé | 2026-07-05 | 2026-07-05 | Contrat sync, seed POI, health client, Jest app |
| T01 | ✅ terminé | 2026-07-05 | 2026-07-05 | Client HTTP, refresh proactif, SecureStore prod |
| T02 | ✅ terminé | 2026-07-05 | 2026-07-05 | Endpoints /me/credits, génération audio user, tests Jest 178/178 |
| T03 | ✅ terminé | 2026-07-05 | 2026-07-05 | POI carte/recherche/fiche, mappers, hooks, tests 35/35 |
| T04 | ✅ terminé | 2026-07-05 | 2026-07-05 | Playback URL signée, play-event, listen-history, tests 51/51 |
| T05 | ✅ terminé | 2026-07-05 | 2026-07-05 | Discovery API (3 sections), pagination offset, fallback mock, tests 63/63 |
| T06 | ✅ terminé | 2026-07-05 | 2026-07-05 | Favoris API (GET/POST/DELETE), sync login, FavoritesContext, rollback optimiste, tests 103/103 |
| T07 | ✅ terminé | 2026-07-05 | 2026-07-05 | Client parcours user : pagination, CRUD, guidage steps API |
| T08 | ✅ terminé | 2026-07-05 | 2026-07-05 | Crédits/génération API, `generateAudioGuideAndAwaitJob`, guide-chat `credits.balance`, mappers, tests 91/91 |
| T09 | ✅ terminé | 2026-07-05 | 2026-07-05 | Auth/démo sans fallback silencieux, health + mode limité, stats profil API, tests 131/131 |
| T10 | ✅ terminé | 2026-07-05 | 2026-07-05 | E2E Supertest API, CI GH Actions, runbook, eas.json, me.test.ts — API 178u+28e2e, App 137u |
| T11 | ⬜ à faire | | | POI `coverImage` + `wikipediaUrl` — API |
| T12 | ⬜ à faire | | | POI média & Wikipedia — App |
| T13 | ⬜ à faire | | | Transcript audio — API |
| T14 | ⬜ à faire | | | Transcript — App |
| T15 | ⬜ à faire | | | F-018 `GET /cities` |
| T16 | ⬜ à faire | | | Villes recherche & discovery — App |
| T17 | ⬜ à faire | | | F-018 hub ville — API |
| T18 | ⬜ à faire | | | Hub ville A4.3 — App |
| T19 | ⬜ à faire | | | Hubs quartier A4.5 |
| T20 | ⬜ à faire | | | Profil & résidus hybrides |
| T21 | ⏸️ bloqué | | | Backlog P3 — décision produit |
| T22 | ⬜ à faire | | | Spec écran flux admin Wikipedia → POI → audio |
| T23 | ⬜ à faire | | | API recherche Wikipedia admin |
| T24 | ⬜ à faire | | | API création POI depuis Wikipedia |
| T25 | ⬜ à faire | | | App UI recherche + création POI admin |
| T26 | ⬜ à faire | | | App génération audio admin + suivi job |

Légende statut : ⬜ à faire · 🔄 en cours · ✅ terminé · ⏸️ bloqué

## Références

- Contrat HTTP API : [`nook_api_v2/docs/api-client-reference.md`](../../../nook_api_v2/docs/api-client-reference.md)
- Copie app (à synchroniser) : [`docs/api-client-reference.md`](../api-client-reference.md)
- Specs écrans : [`docs/ecrans.md`](../ecrans.md)
- Swagger : `{API_BASE_URL}/api/docs`

## Stratégie tests unitaires

| Dépôt | Framework | Commande | Règle |
|-------|-----------|----------|-------|
| **nook_api_v2** | Jest + ts-jest (existant) | `npm test` | Obligatoire pour tout code sous `src/` — voir `nook-api-tests-per-feature` |
| **nook_app_v2** | Jest + jest-expo (à installer en **T00**) | `npm test` | Obligatoire pour `lib/api/*`, mappers, helpers purs ; contexts via helpers extraits |

Chaque fiche **T00–T26** (hors T22 purement docs) contient une section **Tests unitaires** avec fichiers cibles et cas à couvrir lorsque du code est prévu. T10 valide que les deux suites passent avant clôture de la phase intégration initiale.

**Principe app** : tester la logique pure et les clients API (mock `fetch`) ; éviter de tester les composants RN lourds (Maps, expo-av) en unitaire — réservés à la matrice manuelle T10.

## Post-T10 : mocks restants

Audit documentaire réalisé le **2026-07-05** : [mock-inventory.md](./mock-inventory.md).

**Synthèse (mode prod, API branchée, session réelle) :**

| Priorité | Lacune | Tâche(s) |
|----------|--------|----------|
| P0 | `wikipediaUrl` + images POI | [T11](./T11-api-poi-media-sources.md), [T12](./T12-app-poi-media-sources.md) |
| P1 | Transcript lecteur audio | [T13](./T13-api-transcript-audio.md), [T14](./T14-app-transcript-audio.md) |
| P1 | Villes recherche / discovery | [T15](./T15-api-cities-f018-phase1.md), [T16](./T16-app-cities-recherche.md) |
| P2 | Hubs ville / quartier | [T17](./T17-api-hub-ville-f018.md) → [T19](./T19-hubs-quartier-f018.md) |
| P2 | Profil & résidus hybrides | [T20](./T20-app-profil-residus.md) |
| P3 | Éditorial, reset MDP, IAP | [T21](./T21-backlog-p3.md) ⏸️ |

**Conservés volontairement :** session démo (`shouldUseMockData`), fallback `!isApiConfigured()`, mocks Jest.

## Hors périmètre (rester mock jusqu’à F-018)

- Hubs ville / pays / quartier — spec [F-018](../../../nook_api_v2/docs/spec-f018-hubs-ville.md) (non implémenté API)
- Itinéraires éditoriaux NOOK (pas d'endpoint API public)
- Réinitialisation mot de passe (pas d'endpoint API)

Voir le détail et la matrice complète dans [mock-inventory.md](./mock-inventory.md).
