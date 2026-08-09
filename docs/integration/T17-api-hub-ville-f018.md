# T17 — API : F-018 phase 2 — hub ville

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 4–6 j |
| **Dépend de** | T15 |
| **Bloque** | T18 |
| **Priorité** | P2 — [INV-05](../mock-inventory.md) |
| **Features** | F-018-b |
| **Priorité écran** | P1 — A4.3 |

## Objectif

Implémenter `GET /api/v1/cities/:slugOrId/hub` — vitrine hub ville (héros, carte, incontournables, catégories itinéraires, premium, affiliation).

## Prérequis

- [x] T15 : module `Cities` + seed Paris/Lyon
- [x] POI publiés référençables pour `mustSeePois` / `recommendedPois`
- [x] Spec F-018 phase 2 lue (itineraries éditoriaux peuvent rester vides ou mock côté app en phase 2)

## Endpoint

| Méthode | Route | Réponse |
|---------|-------|---------|
| GET | `/api/v1/cities/:slugOrId/hub` | `CityHubResponseDto` |

### Contenu minimal MVP hub

- [x] Métadonnées ville (nom, subtitle, `coverImage`, `map` bbox)
- [x] `mustSeePois[]` — snippets POI ordonnés (réutiliser DTO POI summary)
- [x] `recommendedPois[]` (optionnel phase 2)
- [x] `itineraryCategories[]` — slugs + labels (peut être vide)
- [x] `featuredPremiumItinerary` — null OK si pas d'API éditoriale (T21)
- [x] `touristPasses[]`, `affiliateExperiences[]` — optionnel ou tableau vide

## Étapes

- [x] DTO `CityHubResponseDto` sous `src/cities/dto/`
- [x] Service : agrégation POI + relations ville (pas de N+1 — voir règle query optimization)
- [x] 404 ville absente / non publiée
- [x] Seed hub Paris aligné contenu mock actuel (must-see IDs API)
- [x] Swagger + contrat + copie app

## Critères d'acceptation

- [x] `GET /cities/paris/hub` retourne hub complet exploitable par `TerritorialHubView`
- [x] POI must-see résolus avec id/titre/coords/catégorie
- [x] `npm test` vert + e2e hub
- [ ] EXPLAIN sur requêtes hub si SQL non trivial (à valider sur DB locale après migrate/seed)

## Références

- [spec-f018-hubs-ville.md](../../../nook_api_v2/docs/spec-f018-hubs-ville.md) § `GET /cities/:slug/hub`
- [ecran-A4.3-hub-ville.md](../ecran-A4.3-hub-ville.md)
