# T13 — API : transcript audio synchronisé

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T10 |
| **Bloque** | T14 |
| **Priorité** | P1 — [INV-03](../mock-inventory.md) |
| **Features** | F-007, F-016 (lecteur A3.2) |

## Objectif

Exposer les segments horodatés (paroles synchronisées) d'un guide audio pour remplacer `constants/mockGuideTranscripts.ts` en production.

## Prérequis

- [ ] T10 terminée
- [ ] Décision D4 : auth requise ou public si guide public (recommandation : aligner politique playback F-007)
- [ ] Source de vérité transcript définie (table dédiée, champ JSON sur `AudioTrack`, ou génération à la volée)

## Endpoint cible

| Méthode | Route | Auth | Réponse |
|---------|-------|------|---------|
| GET | `/api/v1/pois/:poiId/audios/:audioId/transcript` | none ou Bearer? | `{ segments: [{ id, startMs, endMs, text }] }` |

Alternative acceptable : `GET /api/v1/audios/:audioId/transcript` si POI-scoping inutile.

## Étapes d'implémentation

- [ ] Modèle de données + migration Prisma (si nécessaire)
- [ ] Seed transcripts pour 2+ guides de démo staging (remplacer mock `1-a`, `2-a`)
- [ ] Controller + service + DTO (`TranscriptSegmentDto`)
- [ ] 404 si guide absent / non publié ; 200 avec `segments: []` si pas encore transcrit (à trancher produit)
- [ ] Swagger + `docs/api-client-reference.md` + copie app

## Critères d'acceptation

- [ ] Endpoint documenté et testé e2e
- [ ] Segments ordonnés par `startMs` ; pas de chevauchement non géré côté client
- [ ] Guide non publié → 404
- [ ] `npm test` vert

## Tests unitaires

- [ ] `*.service.spec.ts` : mapping segments, POI/audio introuvable, liste vide
- [ ] e2e Supertest : GET transcript sur guide seedé

## Références

- [ecran-A3.2-lecteur-audio.md](../ecran-A3.2-lecteur-audio.md) § Contrat transcript
- [mock-inventory.md §4 point #3](./mock-inventory.md)
