# T09 — Auth UX et mode dégradé

| | |
|---|---|
| **Dépôt** | `nook_app_v2` |
| **Durée** | 1–2 j |
| **Dépend de** | T04, T06 |
| **Priorité écran** | P1 — A1.3, A6.1, A6.4 |

## Objectif

Comportement cohérent demo vs API réelle ; écrans d'erreur service ; stats profil basées sur données API.

## Prérequis

- [ ] T04 : listen-history API
- [ ] T06 : favoris API
- [ ] T00 : health endpoint

## Étapes

### Demo vs API

- [ ] Harmoniser `app/auth/login.tsx` et `register.tsx` avec `AuthContext` :
  - Si API configurée : pas de fallback mock silencieux sur échec login
  - Demo uniquement via `shouldShowDemoLogin()` + action explicite
- [ ] Documenter règle dans `lib/config.ts` ou commentaire README integration

### Mode dégradé (A1.3)

- [ ] Utiliser `fetchHealth()` au démarrage ou sur écran racine
- [ ] UI erreur : API down, offline, playback 503
- [ ] Actions : réessayer, continuer en mode limité si applicable

### Profil

- [ ] `app/(tabs)/profil.tsx` :
  - Stats écoutes → `listen-history` count ou agrégat API
  - Stats favoris → count API
  - Retirer compteurs mock-only quand connecté + API

## Fichiers concernés

- `app/auth/login.tsx`, `app/auth/register.tsx`
- `contexts/AuthContext.tsx`, `lib/config.ts`
- `lib/api/health.ts`
- `app/(tabs)/profil.tsx`, `app/(tabs)/index.tsx`

## Critères d'acceptation

- [ ] Avec API up : login échoué n'active pas session mock automatiquement
- [ ] Bouton demo visible seulement selon règles produit
- [ ] Health fail affiche message + retry
- [ ] Profil connecté : stats cohérentes avec favoris/historique API

## Specs écrans liées

- [`docs/ecran-A6.1-authentification.md`](../ecran-A6.1-authentification.md)
- [`docs/ecran-A6.4-profil.md`](../ecran-A6.4-profil.md)

## Tests unitaires

### App

- [ ] `lib/__tests__/config.test.ts` :
  - `shouldShowDemoLogin()` : sans API → true ; avec API + prod → false ; dev → true
  - `getApiBaseUrl()` trim trailing slash
- [ ] `lib/auth/__tests__/demoSessionPolicy.test.ts` (helper extrait de AuthContext) :
  - login échoué n'appelle pas `loginAsMock` si API configurée
  - demo explicite seulement via flag/bouton
- [ ] `lib/profile/__tests__/profileStats.test.ts` :
  - agrégation count favoris / historique depuis listes API

### Exécution

- [ ] `npm test` vert dans `nook_app_v2`
