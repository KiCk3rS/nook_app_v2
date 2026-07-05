# T14 — App : lecteur — transcript API

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 1 j |
| **Dépend de** | T13 |
| **Bloque** | — |
| **Priorité** | P1 — [INV-03](../mock-inventory.md) |
| **Priorité écran** | P1 — A3.2 |

## Objectif

Brancher l'onglet **Contenu** du lecteur audio sur l'API transcript ; conserver `mockGuideTranscripts` uniquement en mode démo / hors API.

## Prérequis

- [ ] T13 : endpoint transcript disponible
- [ ] T04 terminée (lecteur, `useGuideTranscript` ou équivalent)

## Étapes

- [ ] Créer `lib/api/transcripts.ts` → `fetchAudioTranscript(poiId, audioId)`
- [ ] Étendre `types/api.ts` (`TranscriptSegment`)
- [ ] Refactor `lib/guideTranscript.ts` :
  - si `shouldUseMockData` → `MOCK_GUIDE_TRANSCRIPTS`
  - sinon → fetch API (hook async ou loader dans `AudioPlayerSheet`)
- [ ] États : loading, vide (« texte pas encore disponible »), erreur
- [ ] Cache mémoire optionnel par `audioId` (TTL à documenter)

## Fichiers concernés

- `lib/api/transcripts.ts` (nouveau)
- `lib/guideTranscript.ts`
- `components/place/AudioPlayerSheet.tsx`
- `hooks/useGuideTranscript.ts` (si extrait)

## Critères d'acceptation

- [ ] Guide API avec transcript seedé : surlignage phrase synchronisé en prod
- [ ] Guide sans transcript : message vide discret (spec A3.2)
- [ ] Mode démo : mock `1-a` / `2-a` inchangé
- [ ] Point de contrôle audit #3 validé sur staging
- [ ] `npm test` vert

## Tests unitaires

- [ ] `lib/api/__tests__/transcripts.test.ts` : parse segments
- [ ] `lib/guideTranscript.test.ts` : `findActiveSegmentIndex` inchangé ; resolver mock vs API

## Références

- [T13-api-transcript-audio.md](./T13-api-transcript-audio.md)
