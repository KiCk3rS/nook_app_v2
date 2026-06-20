# A5.6 — Détail itinéraire éditorial

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A5.6 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.5 ; écrans liés : **A4.3**, **A5.7**, **A5.5** (référence guidage), **A5.2** (copie parcours), **A3.1**, **A1.1**, **A3.2**, **A8.3** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Hub ville A4.3](./ecran-A4.3-hub-ville.md) · [Brief](./brief.md) |

## Résumé

**Utilisateur :** consulter un parcours curaté par NOOK (étapes, durée, carte) et le suivre sur place avec les guides audio.

**Produit :** fiche itinéraire éditorial distincte des parcours utilisateur (**A5.5**) ; supporte le contenu premium payant et la conversion vers parcours personnel.

## Utilisateur et contexte

- **Persona / situation :** visiteur ayant choisi un thème ou un itinéraire premium depuis le hub ville ; veut comprendre le déroulé avant de démarrer.
- **Contraintes :** usage en déplacement ; reprise possible après interruption ; contenu partiellement verrouillé si premium non acheté.

## Distinction A5.5 (utilisateur) vs A5.6 (éditorial)

| Aspect | A5.5 Parcours utilisateur | A5.6 Itinéraire éditorial |
|--------|---------------------------|---------------------------|
| Source | API `GET /api/v1/itineraries` (auth) | Contenu éditorial / futur API publique |
| Édition | **A5.2** création / modification | Lecture seule |
| Premium | N/A | Paywall **A8.3** sur contenu selon règle produit |
| Guidage | Mode pas-à-pas complet | Idem ; étapes / audio peuvent être verrouillées |
| Persistance | Compte utilisateur | Déblocage premium lié au compte / achat |

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A4.3** — carte premium ou reco ; **A5.7** — tap ligne ; lien profond `/city/[slug]/itinerary/[id]`. |
| **Sorties** | **A3.1** — tap étape (POI) ; **A1.1** — « Voir sur la carte » (tracé) ; **A3.2** — lecture audio étape ; **A8.3** — déblocage premium ; **A5.2** — « Enregistrer dans mes parcours » (copie). |
| **Retour arrière** | Bouton retour héros ; geste OS back → écran précédent (**A4.3** ou **A5.7**). |

**Lien profond :** `/city/[slug]/itinerary/[id]` — id inconnu → état introuvable.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Héros** — image itinéraire, titre, badge catégorie / premium.
2. **Résumé** — durée, distance, difficulté, nombre d’étapes.
3. **CTA principal** — « Démarrer le parcours » ou « Débloquer » (premium verrouillé).
4. **Liste des étapes** — POI ordonnés avec aperçu.
5. **Mini-carte ou aperçu tracé** — lien vers carte plein écran.
6. **Action secondaire** — « Enregistrer dans mes parcours ».

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Héros image** | Ancrage | `coverImageUrl`, `title` | Aligné pattern **A3.1** |
| **Barre flottante héros** | Nav | Retour, partage, favori itinéraire (évolution) | 44×44 pt |
| **Badges** | Contexte | Catégorie, « Premium », « Débloqué » | — |
| **Bloc résumé** | Métadonnées | `durationMinutes`, `distanceMeters`, `difficulty`, `stepCount` | Icônes + labels compacts |
| **CTA sticky bas** | Action primaire | Démarrer / Débloquer | Masqué si état introuvable |
| **Liste étapes** | Contenu | `steps[]` : ordre, `poiId`, `name`, `thumbnail`, `audioDuration?`, `isLocked?` | Numérotation 1…n ; cadenas sur étape verrouillée |
| **Aperçu carte** | Spatial | Mini-map statique ou thumbnail tracé | Tap → **A1.1** mode parcours **A5.4** |
| **Enregistrer** | Conversion | Copie vers parcours user | Secondaire ; requiert auth **A6.1** |

### Étape (détail ligne)

| Champ | Type | Notes |
|-------|------|-------|
| `order` | number | Affiché en badge |
| `poiId` | string | Lien **A3.1** si débloqué |
| `name` | string | Titre POI |
| `isLocked` | boolean | Premium : titre flouté ou « Étape verrouillée » |
| `audioAvailable` | boolean | Icône casque si guide dispo |

## Interactions et règles

- **Démarrer le parcours :** si premium verrouillé → **A8.3** ; sinon lance mode guidage (comportement aligné **A5.5** : étape courante, accès audio **A3.2**).
- **Tap étape débloquée :** navigation **A3.1** ; retour conserve position dans l’itinéraire.
- **Tap étape verrouillée :** **A8.3** avec contexte.
- **Enregistrer dans mes parcours :** POST copie des `poiIds` ordonnés vers API `/itineraries` (**A5.2**) ; toast confirmation ; redirect **A5.1** optionnel.
- **Partage :** titre itinéraire + lien profond.
- **Cohérence carte :** tracé **A1.1** = même ordre d’étapes que la liste (brief §3.2).

### Règles premium (contenu verrouillé)

| Élément | Comportement si verrouillé |
|---------|----------------------------|
| Aperçu héros + résumé | Visible (teaser) |
| Étapes 1–2 | Visibles en entier (freemium — à confirmer produit) |
| Étapes suivantes | Titres masqués ou floutés ; tap → **A8.3** |
| Audio | Non jouable ; CTA « Débloquer » |
| Guidage complet | Bloqué jusqu’à déblocage |

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Chargement** | Navigation | Skeleton héros + 3 étapes | — |
| **Contenu OK (gratuit ou débloqué)** | Accès complet | Fiche + CTA « Démarrer » | Guidage, POI, carte |
| **Premium verrouillé** | `isLocked === true` | Teaser + étapes partielles | CTA « Débloquer » → **A8.3** |
| **Intrrouvable** | `id` invalide | Message + retour | Retour |
| **Erreur / hors ligne** | Fetch échoué | Bannière ; cache partiel si dispo | Réessayer |
| **Copie en cours** | « Enregistrer » tap | Indicateur | Succès toast ou erreur auth |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| CTA démarrer | « Démarrer le parcours » |
| CTA débloquer | « Débloquer ce parcours » |
| Section étapes | « Étapes » |
| Étape verrouillée | « Étape verrouillée » |
| Enregistrer | « Enregistrer dans mes parcours » |
| Toast enregistré | « Parcours ajouté à votre liste » |
| Erreur auth enregistrer | « Connectez-vous pour enregistrer ce parcours » |
| Voir carte | « Voir sur la carte » |
| Intrrouvable | « Ce parcours n’existe pas ou n’est plus disponible. » |
| Difficulté | « Facile » / « Modéré » / « Difficile » |

## Accessibilité

- Titre d’écran : « Parcours {title} ».
- CTA sticky annoncé avec état (« Débloquer — premium » vs « Démarrer le parcours »).
- Étapes : « Étape {n} sur {total}, {name}{, verrouillée} ».
- Cibles ≥ 44 pt.

## Indicateurs et analytics

| Événement | Paramètres |
|-----------|------------|
| `editorial_itinerary_viewed` | `itinerary_id`, `city_id`, `is_locked`, `category_slug?` |
| `editorial_itinerary_start_tapped` | `itinerary_id`, `is_locked` |
| `editorial_itinerary_step_tapped` | `itinerary_id`, `poi_id`, `step_order`, `is_locked` |
| `editorial_itinerary_save_tapped` | `itinerary_id`, `success` |
| `editorial_itinerary_map_tapped` | `itinerary_id` |

## Critères d’acceptation

1. **Given** liste **A5.7** **When** tap itinéraire gratuit **Then** fiche **A5.6** avec toutes étapes visibles et CTA « Démarrer ».
2. **Given** itinéraire premium verrouillé **When** ouverture **A5.6** **Then** teaser visible et CTA « Débloquer » ; étapes verrouillées non accessibles.
3. **Given** achat réussi via **A8.3** **When** retour **A5.6** **Then** contenu débloqué sans rechargement manuel.
4. **Given** étape débloquée **When** tap **Then** navigation **A3.1**.
5. **Given** utilisateur connecté **When** « Enregistrer dans mes parcours » **Then** parcours copié visible dans **A5.1**.
6. **Given** utilisateur non connecté **When** « Enregistrer » **Then** redirection **A6.1** ou message explicite.
7. **Given** fiche chargée **When** « Voir sur la carte » **Then** **A1.1** avec tracé des étapes.

## Open questions

- Nombre d’étapes visibles en freemium avant paywall (0, 1, 2 ?).
- Favori itinéraire éditorial : P1 ou P2 ?
- Mode guidage **A5.5** : réutilisation composant unique ou écran dédié avec flag `editorial` ?
