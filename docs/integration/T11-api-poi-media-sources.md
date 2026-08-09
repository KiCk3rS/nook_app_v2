# T11 — API : POI détail — images signées & source Wikipedia

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T10 |
| **Bloque** | T12 |
| **Priorité** | P0 — [INV-01](../mock-inventory.md), [INV-02](../mock-inventory.md) |
| **Features** | F-006, F-015 |
| **Statut** | ✅ terminé — audit suivi 2026-08-09 (`pois.service` + DTO détail) |

## Objectif

Enrichir `GET /api/v1/pois/:id` pour que l'app affiche de vraies images et pré-remplisse l'URL Wikipedia lors de la génération guide IA — sans dépendre de `constants/mockPlaces.ts`.

## Prérequis

- [x] T10 terminée
- [x] Stockage S3 / signing opérationnel (déjà utilisé par discovery `coverImage` et admin POI images)
- [x] Décision D5 validée : URLs signées sur détail public (recommandation audit : oui)

## Lacune audit (historique — comblée)

| Champ | État API (après T11) | Impact app |
|-------|----------------------|------------|
| `images[]` / cover | `coverImage` signée sur détail (ou `null`) | Fiche lieu via T12 |
| `wikipediaUrl` | Présent (nullable) sur DTO public | Préremplissage génération F-015 |

## Endpoints / contrat cible

### `GET /api/v1/pois/:id` (étendre réponse existante)

- [x] Ajouter `coverImage` (réutiliser `DiscoveryCoverImageDto` : `id`, `url`, `expiresAt`, `altText`) — image principale = première par `sortOrder`
- [x] Ajouter `wikipediaUrl` (nullable) — source éditoriale liée au POI pour génération F-015

Option écartée pour v1 : endpoint séparé `GET /pois/:id/images/:imageId/url` — préférer cohérence discovery.

### Données

- [x] Définir où vit `wikipediaUrl` en base (colonne POI, table sources, ou champ dérivé seed admin)
- [x] Seed / migration : peupler `wikipediaUrl` pour POI de démo staging (alignés seed T00)

## Étapes d'implémentation

- [x] Étendre `PoiDetailResponseDto` + mapper service (`pois.service.ts`)
- [x] Signer URL cover via service stockage existant (pattern admin / discovery)
- [x] Documenter TTL URL courte (aligner discovery / playback)
- [x] Mettre à jour Swagger + `docs/api-client-reference.md`
- [x] Resynchroniser `nook_app_v2/docs/api-client-reference.md`

## Fichiers concernés (indicatif)

- `src/pois/dto/poi-detail.response.dto.ts`
- `src/pois/pois.service.ts`
- `prisma/schema.prisma` (si nouveau champ `wikipedia_url`)
- `docs/api-client-reference.md` (API + copie app)

## Critères d'acceptation

- [x] `GET /pois/:id` retourne `coverImage.url` signée quand image publiée et stockage configuré
- [x] `GET /pois/:id` retourne `wikipediaUrl` pour POI seedés avec source Wikipedia
- [x] Sans stockage configuré : `coverImage` null (pas d'erreur 500)
- [x] Pas de régression sur `includeAudios`, children, popularité
- [x] `npm test` vert (`pois.service.spec.ts`, controller si touché)
- [x] Contrat app synchronisé

## Tests unitaires

### API

- [x] `pois.service.spec.ts` :
  - détail avec images → `coverImage` signée
  - détail sans images → `coverImage` null
  - `wikipediaUrl` présent / absent selon données
- [x] e2e : `GET /pois/:id` parse JSON avec nouveaux champs

## Références

- [mock-inventory.md §5 INV-01, INV-02](./mock-inventory.md)
- [ecran-A3.1-fiche-lieu.md](../ecran-A3.1-fiche-lieu.md)
- [ecran-A3.3-creation-guide-audio-ia.md](../ecran-A3.3-creation-guide-audio-ia.md)
