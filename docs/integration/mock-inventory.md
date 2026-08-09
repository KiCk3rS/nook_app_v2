# Inventaire des données mock — post-intégration T10

**Date d’audit :** 2026-07-05  
**Périmètre :** `nook_app_v2` avec `API_BASE_URL` configuré et session authentifiée réelle (hors session démo).  
**Référence intégration :** [README.md](./README.md) (T00–T10 terminés).

Ce document distingue trois catégories :

| Catégorie | Description |
|-----------|-------------|
| **A — Démo / offline** | Volontaire : `!isApiConfigured()` ou `isMockSession` (`shouldUseMockData` dans `lib/config.ts`) |
| **B — Lacune API** | Données 100 % mock en production malgré API branchée |
| **C — Hybride** | API principale + enrichissement ou fallback local résiduel |

---

## 1. Règles de bascule (rappel)

```text
isApiConfigured()     = API_BASE_URL non vide (expo extra)
shouldUseMockData()   = !isApiConfigured() OU isMockSession
shouldShowDemoLogin() = !isApiConfigured() OU __DEV__
```

| Mode | Auth | Données |
|------|------|---------|
| Expo Go sans API | démo ou anonyme | mock complet |
| Dev + API | démo explicite possible | mock si session démo |
| Staging / prod + API | auth réelle uniquement | API (+ résidus §4) |

---

## 2. Inventaire statique des fichiers mock

### 2.1 `constants/`

| ID | Fichier | Contenu | ~Lignes | Mode prod |
|----|---------|---------|---------|-----------|
| M01 | `mockPlaces.ts` | 14 POI Paris, types `MockPlace` / `AudioGuide`, helpers (`getPlaceById`, `parisRegion`, …) | ~570 | **C** — types UI universels ; fallback preview carte |
| M02 | `mockCities.ts` | 2 villes (Paris, Lyon), tourist pass, expériences affiliées | ~140 | **B** — F-018 |
| M03 | `mockDistricts.ts` | 2 quartiers Paris (Marais, Montmartre) | ~85 | **B** — F-018 |
| M04 | `mockItineraries.ts` | 6 itinéraires éditoriaux NOOK | ~245 | **B** — pas d’endpoint public |
| M05 | `mockUserItineraries.ts` | 3 parcours user démo | ~60 | **A** — démo uniquement |
| M06 | `discoveryFeed.ts` | Listes POI éditoriales (latest / popular / top-rated) | ~80 | **A** — si `!isApiConfigured()` |
| M07 | `searchDiscovery.ts` | Slugs villes promues/populaires (`paris`, `lyon`) | ~15 | **B** — utilisé même avec API |
| M08 | `mockListenHistory.ts` | 8 entrées historique démo | ~135 | **A** — démo uniquement |
| M09 | `mockProfileInsights.ts` | Stats profil démo (écoutes, villes, memberSince) | ~18 | **A** — démo uniquement |
| M10 | `mockGuideTranscripts.ts` | Transcripts synchronisés pour guides `1-a`, `2-a` | ~120 | **B** — toujours mock |
| M11 | `mockUser.ts` | User / tokens démo, `MOCK_SAVED_ROUTES_COUNT` | ~35 | **A** — démo uniquement |
| — | `demoAudio.ts` | MP3 local `assets/audio/demo-guide.mp3` | ~3 | **A** — lecture démo (`useAudioPlayer`) |

### 2.2 `lib/`

| ID | Fichier | Rôle | Mode prod |
|----|---------|------|-----------|
| M12 | `mockAudioGuideCreation.ts` | Crédits, jobs, guides privés, `CREDIT_PACK_OPTIONS` | **A** démo ; **B** catalogue packs hardcodé |
| M13 | `mockGuideChat.ts` | Messages chat guide IA démo | **A** — démo uniquement |
| M14 | `mockUserSession.ts` | Persistance session démo AsyncStorage | **A** — démo uniquement |
| — | `__mocks__/expo-constants.ts` | Jest uniquement | tests |

### 2.3 Consommateurs par fichier (grep 2026-07-05)

**`mockPlaces`** — 45+ imports : hooks (`usePoiDetail`, `usePoisInBbox`, `useAudioPlayer`), mappers (`poi`, `favorites`), écrans carte/fiche/guidage, composants audio/favoris/recherche.

**`mockCities`** — 18 imports : tous les écrans `app/city/**`, recherche (`SearchDiscoveryView`, `searchPlaces`), discovery (`DiscoveryFeedView`), favoris vides, carte accueil (deep links).

**`mockItineraries`** — 15 imports : hubs ville, favoris itinéraires, paywall, guidage éditorial.

**`getPlaceById` en prod (appels résiduels hors démo)** — post-T20 :

| Fichier | Contexte | Statut |
|---------|----------|--------|
| `lib/favorites/placeStore.ts` | Hint optimiste sans snippet API | Résidu mineur (titre hint) |
| `components/city/TerritorialHubView.tsx` / `lib/mappers/cityHub.ts` | Must-see / recommended POI du hub | Éditorial → [T21](./T21-backlog-p3.md) |
| `app/city/.../itinerary/[id].tsx` | Étapes itinéraire éditorial | Éditorial → T21 |
| `lib/itineraryMap.ts` | Carte parcours (IDs → coordonnées) | Éditorial → T21 |
| `components/guidance/GuidanceExperience.tsx` | Guidage éditorial mock | Éditorial → T21 |

Résidus traités en T20 : preview carte hors bbox (accepte `null`), favoris (`favoriteItemToPlaceView` snippet API), covers parcours user (placeholder / `coverImageUrl`).

---

## 3. Cartographie écran / flux (mode prod)

Matrice : **API** = branché · **Mock** = données locales · **Hybride** = API + mock résiduel · **—** = non applicable.

| Écran / flux | Spec | Source prod | Cat. | Besoin API / app |
|--------------|------|-------------|------|------------------|
| Carte accueil | A1.1 | `GET /pois` (bbox) | API | Preview hors bbox → `null` (T20) |
| Recherche POI | A2.1 | `GET /pois?q=` | API | Villes → `mockCities` (**B**, F-018-a) |
| Recherche — villes promues | A2.1 | `searchDiscovery` + `mockCities` | Mock | `GET /cities?promoted=true` |
| Discovery (3 sections) | A4.1 | `GET /discovery/*` | API | Erreur API → vide (pas fallback mock) |
| Discovery — liens ville | A4.1 | `getCityBySlug` | Mock | F-018 |
| Fiche lieu | A3.1 | `GET /pois/:id`, children, audios | API | Images placeholder (**B**, F-006) ; `wikipediaUrl` absent (**B**, F-015) |
| Lecteur — playback | A3.2 | `GET .../playback` | API | OK (F-007) |
| Lecteur — transcript | A3.2 | `mockGuideTranscripts` | Mock | `GET /audio-guides/:id/transcript` (**B**) |
| Lecteur — chat | A3.2 | `GET/POST .../guide-chat` | API | OK (F-016) |
| Création guide IA | A3.3 | `POST .../audio-guides/generate` | API | URL Wikipedia non pré-remplie si POI hors seed mock (**B**) |
| Favoris lieux | A8.4 | `GET/POST/DELETE /me/favorites` | API | Snippet API (T20) ; hint mock démo uniquement |
| Favoris itinéraires | A8.4 | `mockItineraries` + AsyncStorage | Mock | Décision produit (§6) |
| Historique écoute | A8.3 | `GET /me/listen-history` | API | OK (F-012) |
| Liste parcours user | A5.1 | `GET /itineraries` | API | Cover : `coverImageUrl` ou placeholder (T20) |
| Guidage parcours user | A5.5 | `GET /itineraries/:id` | API | OK (F-010) |
| Hub ville | A4.3 | `mockCities` | Mock | F-018-b |
| Hub quartier | A4.5 | `mockDistricts` | Mock | F-018 (phase 3) |
| Itinéraires éditoriaux | A5.6–A5.7 | `mockItineraries` | Mock | Endpoint éditorial à définir |
| Profil — compteurs | A6.2 | API `me`, listen-history, itineraries | API | `routesCount` + `recentRoutes` via `GET /itineraries?limit=3` (T20) |
| Profil — memberSince / villes | A6.2 | `user.createdAt` ; villes 0 en prod | API / — | memberSince formaté (T20) ; villes reportées |
| Crédits / packs | A3.3 | `GET /me/credits`, `POST .../purchase` | Hybride | `CREDIT_PACK_OPTIONS` hardcodé ; purchase stub API |
| Auth login/register | A6.1 | API auth | API | OK |
| Mot de passe oublié | A6.3 | `setTimeout` simulé | Mock | `POST /auth/forgot-password` |
| Session démo | T09 | `mockUser` + `mockUserSession` | A | Conserver |

---

## 4. Validation runtime — points de contrôle T10

Analyse code + matrice [T10-qa-production.md](./T10-qa-production.md), session **connectée + API staging**. À confirmer manuellement sur device.

| # | Scénario | Résultat attendu (code) | Source | Statut audit |
|---|----------|-------------------------|--------|--------------|
| 1 | Ouvrir recherche → villes promues/populaires | Paris (+ Lyon populaire) depuis `mockCities` | Mock | **Mock confirmé** |
| 2 | Naviguer `/city/paris` | Hub complet : cover Unsplash, must-see IDs mock, itinéraires éditoriaux | Mock | **Mock confirmé** |
| 3 | Fiche lieu API → onglet Contenu | Transcript vide sauf guides `1-a` / `2-a` (IDs seed mock) | Mock | **Mock confirmé** |
| 4 | Fiche lieu API → créer guide IA | `wikipediaUrl` vide : `poiDetailToMockPlace` ne mappe pas le champ ; `getPlaceWikipediaUrl` retourne `undefined` | Lacune | **Bloquant P0** |
| 5 | Favoris → onglet itinéraires | Liste depuis `getItineraryById` sur IDs locaux AsyncStorage | Mock | **Mock confirmé** |
| 6 | Profil → parcours récents | `fetchItineraries({ limit: 3 })` si `!useMockData` | API | **OK (T20)** |

### Matrice T10 complétée (source de données, prod)

| Écran | Anonyme | Connecté | Offline | API down |
|-------|---------|----------|---------|----------|
| Carte accueil | API POI | API POI | Vide / erreur | Mode limité (T09) |
| Recherche | API POI + mock villes | idem | Mock local si `!isApiConfigured` | Fallback mock POI (`searchPlaces` catch) |
| Fiche lieu + audio | API | API | — | Erreur affichée |
| Discovery | API | API | Mock si `!isApiConfigured` | Sections vides + erreur |
| Favoris lieux | CTA login | API | Local si pas auth | Rollback optimiste |
| Favoris itinéraires | — | Mock local | Local | Local |
| Historique | CTA login | API (ou mock démo) | — | Erreur |
| Parcours user | CTA login | API | — | Erreur |
| Génération guide | CTA login | API (Wikipedia manuelle) | — | Erreur |
| Guide-chat | CTA login | API (ou mock démo) | — | Erreur |
| Profil | Anonyme | API partiel | — | loadError |

---

## 5. Matrice mock → besoin API (priorisée)

| ID | Donnée / comportement | Fichier(s) | Condition prod | Endpoint / action cible | Feature | P | Effort |
|----|----------------------|------------|----------------|-------------------------|---------|---|--------|
| INV-01 | `wikipediaUrl` sur POI | `mockPlaces`, `placeWikipedia`, mapper `poi` | Toujours manquant API→UI | Exposer `wikipediaUrl` ou `sourceUrl` sur `GET /pois/:id` ; mapper app | F-006 / F-015 | **P0** | API S · App S |
| INV-02 | Images POI (fiche, carte, favoris) | `poi.ts` L105–109 (`PLACE_IMAGE_PLACEHOLDER`) | Toujours placeholder fiche | URLs signées sur `GET /pois/:id` (comme discovery `coverImage`) ou endpoint image dédié | F-006 | **P0** | API M · App S |
| INV-03 | Transcript audio synchronisé | `mockGuideTranscripts`, `guideTranscript.ts` | Toujours mock | `GET /api/v1/audios/:id/transcript` ou `/audio-guides/:id/transcript` | F-016 / A3.2 | **P1** | API M · App S |
| INV-04 | Liste / recherche villes | `mockCities`, `searchPlaces`, `searchDiscovery` | Toujours mock | `GET /api/v1/cities` (`q`, `promoted`, `popular`) | F-018-a | **P1** | API L · App M |
| INV-05 | Hub ville A4.3 | `mockCities`, `TerritorialHubView`, `app/city/[slug]` | 100 % mock | `GET /api/v1/cities/:slug/hub` | F-018-b | **P2** | API L · App L |
| INV-06 | Hub quartier A4.5 | `mockDistricts`, `app/city/.../district` | 100 % mock | Extension F-018 hub ou `districts` | F-018 | **P2** | API L · App M |
| INV-07 | Parcours récents profil | `profil.tsx` | ✅ T20 — `fetchItineraries({ limit: 3 })` | — | F-010 | **P2** | App S |
| INV-08 | Cover image parcours user | `UserItineraryCard.tsx` | ✅ T20 — `coverImageUrl` ou placeholder (pas mock) | Extension `coverPoi` API reportée | F-010 | **P2** | API S · App S |
| INV-09 | `memberSince` / villes visitées profil | `profileStats.ts` | ✅ T20 — `createdAt` ; villes 0 / non affichées | Stats villes TBD | F-003 | **P2** | API S · App S |
| INV-10 | Itinéraires éditoriaux + favoris | `mockItineraries`, `FavoritesContext` | ✅ T21 — API éditorial + favoris `editorial_itinerary` (mock démo) | — | F-018-c | **P3** | API XL · App M |
| INV-11 | Reset mot de passe | `forgot-password.tsx` | ✅ T21 — `POST /auth/forgot-password` (+ reset ; token logué en dev) | SMTP réel | Auth | **P3** | API M · App S |
| INV-12 | Catalogue packs IAP | `CREDIT_PACK_OPTIONS` | ✅ T21 — `GET /me/credits/packs` + purchase stub | Validation reçus store | F-015 | **P3** | API M · App M |
| INV-13 | Preview carte hors bbox | `index.tsx` | ✅ T20 — accepte `null` (pas de mock) | Optionnel : `GET /pois/:id` léger | F-004 | **P3** | App S |

**Légende effort :** S = quelques heures · M = 1–3 j · L = 1–2 sem · XL = epic produit

### Correspondance tâches T11–T21

| INV | Tâche(s) |
|-----|----------|
| INV-01, INV-02 | [T11](./T11-api-poi-media-sources.md), [T12](./T12-app-poi-media-sources.md) |
| INV-03 | [T13](./T13-api-transcript-audio.md), [T14](./T14-app-transcript-audio.md) |
| INV-04 | [T15](./T15-api-cities-f018-phase1.md), [T16](./T16-app-cities-recherche.md) |
| INV-05 | [T17](./T17-api-hub-ville-f018.md), [T18](./T18-app-hub-ville.md) |
| INV-06 | [T19](./T19-hubs-quartier-f018.md) |
| INV-07, INV-08, INV-09, INV-13 | [T20](./T20-app-profil-residus.md) |
| INV-10, INV-11, INV-12 | [T21](./T21-backlog-p3.md) |

---

## 6. Décisions produit (à valider)

| # | Question | Options | Recommandation audit | Impact si « non » |
|---|----------|---------|----------------------|-------------------|
| D1 | Implémenter F-018 hubs ville ? | Oui phase 1→3 / Reporter | **Oui** — débloque recherche + 9 écrans `app/city/**` | Garder `mockCities` / `mockDistricts` |
| D2 | Exposer itinéraires éditoriaux via API ? | Module dédié / Rester mock | ✅ **Module dédié** (T21a, 2026-08-09) | — |
| D3 | Synchroniser favoris itinéraires serveur ? | Étendre `me/favorites` / Local only | ✅ **Étendre `me/favorites`** `editorial_itinerary` (T21b) | — |
| D4 | Transcript : public ou auth ? | Public si guide public / Bearer | Aligner sur politique audio (F-007) | — |
| D5 | Images POI publiques : URLs signées sur détail ? | Oui (comme discovery) / CDN public | **Oui** — cohérence discovery | Placeholder permanent |

---

## 7. Dette technique app (refactoring, hors nouveau endpoint)

1. **`MockPlace` comme type UI universel** — migrer vers `types/catalogue.ts` ; réduire `poiDetailToMockPlace`.
2. **`getPlaceById` en prod** — tracer et remplacer par données API (favoris, covers parcours, hub must-see).
3. **`mockPlaces.ts` volumineux** — conserver pour démo offline ; interdire enrichissement silencieux en prod (lint ou revue).
4. **Favoris itinéraires** — `bootstrapFavorites.ts` ne sync jamais `itineraryIds` serveur (L41–45).
5. **Types `MockCity` / `EditorialItinerary`** — extraire en types domaine indépendants des fichiers mock.

---

## 8. À conserver (ne pas supprimer)

| Élément | Raison |
|---------|--------|
| `shouldUseMockData` + session `loginAsMock` | Démo Expo Go, tests UX, T09 |
| Fallback `!isApiConfigured()` | Dev sans backend |
| `lib/__mocks__/expo-constants.ts` | CI Jest |
| `constants/demoAudio.ts` | Lecture hors API en session démo |
| `mockUser`, `mockUserSession` | Parcours démo explicite |
| `discoveryFeed.ts` | Offline discovery |

---

## 9. Synthèse exécutive

**Intégration T00–T10 :** les flux P0 (carte, fiche, audio, discovery, favoris lieux, parcours user, crédits, guide-chat, auth) sont **branchés API** en production.

**En production réelle, il reste :**

- **2 blocs 100 % mock** : hubs territoriaux (F-018) et itinéraires éditoriaux.
- **2 lacunes bloquantes UX** : images POI (placeholder) et `wikipediaUrl` (génération IA).
- **1 feature incomplète** : transcript lecteur (toujours mock).
- **Plusieurs résidus hybrides** : villes en recherche, covers parcours, enrichissement favoris, parcours récents profil.

**Prochaines actions suggérées :**

1. **P0** : [T11](./T11-api-poi-media-sources.md) + [T12](./T12-app-poi-media-sources.md) — images & Wikipedia POI.
2. **P1** : [T13](./T13-api-transcript-audio.md) + [T14](./T14-app-transcript-audio.md) · [T15](./T15-api-cities-f018-phase1.md) + [T16](./T16-app-cities-recherche.md).
3. **P2** : [T17](./T17-api-hub-ville-f018.md) → [T19](./T19-hubs-quartier-f018.md) · [T20](./T20-app-profil-residus.md).
4. **P3** : [T21](./T21-backlog-p3.md) — décision produit D2/D3.

Voir le [README intégration](./README.md) § Post-T10 pour l’ordre et le suivi.

---

## Références

- [spec-f018-hubs-ville.md](../../../nook_api_v2/docs/spec-f018-hubs-ville.md)
- [api-client-reference.md](../api-client-reference.md)
- [ecran-A3.2-lecteur-audio.md](../ecran-A3.2-lecteur-audio.md) (transcript cible)
- [T10-runbook-deploiement.md](./T10-runbook-deploiement.md) § Hors périmètre
