# A4.3 — Hub ville (vitrine territoriale)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A4.3 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.4, §3.5 ; écrans liés : **A2.1**, **A4.1**, **A4.2**, **A5.6**, **A5.7**, **A3.1**, **A1.1**, **A8.3** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Design](./DESIGN.md) · [API client](./api-client-reference.md) |

## Résumé

**Utilisateur :** choisir une ville et comprendre comment la visiter — itinéraires thématiques, lieux incontournables, pass touristiques et activités complémentaires.

**Produit :** hub éditorial territorial servant de porte d’entrée vers les itinéraires curatés NOOK, avec monétisation premium (contenu payant) et blocs d’affiliation (pass touristiques partenaires, expériences).

## Utilisateur et contexte

- **Persona / situation :** visiteur qui planifie un séjour ou explore une destination depuis la recherche, le fil ou un lien partagé ; souhaite une vue d’ensemble avant de plonger dans un lieu ou un parcours.
- **Contraintes :** debout, une main, scroll long ; réseau variable ; usage possible hors connexion partielle (contenu éditorial cache vs blocs affiliation dynamiques).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A2.1** — tap carte « destination » (ville) ; **A4.1** — section ville mise en avant ; **A4.4** — tap ville depuis hub pays ; lien profond `/city/[slug]`. |
| **Sorties** | **A5.7** — tap tuile catégorie d’itinéraire ; **A5.6** — tap itinéraire (dont premium) ; **A3.1** — tap POI incontournable ou reco ; **A1.1** — CTA « Voir sur la carte » (bbox ville) ; **A8.3** — itinéraire premium verrouillé ; WebView / navigateur — pass touristiques et expériences partenaires. |
| **Retour arrière** | Bouton retour héros ; geste OS back = écran précédent (A2.1, A4.1, etc.). |

**Lien profond :** `/city/[slug]` — si slug inconnu : état « Ville introuvable » + retour.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **En-tête héros** — photo, nom de ville, stats éditoriales.
2. **CTA « Voir sur la carte »** — accès spatial immédiat.
3. **Catégories d’itinéraires** — grille / carrousel thématique (intention primaire éditoriale).
4. **Bloc itinéraire premium** — mise en avant monétisée.
5. **POI incontournables** — carrousel horizontal.
6. **Recommandé pour vous** — personnalisation ou fallback populaire.
7. **Pass touristiques** — affiliation (offices de tourisme, opérateurs).
8. **Expériences** — affiliation (ex. GetYourGuide).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Héros image** | Ancrage visuel | `coverImageUrl`, `name`, `subtitle` (ex. « 12 guides audio · 4 parcours ») | Hauteur ~240–280 px ; scrim pour contrôles |
| **Barre flottante héros** | Nav + actions | Retour (gauche) ; partage (droite) | Boutons 44×44 pt, fond `canvas`, `elevation.control` — aligné **A3.1** |
| **CTA carte** | Action primaire spatiale | Lien vers **A1.1** | Bouton pleine largeur ou pill sous le héros ; passe `cityId` + bbox |
| **Section catégories** | Navigation itinéraires | Tuiles : `slug`, `label`, `icon`, `itineraryCount?` | Grille 2 colonnes ou carrousel horizontal ; tap → **A5.7** |
| **Carte premium** | Monétisation | `itineraryId`, `title`, `duration`, `stepCount`, `isLocked`, `priceLabel?` | Badge « Premium » ; icône cadenas si verrouillé ; tap → **A5.6** ou **A8.3** |
| **Section incontournables** | Découverte POI | Liste `poiIds[]` ordonnée éditorialement | Carrousel 4–6 cartes compactes ; pattern visuel **PopularDestinationCard** |
| **Section recommandé** | Personnalisation | POI ou itinéraires selon profil | Masquée si anonyme sans fallback ; sinon « Populaire dans {ville} » |
| **Section pass touristiques** | Affiliation | `partnerName`, `title`, `priceFrom`, `validityLabel?`, `savingsHint?`, `affiliateUrl` | Badge « Partenaire » ; valeur perçue (économies, durée) |
| **Section expériences** | Affiliation | `provider`, `title`, `priceFrom`, `rating?`, `duration?`, `externalUrl` | Sous-titre « Réservation sur {partenaire} » ; ouverture externe |

### Tuile catégorie d’itinéraire (détail)

| Champ | Type | Notes |
|-------|------|-------|
| `slug` | string | Ex. `highlights`, `secrets`, `family`, `one-day`, `walking` |
| `label` | string | Ex. « Les points forts », « Les secrets » |
| `icon` | nom icône | Cohérent avec taxonomie produit |
| `itineraryCount` | number? | Affiché si > 0 ; masqué si section vide |

### Catégories éditoriales de référence (lancement)

| Slug | Label proposé |
|------|---------------|
| `highlights` | Les points forts |
| `secrets` | Les secrets |
| `family` | En famille |
| `one-day` | Une journée |
| `walking` | À pied |
| `evening` | En soirée |

Liste configurable côté éditorial ; les slugs absents du catalogue ville ne génèrent pas de tuile.

## Interactions et règles

- **Gestes :** scroll vertical sur la page ; scroll horizontal sur carrousels (incontournables, pass, expériences).
- **Itinéraire éditorial ≠ parcours utilisateur** : contenu curaté NOOK ; pas d’édition directe ; pas de copie vers parcours perso au premier périmètre.
- **Premium** : états d’accès `locked` | `purchased` | `included_in_subscription` ; après achat **A8.3**, retour au hub ou **A5.6** sans rechargement complet de la page.
- **Affiliation** : transparence alignée **A2.1** (badge « Partenaire », « Promu » si applicable) ; pas de redirection silencieuse ; interstitiel « Vous quittez NOOK » avant ouverture externe si requis légal.
- **Cohérence carte** : POI et étapes d’itinéraires affichés sur **A1.1** via CTA carte = même jeu d’IDs que les sections hub (brief §3.2).
- **Section vide** : masquer la section si aucun item ; exception — catégories toujours visibles avec message « Bientôt disponible » si ville publiée sans itinéraire.
- **Partage** : sheet native OS avec titre ville + URL profonde `/city/[slug]`.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Chargement** | Navigation vers hub, données async | Skeleton héros + 2 sections | — |
| **Contenu OK** | Données ville disponibles | Scroll complet selon sections remplies | Toutes sorties actives |
| **Ville introuvable** | `slug` / `id` invalide | Titre + message + retour | Retour |
| **Section vide** | Liste vide pour un bloc | Section masquée (règle par type) | — |
| **Premium verrouillé** | `isLocked === true` | Carte premium avec cadenas + prix | Tap → **A8.3** |
| **Hors ligne** | Pas de réseau | Héros + sections cache (POI, itinéraires) ; affiliation masquée | « Réessayer » sur bannière |
| **Erreur API** | Échec fetch | Bannière + réessayer | « Réessayer » |
| **Achat en cours** | Feuille **A8.3** ouverte | Hub visible en arrière-plan | Annuler achat → hub inchangé |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| CTA carte | « Voir sur la carte » |
| Section catégories | « Explorer par thème » |
| Section premium | « Coup de cœur premium » |
| Badge premium | « Premium » |
| Prix premium (verrouillé) | « À partir de {price} » ou « Débloquer » |
| Section incontournables | « Incontournables » |
| Section recommandé (connecté) | « Recommandé pour vous » |
| Section recommandé (fallback) | « Populaire à {ville} » |
| Section pass touristiques | « Pass touristiques » |
| Mention pass | « Achat sur {partenaire} » |
| Section expériences | « Expériences et activités » |
| Badge partenaire | « Partenaire » |
| Sortie app (interstitiel) | « Vous allez être redirigé vers {partenaire} pour poursuivre. » |
| Bouton interstitiel | « Continuer » / « Annuler » |
| Ville introuvable | « Cette destination n’existe pas ou n’est plus disponible. » |
| Section sans contenu (catégories) | « De nouveaux parcours arrivent bientôt. » |
| Partage | « Découvrez {ville} sur NOOK » |
| Retour | « Retour » |

**Ton :** inspirant, orienté exploration ; transparence sur contenu payant et partenaires.

## Accessibilité

- Titre d’écran annoncé : « Hub {ville} ».
- Labels : « Retour », « Partager {ville} », « Voir {ville} sur la carte », « Catégorie {label} — {count} parcours », « Itinéraire premium {title} — verrouillé », « Lieu incontournable {name} », « Pass touristique {title} », « Expérience {title} — réservation externe ».
- Cibles tactiles ≥ 44×44 pt ; carrousels annonçables par position (« 2 sur 6 »).
- Contraste badge « Premium » et « Partenaire » suffisant sur fond image.
- Réduction de mouvement : pas d’auto-scroll agressif sur carrousels.

## Indicateurs et analytics

| Événement | Paramètres (sans PII) |
|-----------|------------------------|
| `hub_city_viewed` | `city_id`, `city_slug`, `source` (search, feed, deeplink, country_hub) |
| `hub_city_category_tapped` | `city_id`, `category_slug` |
| `hub_city_premium_tapped` | `city_id`, `itinerary_id`, `is_locked` |
| `hub_city_poi_tapped` | `city_id`, `poi_id`, `section` (must_see, recommended) |
| `hub_city_affiliate_tapped` | `city_id`, `partner_id`, `slot` (tourist_pass, experience), `item_id` |
| `hub_city_map_cta_tapped` | `city_id` |
| `hub_city_shared` | `city_id` |

## Contrat API cible (provisoire — non implémenté)

Endpoint suggéré pour évolution backend :

```
GET /api/v1/cities/:slugOrId/hub
```

Réponse minimale (DTO provisoire) :

```json
{
  "id": "uuid",
  "slug": "paris",
  "name": "Paris",
  "subtitle": "12 guides audio · 4 parcours",
  "coverImageUrl": "https://…",
  "bbox": { "north": 48.9, "south": 48.8, "east": 2.4, "west": 2.3 },
  "categories": [{ "slug": "highlights", "label": "Les points forts", "itineraryCount": 3 }],
  "featuredPremiumItinerary": { "id": "…", "title": "…", "isLocked": true, "priceLabel": "4,99 €" },
  "mustSeePoiIds": ["…"],
  "recommended": { "type": "poi", "ids": ["…"] },
  "touristPasses": [{ "partnerName": "…", "title": "…", "priceFrom": "62 €", "validityLabel": "2 jours", "affiliateUrl": "…" }],
  "affiliateExperiences": [{ "provider": "GetYourGuide", "title": "…", "priceFrom": "29 €", "externalUrl": "…" }]
}
```

En MVP : données mock locales ; pas d’endpoint dans [api-client-reference.md](./api-client-reference.md) à ce jour.

## Critères d’acceptation

1. **Given** feuille **A2.1** avec carte destination ville **When** tap sur la carte **Then** navigation vers hub **A4.3** avec héros et sections chargées.
2. **Given** hub ville **When** tap tuile « Les points forts » **Then** ouverture **A5.7** filtrée sur la catégorie `highlights`.
3. **Given** itinéraire premium verrouillé **When** tap sur la carte premium **Then** ouverture **A8.3** ; **When** achat réussi **Then** accès **A5.6** avec contenu débloqué.
4. **Given** hub ville **When** tap POI incontournable **Then** navigation **A3.1** avec le bon `poiId`.
5. **Given** hub ville **When** tap CTA « Voir sur la carte » **Then** **A1.1** centrée sur la bbox ville avec les POI de la ville.
6. **Given** pass touristique ou expérience partenaire **When** tap **Then** interstitiel de transparence puis ouverture WebView ou navigateur externe.
7. **Given** slug ville invalide **When** ouverture lien profond **Then** état « Ville introuvable » avec action retour.
8. **Given** mode hors ligne avec cache **When** ouverture hub **Then** sections éditoriales cache visibles ; blocs affiliation masqués ou message explicite.
9. **Given** section incontournables vide **When** rendu hub **Then** section masquée (pas de bloc vide).

## Open questions

- Modèle économique exact : abonnement seul vs achat à l’unité vs les deux sur **A8.3**.
- Liste fermée des catégories d’itinéraires au lancement vs configuration par ville.
- WebView in-app vs Safari / Chrome Custom Tabs pour liens affiliés.
- Persistance du statut premium : compte NOOK obligatoire ou achat invité + restauration.
- Ordre des sections : fixe global ou configurable éditorialement par ville.
