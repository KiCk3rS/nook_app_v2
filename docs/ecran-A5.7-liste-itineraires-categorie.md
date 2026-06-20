# A5.7 — Liste itinéraires par catégorie

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A5.7 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.5 ; écrans liés : **A4.3** (entrée), **A5.6** (sortie), **A8.3** (premium verrouillé) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Hub ville A4.3](./ecran-A4.3-hub-ville.md) · [Brief](./brief.md) |

## Résumé

**Utilisateur :** parcourir tous les itinéraires éditoriaux d’une catégorie thématique dans une ville choisie.

**Produit :** vue liste filtrée depuis le hub ville ; pont entre la découverte thématique (**A4.3**) et le détail d’un itinéraire curaté (**A5.6**).

## Utilisateur et contexte

- **Persona / situation :** visiteur ayant tapé une tuile « Les points forts », « Les secrets », etc. sur le hub ville ; compare plusieurs parcours avant d’en choisir un.
- **Contraintes :** scroll vertical ; lecture rapide des métadonnées (durée, difficulté, premium).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A4.3** — tap tuile catégorie d’itinéraire. |
| **Sorties** | **A5.6** — tap ligne itinéraire (gratuit ou déjà débloqué) ; **A8.3** — tap itinéraire premium verrouillé. |
| **Retour arrière** | Bouton retour header ; geste OS back → **A4.3** (même ville, position scroll hub non garantie en MVP). |

**Paramètres route :** `/city/[slug]/itineraries/[categorySlug]` ou query `cityId` + `categorySlug`.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Header** — retour + titre catégorie (ex. « Les points forts ») + sous-titre ville.
2. **Liste d’itinéraires** — cartes verticales empilées.
3. **État vide** — si aucun itinéraire dans la catégorie.

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Header** | Contexte | `categoryLabel`, `cityName` | Sous-titre « {ville} » en `body-sm` / `muted` |
| **Ligne itinéraire** | Sélection | Vignette, `title`, `duration`, `stepCount`, `difficulty?`, badge Premium | Chevron droit ; cadenas si verrouillé |
| **État vide** | Absence contenu | Message + lien retour hub | — |

### Ligne itinéraire (détail)

| Champ | Type | Affichage |
|-------|------|-----------|
| `id` | string | — |
| `title` | string | Titre principal |
| `coverImageUrl` | string? | Vignette 72×72 ou ratio 16:9 compact |
| `durationMinutes` | number | « {n} h » ou « {n} min » |
| `stepCount` | number | « {n} étapes » |
| `difficulty` | enum? | Facile / Modéré / Difficile |
| `isPremium` | boolean | Badge « Premium » |
| `isLocked` | boolean | Icône cadenas + prix si applicable |

## Interactions et règles

- **Tri :** (1) `editorialOrder` ascendant ; (2) popularité décroissante ; (3) `id` ascendant (tie-break).
- **Tap ligne :** si `isLocked` → **A8.3** avec contexte itinéraire ; sinon → **A5.6**.
- **Itinéraires éditoriaux uniquement :** pas de mélange avec parcours utilisateur (**A5.1**).
- **Pull-to-refresh :** recharge la liste (futur API) ; N/A mock local.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Chargement** | Navigation | Skeleton 3 lignes | — |
| **Contenu OK** | Liste non vide | Liste scrollable | Tap → A5.6 / A8.3 |
| **Vide** | `items.length === 0` | Message + CTA retour hub | Retour **A4.3** |
| **Erreur** | Échec fetch | Bannière + réessayer | « Réessayer » |
| **Hors ligne** | Pas de réseau + pas de cache | Message hors ligne | Retour ou réessayer |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Sous-titre header | « {ville} » |
| Métadonnées ligne | « {duration} · {stepCount} étapes » |
| Badge premium | « Premium » |
| État vide | « Aucun parcours dans cette catégorie pour le moment. » |
| CTA vide | « Retour à {ville} » |
| Retour | « Retour » |

## Accessibilité

- Titre d’écran : « {categoryLabel} — {ville} ».
- Label ligne : « Itinéraire {title}, {duration}, {stepCount} étapes{, premium verrouillé} ».
- Cibles tactiles ligne ≥ 44 pt hauteur effective.

## Indicateurs et analytics

| Événement | Paramètres |
|-----------|------------|
| `itinerary_category_list_viewed` | `city_id`, `category_slug`, `item_count` |
| `itinerary_category_item_tapped` | `city_id`, `category_slug`, `itinerary_id`, `is_locked` |

## Critères d’acceptation

1. **Given** hub **A4.3** **When** tap « Les secrets » **Then** liste **A5.7** titrée « Les secrets » avec sous-titre ville.
2. **Given** liste avec itinéraires **When** tap ligne non premium **Then** navigation **A5.6**.
3. **Given** ligne premium verrouillée **When** tap **Then** ouverture **A8.3** sans accès contenu.
4. **Given** catégorie sans itinéraire **When** chargement **Then** état vide avec retour hub.
5. **Given** liste chargée **When** retour **Then** navigation **A4.3** même ville.

## Open questions

- Filtres secondaires sur la liste (durée, difficulté) : P1 ou report **A2.2** ?
- Afficher un compteur dans le header (« 3 parcours ») ?
