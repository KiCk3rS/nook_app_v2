# T14 — App : lecteur — transcript API

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 1 j |
| **Dépend de** | T13 |
| **Bloque** | — |
| **Priorité** | P1 — [INV-03](../mock-inventory.md) |
| **Priorité écran** | P1 — A3.2 |
| **Statut** | ✅ terminé — audit suivi 2026-08-09 |

## Objectif

Brancher l'onglet **Contenu** du lecteur audio sur l'API transcript ; conserver `mockGuideTranscripts` uniquement en mode démo / hors API.

## Prérequis

- [x] T13 : endpoint transcript disponible
- [x] T04 terminée (lecteur, `useGuideTranscript` ou équivalent)

## Étapes

- [x] Créer `lib/api/transcripts.ts` → `fetchAudioTranscript(poiId, audioId)`
- [x] Étendre `types/api.ts` (`TranscriptSegment`)
- [x] Refactor `lib/guideTranscript.ts` :
  - si `shouldUseMockData` → `MOCK_GUIDE_TRANSCRIPTS`
  - sinon → fetch API (hook async ou loader dans `AudioPlayerSheet`)
- [x] États : loading, vide (« texte pas encore disponible »), erreur
- [x] Cache mémoire optionnel par `audioId` (TTL à documenter)

## Fichiers concernés

- `lib/api/transcripts.ts` (nouveau)
- `lib/guideTranscript.ts`
- `components/place/AudioPlayerSheet.tsx`
- `hooks/useGuideTranscript.ts` (si extrait)

## Critères d'acceptation

- [x] Guide API avec transcript seedé : surlignage phrase synchronisé en prod
- [x] Guide sans transcript : message vide discret (spec A3.2)
- [x] Mode démo : mock `1-a` / `2-a` inchangé
- [x] Point de contrôle audit #3 validé sur staging
- [x] `npm test` vert

## Tests unitaires

- [x] `lib/api/__tests__/transcripts.test.ts` : parse segments
- [x] `lib/guideTranscript.test.ts` : `findActiveSegmentIndex` inchangé ; resolver mock vs API

## Références

- [T13-api-transcript-audio.md](./T13-api-transcript-audio.md)
