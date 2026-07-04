# T01 — Renforcement couche HTTP client

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 1 j |
| **Dépend de** | T00 |
| **Bloque** | T02, T03, T07 |

## Objectif

Client HTTP robuste : refresh JWT proactif, erreurs enrichies, helpers pagination, stockage tokens sécurisé en prod.

## Prérequis

- [ ] T00 terminée (health OK, types DTO de base)

## Étapes

- [ ] **Refresh proactif JWT** dans `AuthContext.tsx` :
  - Décoder `exp` du access token (ou timer basé sur 15 min API)
  - Appeler `POST /auth/refresh` avant expiration
  - Conserver le retry 401 existant dans `client.ts`
- [ ] Enrichir `ApiError` (`types/api.ts`) :
  - Parser `code` (ex. `GUIDE_CHAT_INSUFFICIENT_CREDITS`)
  - Parser `requestId` depuis corps ou header `X-Request-Id`
- [ ] Ajouter helper `buildQuery(params)` dans `lib/api/client.ts` ou `lib/api/query.ts`
- [ ] Optionnel : timeout réseau (ex. 30 s) sur `fetch`
- [ ] Optionnel : envoyer header `X-Request-Id` (UUID) sur chaque requête
- [ ] Migrer stockage tokens vers `expo-secure-store` en prod :
  - Garder AsyncStorage en dev si souhaité
  - Mettre à jour `lib/authStorage.ts`

## Fichiers concernés

- `lib/api/client.ts`
- `types/api.ts`
- `contexts/AuthContext.tsx`
- `lib/authStorage.ts`

## Critères d'acceptation

- [ ] Session reste active > 15 min sans déconnexion forcée (refresh proactif)
- [ ] Erreur 402 guide-chat expose `code` utilisable par l'UI
- [ ] `buildQuery({ limit: 20, offset: 0, q: 'test' })` produit une query string correcte
- [ ] Tokens persistés via SecureStore sur build release (ou documenté si reporté)
- [ ] `npm test` vert (`client`, `authStorage`, refresh)

## Tests manuels

- [ ] Login → attendre near-expiry → requête API réussit sans re-login
- [ ] Forcer 401 (token invalidé) → refresh réactif fonctionne une fois

## Tests unitaires

### App (`lib/api/__tests__/`)

- [ ] `client.test.ts` :
  - `buildQuery({ limit: 20, offset: 0, q: 'paris' })` → chaîne attendue
  - `ApiError` parse `code`, `requestId`, `details` depuis corps JSON
  - retry 401 : mock `refreshHandler` appelé une seule fois puis requête rejouée
  - `isApiConfigured()` false → `ApiError` statusCode 0
- [ ] `authStorage.test.ts` (mock `@react-native-async-storage` et `expo-secure-store`) :
  - round-trip save/load tokens
  - prod vs dev : bon backend de persistance sélectionné
- [ ] `authRefresh.test.ts` (logique extraite ou testée via helper pur) :
  - refresh proactif déclenché avant `exp`
  - pas de double refresh concurrent

### Exécution

- [ ] `npm test` vert dans `nook_app_v2`
