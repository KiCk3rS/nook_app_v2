# T23 — API : recherche Wikipedia (admin)

| | |
|---|---|
| **Dépôt** | `nook_api_v2` |
| **Durée** | 1–2 j |
| **Dépend de** | T22 (cadrage) |
| **Bloque** | T24, T25 |
| **Priorité** | Admin |
| **Features** | F-014 (acquisition source), MediaWiki |
| **Statut** | ✅ terminé |

## Objectif

Exposer un endpoint admin qui **proxy** la recherche Wikipedia (MediaWiki `opensearch` / équivalent), afin que l’app mobile ne parle jamais directement à Wikipedia (User-Agent, timeouts, auth, rate-limit).

## Prérequis

- [x] T22 lue (contrats UX résultats)
- [x] [`MediaWikiClient`](../../../nook_api_v2/src/mediawiki/mediawiki.client.ts) existant (fetch article par URL)
- [x] Pattern guards admin : `AuthGuard('jwt')` + `RolesGuard` + `@Roles(UserRole.ADMIN)`

## Endpoint

| Méthode | Route | Query | Auth |
|---------|-------|-------|------|
| GET | `/api/v1/admin/wikipedia/search` | `q` (requis), `lang` (défaut `fr`), `limit` (défaut 10, max 20) | JWT `ADMIN` |

### Réponse item

```json
{
  "items": [
    {
      "title": "Tour Eiffel",
      "wikipediaUrl": "https://fr.wikipedia.org/wiki/Tour_Eiffel",
      "description": "Monument parisien…",
      "thumbnailUrl": null
    }
  ]
}
```

- `description` / `thumbnailUrl` : optionnels selon capacités opensearch / query ; `null` si absent.
- Tri : ordre renvoyé par MediaWiki (pas de re-tri inventé).
- `q` vide ou moins de 2 caractères → `422`.

## Étapes d’implémentation

- [x] Étendre `MediaWikiClient` : `searchArticles({ language, query, limit })`
- [x] Module / controller admin Wikipedia (ex. `src/wikipedia/` ou sous `audio-generation` / `pois` — préférer module léger `wikipedia` ou `admin-wikipedia` pour éviter de mélanger avec jobs audio)
- [x] DTO query + response Swagger
- [x] Guards ADMIN + throttle raisonnable (ex. aligné génération : éviter abus)
- [x] Timeouts via `fetchWithTimeout` / policy externe existante
- [x] Documenter dans `docs/api-client-reference.md` (+ resync copie app)
- [x] User-Agent NOOK déjà utilisé côté client MediaWiki

## Fichiers concernés (indicatif)

- `src/mediawiki/mediawiki.client.ts` (+ spec)
- Nouveau controller/service DTO admin search
- `docs/api-client-reference.md`
- `nook_app_v2/docs/api-client-reference.md` (sync)

## Critères d’acceptation

- [x] `GET /admin/wikipedia/search?q=eiffel&lang=fr` → 200 + items non vides (environnement avec réseau / mock e2e)
- [x] Sans JWT → 401 ; JWT `USER` → 403
- [x] `q` invalide → 422
- [x] MediaWiki timeout / 5xx → `503` (ou mapping cohérent avec `fetchArticleFromWikipediaUrl`)
- [x] `npm test` vert
- [x] Contrat app synchronisé

## Tests unitaires

### API

- [x] `mediawiki.client.spec.ts` : parsing opensearch → items normalisés (URL canonique `https://{lang}.wikipedia.org/wiki/...`)
- [x] Controller/service : validation `q` / `limit` ; mapping erreurs
- [x] Guard : rôle ADMIN requis (pattern `roles.guard.spec` / e2e admin)

## Références

- [T22](./T22-spec-ecran-admin-wikipedia-poi.md)
- [T24](./T24-api-poi-from-wikipedia.md)
- MediaWiki Action API : `action=opensearch`
- F-015 client existant : extract par URL (réutilisé en T24)
