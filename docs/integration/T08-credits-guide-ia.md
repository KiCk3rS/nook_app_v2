# T08 — Crédits, génération guide IA, guide-chat

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 2 j |
| **Dépend de** | T02 (API user endpoints) |
| **Priorité écran** | P1 — A3.3, A7.x, A8.4 |

## Objectif

Brancher l'app sur les endpoints crédits/génération audio **réels** (T02) ; finaliser guide-chat production.

## Prérequis

- [ ] **T02 terminée** — routes `/me/credits`, `/me/pois/:id/audio-guides/*`, jobs user
- [ ] Guide-chat déjà partiellement branché

## Étapes

### Crédits et génération audio

- [ ] `lib/api/audioGuides.ts` :
  - Désactiver mock layer pour sessions réelles (`!demoSession && isApiConfigured()`)
  - Ajouter `fetchAudioGuideJob(jobId)` → `GET /me/audio-guides/jobs/:jobId`
  - Polling explicite job jusqu'à statut terminal
- [ ] `contexts/CreditsContext.tsx` — solde depuis `GET /me/credits`
- [ ] `components/place/CreateGuideSheet.tsx` — flux 202 + polling job
- [ ] `app/place/[id].tsx` — guides privés depuis API

### Guide-chat (finalisation)

- [ ] `hooks/useGuideChat.ts` — afficher `credits.balance` depuis GET messages
- [ ] Gérer UI pour :
  - `402` `GUIDE_CHAT_INSUFFICIENT_CREDITS`
  - `422` `GUIDE_CHAT_NO_SOURCES`
  - `429` rate limit
- [ ] Conserver fallback mock uniquement si `!isApiConfigured()` ou session demo explicite

## Fichiers concernés

- `lib/api/audioGuides.ts`, `lib/mockAudioGuideCreation.ts`
- `contexts/CreditsContext.tsx`
- `hooks/useGuideChat.ts`, `lib/mockGuideChat.ts`
- `components/place/CreateGuideSheet.tsx`

## Critères d'acceptation

- [ ] Solde crédits affiché correspond à l'API
- [ ] Génération guide lance job ; UI progresse jusqu'à guide disponible
- [ ] Guide privé visible uniquement pour l'auteur
- [ ] Guide-chat : message 402/422 compréhensible pour l'utilisateur
- [ ] Mock demo toujours disponible via bouton explicite

## Specs écrans liées

- [`docs/ecran-A3.3-creation-guide-audio-ia.md`](../ecran-A3.3-creation-guide-audio-ia.md)
- [`docs/ecran-A8.4-pack-credits.md`](../ecran-A8.4-pack-credits.md)

## Tests unitaires

### App

- [ ] `lib/api/__tests__/audioGuides.test.ts` :
  - `useMockAudioGuideLayer` false quand API + session réelle
  - `fetchAudioGuideJob` parse statuts terminal / en cours
  - polling s'arrête sur `COMPLETED` / `FAILED` (helper pur extrait)
- [ ] `lib/api/__tests__/guideChat.test.ts` :
  - parse `credits.balance` dans réponse GET
  - mappe `ApiError.code` 402 / 422 vers messages UI (helper pur)
- [ ] `contexts/__tests__/creditsContext.test.tsx` ou test helper :
  - refresh solde après génération / achat mock API

### API — si T02 pas encore couvert

- [ ] Voir tests T02 ; compléter cas guide-chat crédits liés si logique partagée

### Exécution

- [ ] `npm test` vert dans `nook_app_v2` et `nook_api_v2`
