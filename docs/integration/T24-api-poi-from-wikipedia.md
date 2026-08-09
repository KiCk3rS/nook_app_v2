# T24 — API : création POI depuis Wikipedia (admin)

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 2–3 j |
| **Dépend de** | T23, T11 (`wikipediaUrl` en base / contrat détail) |
| **Bloque** | T25 |
| **Priorité** | Admin |
| **Features** | F-014, F-015 |
| **Statut** | ✅ terminé |

## Objectif

Permettre à un admin de **créer un POI** à partir d’une URL Wikipedia sélectionnée : titre canonique, extrait, coordonnées si disponibles, et persistance de `wikipediaUrl` pour la génération audio ultérieure.

## Prérequis

- [x] T23 : recherche admin opérationnelle (source d’URL)
- [x] T11 : décision / colonne `wikipediaUrl` (ou équivalent) sur POI + exposition `GET /pois/:id` — **si T11 incomplete**, livrer dans T24 la **persistance** admin + migration, et laisser l’exposition publique à T11
- [x] `POST /api/v1/admin/pois` + `AdminPoisService.create` existants
- [x] `MediaWikiClient.fetchArticleFromWikipediaUrl` existant

## Endpoint

| Méthode | Route | Auth | Codes |
|---------|-------|------|-------|
| POST | `/api/v1/admin/pois/from-wikipedia` | JWT `ADMIN` | 201 ; 401 ; 403 ; 422 ; 503 |

### Corps

```json
{
  "wikipediaUrl": "https://fr.wikipedia.org/wiki/Tour_Eiffel",
  "status": "DRAFT",
  "categoryIds": [],
  "lat": null,
  "lng": null
}
```

| Champ | Règle |
|-------|--------|
| `wikipediaUrl` | Requis ; même validation que F-015 (`https://{lang}.wikipedia.org/wiki/...`) |
| `status` | Optionnel ; défaut `DRAFT` |
| `categoryIds` | Optionnel ; mêmes règles que create admin |
| `lat` / `lng` | Optionnels **ensemble** ; si fournis, **override** les coords MediaWiki |

### Comportement

1. Fetch article MediaWiki : extract + **coordinates** (`prop=coordinates` ou équivalent).
2. Créer POI : `title` = titre canonique ; `description` = extrait tronqué (limite DTO existante) ; `location` si coords disponibles (MediaWiki ou override) ; `wikipediaUrl` persisté.
3. Réponse : réutiliser / aligner `AdminPoiResponseDto` (+ `wikipediaUrl` si pas déjà dessus).
4. Article introuvable / extract vide → `422` (même esprit que génération audio).
5. Sans coords MediaWiki et sans override → POI **sans** géométrie ; réponse avec signal clair (`lat`/`lng` absents ou flag documenté).

## Étapes d’implémentation

- [x] Migration / schéma : champ `wikipediaUrl` sur `Poi` si absent (coordonner T11 — une seule source de vérité)
- [x] Étendre `MediaWikiClient` : coords + éventuellement pageid déjà partiellement couvert
- [x] `CreatePoiFromWikipediaDto` + validation
- [x] `AdminPoisService.createFromWikipedia(dto)` (réutilise create interne)
- [x] Route sur `AdminPoisController` (attention ordre des routes : `from-wikipedia` avant `:id`)
- [x] Étendre `CreateAdminPoiDto` / update si besoin pour accepter `wikipediaUrl` aussi en create classique
- [x] Swagger + `api-client-reference.md` (+ sync app)
- [x] Seed / cas de test Tour Eiffel avec coords

## Fichiers concernés (indicatif)

- `prisma/schema.prisma` (+ migration)
- `src/audio-generation/adapters/mediawiki.client.ts`
- `src/pois/admin-pois.controller.ts`, `admin-pois.service.ts`
- `src/pois/dto/create-poi-from-wikipedia.dto.ts` (nom indicatif)
- `src/pois/dto/admin-poi-response.dto.ts`
- `docs/api-client-reference.md`

## Critères d’acceptation

- [x] `POST /admin/pois/from-wikipedia` avec URL valide → 201, titre renseigné, `wikipediaUrl` stocké
- [x] Article géolocalisé (ex. Tour Eiffel) → `lat`/`lng` présents sans override
- [x] Override `lat`/`lng` prioritaire sur MediaWiki
- [x] Article sans coords → 201 sans géométrie (pas 422 pour cette seule raison)
- [x] JWT non admin → 403
- [x] URL invalide / page manquante → 422
- [x] `npm test` vert ; e2e admin si suite existante
- [x] Contrat synchronisé ; pas de régression `POST /admin/pois`

## Tests unitaires

- [x] `mediawiki.client.spec.ts` : extract + coordinates présentes / absentes
- [x] `admin-pois.service.spec.ts` :
  - création depuis wiki avec coords
  - sans coords
  - override lat/lng
  - propagation `wikipediaUrl`
- [x] Validation DTO (URL, paire lat/lng)

## Références

- [T11](./T11-api-poi-media-sources.md) — exposition publique `wikipediaUrl`
- [T23](./T23-api-wikipedia-search.md)
- [T25](./T25-app-admin-wikipedia-poi.md)
- `CreateAdminPoiDto` : `src/pois/dto/create-admin-poi.dto.ts`
- F-015 : `GenerateAudioGuideDto.wikipediaUrl`
