# T11 — API : POI détail — images signées & source Wikipedia

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T10 |
| **Bloque** | T12 |
| **Priorité** | P0 — [INV-01](../mock-inventory.md), [INV-02](../mock-inventory.md) |
| **Features** | F-006, F-015 |

## Objectif

Enrichir `GET /api/v1/pois/:id` pour que l'app affiche de vraies images et pré-remplisse l'URL Wikipedia lors de la génération guide IA — sans dépendre de `constants/mockPlaces.ts`.

## Prérequis

- [ ] T10 terminée
- [ ] Stockage S3 / signing opérationnel (déjà utilisé par discovery `coverImage` et admin POI images)
- [ ] Décision D5 validée : URLs signées sur détail public (recommandation audit : oui)

## Lacune audit

| Champ | État actuel API | Impact app |
|-------|-----------------|------------|
| `images[]` | `id`, `sortOrder`, `altText` — **sans URL** | `poiDetailToMockPlace` → `PLACE_IMAGE_PLACEHOLDER` systématique |
| `wikipediaUrl` | **Absent** du DTO public | `getPlaceWikipediaUrl` → `undefined` ; création guide IA bloquée |

## Endpoints / contrat cible

### `GET /api/v1/pois/:id` (étendre réponse existante)

- [ ] Ajouter `coverImage` (réutiliser `DiscoveryCoverImageDto` : `id`, `url`, `expiresAt`, `altText`) — image principale = première par `sortOrder`
- [ ] Ajouter `wikipediaUrl` (nullable) — source éditoriale liée au POI pour génération F-015

Option écartée pour v1 : endpoint séparé `GET /pois/:id/images/:imageId/url` — préférer cohérence discovery.

### Données

- [ ] Définir où vit `wikipediaUrl` en base (colonne POI, table sources, ou champ dérivé seed admin)
- [ ] Seed / migration : peupler `wikipediaUrl` pour POI de démo staging (alignés seed T00)

## Étapes d'implémentation

- [ ] Étendre `PoiDetailResponseDto` + mapper service (`pois.service.ts`)
- [ ] Signer URL cover via service stockage existant (pattern admin / discovery)
- [ ] Documenter TTL URL courte (aligner discovery / playback)
- [ ] Mettre à jour Swagger + `docs/api-client-reference.md`
- [ ] Resynchroniser `nook_app_v2/docs/api-client-reference.md`

## Fichiers concernés (indicatif)

- `src/pois/dto/poi-detail.response.dto.ts`
- `src/pois/pois.service.ts`
- `prisma/schema.prisma` (si nouveau champ `wikipedia_url`)
- `docs/api-client-reference.md` (API + copie app)

## Critères d'acceptation

- [ ] `GET /pois/:id` retourne `coverImage.url` signée quand image publiée et stockage configuré
- [ ] `GET /pois/:id` retourne `wikipediaUrl` pour POI seedés avec source Wikipedia
- [ ] Sans stockage configuré : `coverImage` null (pas d'erreur 500)
- [ ] Pas de régression sur `includeAudios`, children, popularité
- [ ] `npm test` vert (`pois.service.spec.ts`, controller si touché)
- [ ] Contrat app synchronisé

## Tests unitaires

### API

- [ ] `pois.service.spec.ts` :
  - détail avec images → `coverImage` signée
  - détail sans images → `coverImage` null
  - `wikipediaUrl` présent / absent selon données
- [ ] e2e : `GET /pois/:id` parse JSON avec nouveaux champs

## Références

- [mock-inventory.md §5 INV-01, INV-02](./mock-inventory.md)
- [ecran-A3.1-fiche-lieu.md](../ecran-A3.1-fiche-lieu.md)
- [ecran-A3.3-creation-guide-audio-ia.md](../ecran-A3.3-creation-guide-audio-ia.md)
