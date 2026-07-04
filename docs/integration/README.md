# Intégration API NOOK — Tâches exécutables

Découpage du plan d'intégration [`nook_api_v2` → `nook_app_v2`](../../.cursor/plans/intégration_api_nook_6cfc7cdc.plan.md) en **11 tâches** à exécuter une par une.

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

## Parallélisation possible

- **T02** (API endpoints user) ∥ **T03, T05, T07** après T01.
- **T04** attend T03 ; **T06** attend T03 ; **T08** attend T02.
- **T09** attend T04 + T06 ; **T10** en dernier.

## Suivi d'avancement

| Tâche | Statut | Date début | Date fin | Notes |
|-------|--------|------------|----------|-------|
| T00 | ✅ terminé | 2026-07-05 | 2026-07-05 | Contrat sync, seed POI, health client, Jest app |
| T01 | ⬜ à faire | | | |
| T02 | ⬜ à faire | | | |
| T03 | ⬜ à faire | | | |
| T04 | ⬜ à faire | | | |
| T05 | ⬜ à faire | | | |
| T06 | ⬜ à faire | | | |
| T07 | ⬜ à faire | | | |
| T08 | ⬜ à faire | | | |
| T09 | ⬜ à faire | | | |
| T10 | ⬜ à faire | | | |

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

Chaque fiche **T00–T10** contient une section **Tests unitaires** avec fichiers cibles et cas à couvrir. T10 valide que les deux suites passent avant clôture.

**Principe app** : tester la logique pure et les clients API (mock `fetch`) ; éviter de tester les composants RN lourds (Maps, expo-av) en unitaire — réservés à la matrice manuelle T10.

## Hors périmètre (rester mock)

- Hubs ville / pays / quartier (pas d'endpoint API)
- Itinéraires éditoriaux NOOK (pas d'endpoint API public)
- Réinitialisation mot de passe (pas d'endpoint API)
