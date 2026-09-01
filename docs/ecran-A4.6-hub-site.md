# A4.6 — Hub site (POI conteneur)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A4.6 |
| Priorité | P2 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.3–§3.5 ; pattern commun [A4.3](./ecran-A4.3-hub-ville.md) / [A4.5](./ecran-A4.5-hub-quartier.md) ; écrans liés : **A3.1**, **A4.3**, **A5.6**, **A5.7**, **A1.1**, **A8.3** ; API F-006 (`parentPoiId`, enfants) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · Intégration [T27](./integration/T27-hub-poi-site.md) |

## Résumé

**Utilisateur :** explorer un grand lieu (musée, site archéologique) comme une destination à part entière — parcours de visite, salles / œuvres incontournables, expériences partenaires — avant d’ouvrir une fiche enfant.

**Produit :** même gabarit vitrine que **A4.3** / **A4.5**, à l’échelle d’un **POI conteneur** (`presentation: hub`). Option technique **A** : le hub est une présentation du POI existant, pas une entité séparée.

## Utilisateur et contexte

- **Persona / situation :** visiteur au Louvre (ou équivalent) qui veut une vue d’ensemble avant de choisir une salle, une œuvre ou un parcours guidé ; peut arriver depuis la carte, la recherche ou un lien partagé.
- **Contraintes :** usage souvent sur site (réseau variable, une main) ; scroll long ; distinction claire fiche lieu « légère » vs hub riche.

## Critères hub vs fiche lieu (A3.1)

Alignés sur **A4.5** (seuils éditoriaux).

### Par défaut : fiche lieu (A3.1)

Tant que les critères hub ne sont pas remplis, un POI (même avec des enfants) mène vers **A3.1** (`/place/[id]`). La fiche peut déjà lister des enfants via `childrenCount` / `GET .../children` sans basculer en hub.

### Passage en hub site (A4.6)

Un POI devient **hub A4.6** lorsque l’équipe éditoriale publie **au minimum** :

| Critère | Seuil |
|---------|-------|
| Itinéraires éditoriaux dédiés au site | **≥ 2** (ou **1 premium** + contenu associé) |
| POI enfants incontournables curatés | **≥ 4** |

Les blocs **expériences / visites partenaires** (ex. GetYourGuide) renforcent le hub mais ne suffisent pas seuls sans itinéraires NOOK.

### Signaux complémentaires (non bloquants)

- Recherche / discovery traitent le site comme destination (carte promue, deep link).
- La fiche A3.1 serait surchargée sans vitrine (trop d’enfants, parcours, affiliation).

### Modèle de données (MVP)

| Champ | Rôle |
|-------|------|
| `presentation: 'hub'` | Flag éditorial sur le **POI** (pas d’entité `SiteHub`) |
| `parentPoiId` | Enfants = salles / œuvres / sous-lieux |
| Tables de curation hub | Ex. `poi_hub_pois` (must-see / recommended), miroir `city_hub_pois` / `district_hub_pois` |
| Lien territorial optionnel | `citySlug` (et/ou district) pour fil d’Ariane → **A4.3** / **A4.5** |

**Règle de routing :** si `presentation === 'hub'` → hub **A4.6** ; sinon → **A3.1**.

**Contrat HTTP cible :** `GET /api/v1/pois/:id/hub` (slug ou UUID selon convention catalogue).

## Pattern commun avec A4.3 / A4.5

Sections **identiques** au gabarit vitrine :

- En-tête héros (photo, nom, stats)
- CTA « Voir sur la carte » (centre / bbox du site)
- Catégories d’itinéraires → **A5.7** (contexte site / `parentPoiId`)
- Bloc itinéraire premium → **A5.6** / **A8.3**
- POI incontournables (enfants curatés)
- Recommandé / populaire
- Expériences (affiliation)

Sections **absentes ou réduites** vs hub ville :

- **Pass touristiques** — masqués (comme **A4.5**).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A1.1** / **A1.4** — tap marqueur POI hub ; **A2.1** — résultat destination site ; **A4.3** — must-see ville pointant vers le site ; **A3.1** — CTA « Explorer le site » si on expose encore une fiche allégée (évolution) ; lien profond `/place/[id]/hub`. |
| **Sorties** | **A5.7** — tuile catégorie ; **A5.6** — itinéraire ; **A3.1** — enfant incontournable ; **A1.1** — CTA carte ; **A4.3** — lien parent ville (si renseigné) ; **A8.3** — premium ; WebView — expériences partenaires. |
| **Retour arrière** | Bouton retour héros ; geste OS back. |

**Lien profond :** `/place/[id]/hub` — id inconnu / non hub / non publié → état introuvable (même pattern A4.5).

**Routing carte / recherche :** réutiliser le pattern `districtHub` — exposer sur snippet / détail un signal du type `siteHub: true` ou `presentation: 'hub'` pour `getPlaceHref` → `/place/:id/hub` au lieu de `/place/:id`.

## Structure — deltas site vs ville / quartier

| Zone | Spécifique hub site |
|------|---------------------|
| **Sous-titre héros** | Stats locales (ex. « 3 parcours · 12 salles ») |
| **Lien parent** | « {Ville} » → **A4.3** si `citySlug` connu ; sinon masqué |
| **Incontournables** | Enfants du POI (`parentPoiId = hub`) ; le POI hub n’apparaît pas dans sa propre liste |
| **Itinéraires** | Filtrés par site (parent / tag éditorial) ; exclus du décompte hub ville sauf décision contraire |
| **Pass touristiques** | Section masquée |
| **CTA fiche classique** | Optionnel V1.1 : lien secondaire « Infos pratiques » → **A3.1** (horaires, Wikipedia, guides audio du parent) |

## Interactions et règles

- **Gestes / scroll :** identiques **A4.3**.
- **Enfants sans localisation :** si `location` null, le client peut retomber sur le point du parent pour l’aperçu carte (règle F-006).
- **Section vide :** masquer ; catégories : « Bientôt disponible » si hub publié sans itinéraires (V1 stubs OK).
- **Affiliation :** badge partenaire + interstitiel sortie NOOK (aligné A4.3 / A2.1).
- **Partage :** URL `/place/[id]/hub`.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Chargement** | Ouverture hub | Skeleton héros + 2 sections | — |
| **Contenu OK** | Hub publié + données | Scroll sections remplies | Sorties actives |
| **Introuvable** | id invalide, brouillon, ou `presentation !== hub` | Message + retour | Retour |
| **Erreur réseau** | Échec API | Message + réessayer | Retry |
| **Section vide** | Liste vide | Section masquée (règle A4.3) | — |

Libellé introuvable proposé : « Ce site n’existe pas ou n’est plus disponible. »

## Contenus et microcopy

- Titre héros : nom du POI (ex. « Musée du Louvre »).
- Lien parent : « Paris » (ville).
- CTA carte : « Voir sur la carte ».
- Expériences : « Réservation sur {partenaire} ».
- Ton : clair, éditorial, sans jargon technique.

## Accessibilité

- Contrôles héros (retour, partage) ≥ 44×44 pt ; labels accessibles.
- Carrousels : annonce du rôle et du défilement horizontal.
- CTA carte et tuiles catégorie : `accessibilityRole="button"` + libellé.
- Respect réduction de mouvement sur animations héros si présentes.

## Indicateurs et analytics

| Événement | Paramètres |
|-----------|------------|
| `hub_site_viewed` | `poi_id`, `source` |
| `hub_site_category_tapped` | `poi_id`, `category_slug` |
| `hub_site_poi_tapped` | `poi_id`, `child_poi_id`, `section` |
| `hub_site_map_cta_tapped` | `poi_id` |
| `hub_site_affiliate_tapped` | `poi_id`, `partner`, `slot`, `item_id` |
| Autres | Reprendre pattern A4.3 / A4.5 (`premium`, etc.) avec `poi_id` |

## Critères d’acceptation

1. **Given** POI Louvre `presentation: hub` **When** tap marqueur / résultat **Then** navigation **A4.6** (pas A3.1 seule).
2. **Given** hub site **When** tap enfant incontournable **Then** **A3.1** de l’enfant.
3. **Given** hub site **When** tap tuile catégorie **Then** **A5.7** filtrée sur les itinéraires du site (mock V1 OK).
4. **Given** hub site **When** tap lien parent ville **Then** **A4.3**.
5. **Given** POI avec enfants mais sans critères hub **When** tap **Then** **A3.1**.
6. **Given** hub site **When** tap CTA carte **Then** **A1.1** centrée sur le site.
7. **Given** hub site V1 **When** sections itinéraires / expériences vides API **Then** stubs / masquage sans crash (comme T19).

## Implémentation MVP

| Élément | Décision |
|---------|----------|
| Seed | **Musée du Louvre** (Paris) + ≥ 4 enfants publiés curatés must-see |
| V1 contenu | Héros + map + must-see / recommended ; catégories / premium / expériences **stubs** jusqu’à F-018-c/d / T21 |
| UI | Réutiliser `TerritorialHubView` (`paywallSource` dédié ex. `hub_site`) |
| Offline | Mock site Louvre si `!isApiConfigured()` |
| Delphes | Hors MVP (backlog après Louvre) |

## Open questions

1. Faut-il un CTA explicite **A4.6 → A3.1** (infos pratiques / audio du parent) dès la V1 ?
2. Les enfants du hub apparaissent-ils aussi comme must-see du hub **ville** (Paris), ou seulement depuis A4.6 ?
3. Slug stable public (`/place/musee-du-louvre/hub`) vs UUID seul — aligner sur la stratégie slug POI globale.

## Références techniques

- Hiérarchie POI : F-006 (`parentPoiId`, `GET /pois/:id/children`)
- Hubs territoriaux : F-018 / T17–T19
- Ticket intégration : [T27-hub-poi-site.md](./integration/T27-hub-poi-site.md)
