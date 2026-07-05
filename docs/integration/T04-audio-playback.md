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

- [x] T03 : fiche lieu avec métadonnées audio API
- [x] T00 : S3/MinIO configuré (sinon 503 sur playback — géré côté UI)

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

- [x] Créer `lib/api/audios.ts` :
  - `fetchAudiosForPoi(poiId)`
  - `fetchPlaybackUrl(poiId, audioId)`
  - `postPlayEvent(poiId, payload)`
- [x] Créer `lib/api/listenHistory.ts` :
  - `fetchListenHistory(query)`
  - `postListenProgress(payload)`

### Lecteur

- [x] Refactor `hooks/useAudioPlayer.ts` :
  - Source = `playbackUrl` au lieu de `constants/demoAudio.ts`
  - Re-fetch playback si `expiresAt` dépassé
  - Support seek via Range (expo-audio + `player.replace`)
- [x] Mettre à jour `contexts/AudioPlaybackContext.tsx`
- [x] `components/place/AudioGuideList.tsx` — pistes publiques vs privées user (via `app/place/[id].tsx`, déjà câblé T03)
- [x] `components/place/AudioPlayerSheet.tsx` — métadonnées API + erreurs playback

### Engagement

- [x] Envoyer `POST play-event` à seuil d'écoute (80 %)
- [x] Si connecté : `POST listen-history` avec `progressSeconds`
- [x] Brancher `app/listen-history/index.tsx` sur API (mock conservé en session démo)

## Fichiers concernés

- `lib/api/audios.ts`, `lib/api/listenHistory.ts` (nouveau)
- `lib/audio/playbackUrl.ts`, `lib/mappers/listenHistory.ts` (nouveau)
- `hooks/useAudioPlayer.ts`, `hooks/usePlaybackEngagement.ts`, `hooks/useListenHistory.ts`
- `contexts/AudioPlaybackContext.tsx`
- `components/place/AudioPlayerSheet.tsx`
- `app/listen-history/index.tsx`

## Critères d'acceptation

- [x] Lecture audio démarre depuis URL signée réelle
- [x] Seek / reprise position fonctionne (Range)
- [x] Message UI clair si playback 503 (S3 absent)
- [x] Historique visible pour user connecté après écoute
- [x] Play-event envoyé (vérifier côté API/logs en test manuel)

## Specs écrans liées

- [`docs/ecran-A3.2-lecteur-audio.md`](../ecran-A3.2-lecteur-audio.md)

## Tests unitaires

### App

- [x] `lib/api/__tests__/audios.test.ts` :
  - parse `{ audios: [...] }` et `{ playbackUrl, expiresAt }`
  - `postPlayEvent` corps minimal (`listenPercent` ou `durationSeconds`)
- [x] `lib/api/__tests__/listenHistory.test.ts` :
  - pagination ; POST `{ audioId, poiId?, progressSeconds? }`
- [x] Extraire et tester logique pure (`lib/audio/playbackUrl.ts`) :
  - `isPlaybackUrlExpired(expiresAt)` → re-fetch si expiré
  - seuil play-event (≥ 80 % écouté) → `shouldSendPlayEvent`
- [x] `lib/mappers/__tests__/listenHistory.test.ts` (mapper historique)

### API — si touché

- [ ] `audios.service.spec.ts`, `play-events.service.spec.ts`, `listen-history.service.spec.ts` à jour — *non modifié (dépôt API inchangé)*

### Exécution

- [x] `npm test` vert dans `nook_app_v2` — **51/51**
