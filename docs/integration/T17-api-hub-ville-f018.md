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

- [ ] T15 : module `Cities` + seed Paris/Lyon
- [ ] POI publiés référençables pour `mustSeePois` / `recommendedPois`
- [ ] Spec F-018 phase 2 lue (itineraries éditoriaux peuvent rester vides ou mock côté app en phase 2)

## Endpoint

| Méthode | Route | Réponse |
|---------|-------|---------|
| GET | `/api/v1/cities/:slugOrId/hub` | `CityHubResponseDto` |

### Contenu minimal MVP hub

- [ ] Métadonnées ville (nom, subtitle, `coverImage`, `map` bbox)
- [ ] `mustSeePois[]` — snippets POI ordonnés (réutiliser DTO POI summary)
- [ ] `recommendedPois[]` (optionnel phase 2)
- [ ] `itineraryCategories[]` — slugs + labels (peut être vide)
- [ ] `featuredPremiumItinerary` — null OK si pas d'API éditoriale (T21)
- [ ] `touristPasses[]`, `affiliateExperiences[]` — optionnel ou tableau vide

## Étapes

- [ ] DTO `CityHubResponseDto` sous `src/cities/dto/`
- [ ] Service : agrégation POI + relations ville (pas de N+1 — voir règle query optimization)
- [ ] 404 ville absente / non publiée
- [ ] Seed hub Paris aligné contenu mock actuel (must-see IDs API)
- [ ] Swagger + contrat + copie app

## Critères d'acceptation

- [ ] `GET /cities/paris/hub` retourne hub complet exploitable par `TerritorialHubView`
- [ ] POI must-see résolus avec id/titre/coords/catégorie
- [ ] `npm test` vert + e2e hub
- [ ] EXPLAIN sur requêtes hub si SQL non trivial

## Références

- [spec-f018-hubs-ville.md](../../../nook_api_v2/docs/spec-f018-hubs-ville.md) § `GET /cities/:slug/hub`
- [ecran-A4.3-hub-ville.md](../ecran-A4.3-hub-ville.md)
