# T04 — Audio : lecture réelle et engagement

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 3–4 j |
| **Dépend de** | T00 (S3), T03 |
| **Bloque** | T09 |
| **Priorité écran** | P0 — A3.2 |

## Objectif

Lire les guides via URLs signées S3 (HTTP Range), remplacer le MP3 demo, enregistrer play-events et historique d'écoute.

## Prérequis

- [ ] T03 : fiche lieu avec métadonnées audio API
- [ ] T00 : S3/MinIO configuré (sinon 503 sur playback)

## Endpoints

| Méthode | Route | Auth |
|---------|-------|------|
| GET | `/api/v1/pois/:poiId/audios` | none |
| GET | `/api/v1/pois/:poiId/audios/:audioId/playback` | none |
| POST | `/api/v1/pois/:id/play-event` | optional Bearer |
| GET | `/api/v1/me/listen-history` | Bearer |
| POST | `/api/v1/me/listen-history` | Bearer |

## Étapes

### Modules API client

- [ ] Créer `lib/api/audios.ts` :
  - `fetchAudiosForPoi(poiId)`
  - `fetchPlaybackUrl(poiId, audioId)`
  - `postPlayEvent(poiId, payload)`
- [ ] Créer `lib/api/listenHistory.ts` :
  - `fetchListenHistory(query)`
  - `postListenProgress(payload)`

### Lecteur

- [ ] Refactor `hooks/useAudioPlayer.ts` :
  - Source = `playbackUrl` au lieu de `constants/demoAudio.ts`
  - Re-fetch playback si `expiresAt` dépassé
  - Support seek via Range (expo-av / react-native-track-player selon stack actuelle)
- [ ] Mettre à jour `contexts/AudioPlaybackContext.tsx`
- [ ] `components/place/AudioGuideList.tsx` — pistes publiques vs privées user
- [ ] `components/place/AudioPlayerSheet.tsx` — métadonnées API

### Engagement

- [ ] Envoyer `POST play-event` à seuil d'écoute (ex. 80 % ou fin)
- [ ] Si connecté : `POST listen-history` avec `progressSeconds`
- [ ] Brancher `app/listen-history/index.tsx` sur API (remplacer mock/vide)

## Fichiers concernés

- `lib/api/audios.ts`, `lib/api/listenHistory.ts` (nouveau)
- `hooks/useAudioPlayer.ts`, `contexts/AudioPlaybackContext.tsx`
- `components/place/AudioGuideList.tsx`, `AudioPlayerSheet.tsx`
- `app/listen-history/index.tsx`

## Critères d'acceptation

- [ ] Lecture audio démarre depuis URL signée réelle
- [ ] Seek / reprise position fonctionne (Range)
- [ ] Message UI clair si playback 503 (S3 absent)
- [ ] Historique visible pour user connecté après écoute
- [ ] Play-event envoyé (vérifier côté API/logs)

## Specs écrans liées

- [`docs/ecran-A3.2-lecteur-audio.md`](../ecran-A3.2-lecteur-audio.md)

## Tests unitaires

### App

- [ ] `lib/api/__tests__/audios.test.ts` :
  - parse `{ audios: [...] }` et `{ playbackUrl, expiresAt }`
  - `postPlayEvent` corps minimal (`listenPercent` ou `durationSeconds`)
- [ ] `lib/api/__tests__/listenHistory.test.ts` :
  - pagination ; POST `{ audioId, poiId?, progressSeconds? }`
- [ ] Extraire et tester logique pure (ex. `lib/audio/playbackUrl.ts`) :
  - `isPlaybackUrlExpired(expiresAt)` → re-fetch si expiré
  - seuil play-event (ex. ≥ 80 % écouté) → booléen `shouldSendPlayEvent`
- [ ] `hooks/__tests__/useAudioPlayer.test.ts` (logique extraite, pas le hook RN entier si trop lourd)

### API — si touché

- [ ] `audios.service.spec.ts`, `play-events.service.spec.ts`, `listen-history.service.spec.ts` à jour

### Exécution

- [ ] `npm test` vert dans `nook_app_v2` (+ API si modifiée)
