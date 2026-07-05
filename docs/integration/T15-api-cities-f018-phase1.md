# T15 — API : F-018 phase 1 — liste & recherche villes

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 3–5 j |
| **Dépend de** | T10 |
| **Bloque** | T16, T17 |
| **Priorité** | P1 — [INV-04](../mock-inventory.md) |
| **Features** | F-018-a |

## Objectif

Implémenter `GET /api/v1/cities` pour remplacer `mockCities` dans la recherche, les villes promues/populaires et les liens discovery — **sans** le hub complet (phase 2, T17).

## Prérequis

- [ ] T10 terminée
- [ ] Décision D1 validée (F-018 : oui)
- [ ] Spec lue : [`nook_api_v2/docs/spec-f018-hubs-ville.md`](../../../nook_api_v2/docs/spec-f018-hubs-ville.md)

## Endpoint

| Méthode | Route | Query | Usage app |
|---------|-------|-------|-----------|
| GET | `/api/v1/cities` | `q`, `promoted`, `popular`, `limit`, `offset` | A2.1 recherche, A4.1 cartes villes |

### Réponse item (minimal phase 1)

- `id`, `slug`, `name`, `subtitle` (optionnel), `coverImage` (signed URL)
- Compteurs optionnels : `poiCount`, `editorialItineraryCount` (stub 0 OK)

## Étapes d'implémentation

- [ ] `CitiesModule` : Prisma model `City`, migration, seed Paris + Lyon
- [ ] `cities.controller.ts` + `cities.service.ts` + DTOs
- [ ] Filtres `promoted=true`, `popular=true`, recherche `q` (index adapté)
- [ ] Tri déterministe (`..., id ASC`)
- [ ] Admin CRUD villes (optionnel phase 1 — peut réutiliser spec admin F-018)
- [ ] Swagger + contrat + copie app

## Critères d'acceptation

- [ ] `GET /cities?promoted=true&limit=5` retourne villes seedées
- [ ] `GET /cities?q=par` recherche par nom/slug
- [ ] Pagination `limit`/`offset` + `total`
- [ ] `npm test` vert (`cities.service.spec.ts`, e2e)
- [ ] Contrat synchronisé app

## Tests unitaires

- [ ] Filtres promoted / popular / q
- [ ] Pagination stable
- [ ] Ville non publiée exclue des listes publiques

## Références

- [spec-f018-hubs-ville.md](../../../nook_api_v2/docs/spec-f018-hubs-ville.md) § `GET /cities`
- [mock-inventory.md §6 D1](./mock-inventory.md)
