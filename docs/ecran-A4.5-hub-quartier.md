# A4.5 — Hub quartier (vitrine territoriale locale)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A4.5 |
| Priorité | P1 (évolution du périmètre A4.3) |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.4, §3.5 ; **pattern commun [A4.3](./ecran-A4.3-hub-ville.md)** ; écrans liés : **A4.3**, **A5.6**, **A5.7**, **A3.1**, **A1.1**, **A8.3** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Hub ville A4.3](./ecran-A4.3-hub-ville.md) · [Brief](./brief.md) |

## Résumé

**Utilisateur :** explorer un quartier comme une zone à part entière — parcours dédiés, lieux incontournables, expériences locales — avant de plonger dans une fiche lieu.

**Produit :** extension du hub ville (**A4.3**) à l’échelle quartier ; réutilise le même gabarit vitrine avec sections réduites (pas de pass touristiques nationaux) et lien parent vers le hub ville.

## Critères hub vs fiche lieu (A3.1)

La présentation d’un quartier est une **décision éditoriale**, guidée par le contenu publié.

### Par défaut : fiche lieu (quartier léger)

Tant que les critères hub ne sont pas remplis, un POI `categoryId: quartier` mène vers **A3.1** (`/place/[id]`).

### Passage en hub quartier

Un quartier devient **hub A4.5** lorsque l’équipe éditoriale publie **au minimum** :

| Critère | Seuil |
|---------|-------|
| Itinéraires éditoriaux dédiés | **≥ 2** (ou **1 premium** + contenu associé) |
| POI incontournables curatés dans le quartier | **≥ 4** |

Les blocs **expériences / visites partenaires** renforcent le hub mais ne suffisent pas seuls sans itinéraires NOOK.

### Signaux complémentaires (non bloquants)

- Recherche et fil traitent le quartier comme **destination** (carte promue, lien profond).
- La fiche lieu A3.1 serait surchargée ou incomplète sans vitrine.

### Modèle de données (MVP)

| Champ | Rôle |
|-------|------|
| `presentation: 'hub'` | Flag éditorial sur l’entité quartier |
| `anchorPoiId` | POI carte (marqueur existant) |
| `citySlug` + `slug` | Route `/city/[citySlug]/district/[slug]` |

**Règle de routing :** si `presentation === 'hub'` → hub **A4.5** ; sinon → **A3.1**.

## Pattern commun avec A4.3

Sections **identiques** au hub ville (cf. [ecran-A4.3-hub-ville.md](./ecran-A4.3-hub-ville.md)) :

- En-tête héros (photo, nom, stats)
- CTA « Voir sur la carte » (bbox quartier)
- Catégories d’itinéraires → **A5.7** (contexte quartier)
- Bloc itinéraire premium → **A5.6** / **A8.3**
- POI incontournables
- Recommandé pour vous / fallback populaire
- Expériences (affiliation locale)

Sections **absentes ou réduites** vs hub ville :

- **Pass touristiques** — réservés au hub ville (**A4.3**) ; masqués sur hub quartier.

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A4.3** — tap incontournable quartier hub ; **A1.1** / **A1.4** — tap marqueur quartier hub ; **A2.1** — résultat destination quartier (évolution) ; lien profond `/city/[citySlug]/district/[slug]`. |
| **Sorties** | **A5.7** — tuile catégorie ; **A5.6** — itinéraire ; **A3.1** — POI incontournable ; **A1.1** — CTA carte ; **A4.3** — lien parent ville ; **A8.3** — premium verrouillé ; WebView — expériences partenaires. |
| **Retour arrière** | Bouton retour héros ; geste OS back. |

**Lien profond :** `/city/[citySlug]/district/[slug]` — slug inconnu → état introuvable.

## Structure — deltas quartier vs ville

| Zone | Spécifique quartier |
|------|---------------------|
| **Sous-titre héros** | Stats locales (ex. « 4 parcours · 6 lieux ») |
| **Lien parent** | « {Ville} » → **A4.3** |
| **Itinéraires** | Filtrés `districtSlug` ; exclus du décompte hub ville |
| **Incontournables** | POI du quartier ; le marqueur quartier lui-même n’apparaît pas dans sa propre liste |
| **Pass touristiques** | Section masquée |

## États

Reprendre les états **A4.3** ; libellé introuvable : « Ce quartier n’existe pas ou n’est plus disponible. »

## Analytics (stub)

| Événement | Paramètres |
|-----------|------------|
| `hub_district_viewed` | `city_slug`, `district_slug`, `source` |
| `hub_district_category_tapped` | `city_slug`, `district_slug`, `category_slug` |
| Autres | Reprendre **A4.3** avec `district_slug` |

## Critères d’acceptation

1. **Given** hub Paris **When** tap « Le Marais » (quartier hub) **Then** navigation **A4.5** avec sections chargées.
2. **Given** hub quartier **When** tap tuile catégorie **Then** **A5.7** filtrée sur les itinéraires du quartier.
3. **Given** hub quartier **When** tap POI incontournable **Then** **A3.1**.
4. **Given** hub quartier **When** tap lien parent **Then** **A4.3** ville.
5. **Given** quartier sans critères hub **When** tap marqueur **Then** **A3.1** (fiche lieu).
6. **Given** hub quartier **When** tap CTA carte **Then** **A1.1** centrée sur bbox quartier.

## Implémentation MVP

- Mock : **Le Marais** (`/city/paris/district/le-marais`) — vitrine de démonstration.
- Itinéraires dédiés : `itin-marais-highlights`, `itin-marais-secrets`, `itin-marais-walking`, `itin-marais-premium`.
