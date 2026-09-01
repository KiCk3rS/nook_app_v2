# B9.1 — Admin : ancrage carte → Wikipedia → POI

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | **B9.1** (extension de **B9**) |
| Priorité | Admin / Évolution terrain |
| Plateforme | Mobile iOS et Android (Expo) — `role: ADMIN` |
| Dépendances | **B9**, **A1.1**, **A3.1** ; tâche [T28](./integration/T28-admin-carte-ancrage-poi.md) |
| Document lié | [B9](./ecran-B9-admin-wikipedia-poi-audio.md) · [T28](./integration/T28-admin-carte-ancrage-poi.md) |

## Résumé

**Utilisateur (admin) :** poser un point sur la carte (ou utiliser sa position), voir les articles Wikipedia à proximité, créer le POI à cet emplacement — sans chercher le nom à la main dans Wikipedia puis dans NOOK.

**Produit :** inverser le flux B9 (carte d’abord, Wikipedia ensuite) pour la production de contenu sur le terrain.

## Utilisateur et contexte

- **Persona :** éditeur NOOK devant un monument, une église, un site archéologique non encore dans le catalogue.
- **Contraintes :** une main, réseau mobile variable, GPS imprécis (5–30 m), soleil sur l’écran, bruit ambiant.

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A1.1** — long-press carte (admin) **ou** bouton « Ajouter un lieu » → onglet « Près d’ici » |
| **Sorties** | POI créé → **A3.1** ; option audio → T26 ; annulation → carte avec pin conservé ou effacé |
| **Retour arrière** | Ferme la feuille ; ne crée pas de POI ; pin conservé sauf « Annuler le point » |

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. Pin sur la carte (marqueur distinct des POI catalogue).
2. Liste des candidats Wikipedia proches (titre + distance).
3. CTA « Créer le lieu » (après sélection).
4. Contrôle rayon de recherche + bascule « Rechercher » (flux B9 texte).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Pin ancrage** | Position physique | `lat`, `lng` WGS84 | Draggable ; icône différente des marqueurs catalogue ; z-index au-dessus |
| **Long-press carte** | Entrée rapide | Coordonnées du press | Haptic léger (iOS) ; ignoré pour USER |
| **Segmented control** | Mode feuille | `Près d’ici` \| `Rechercher` | Défaut = dernier mode ou `nearby` si entrée long-press |
| **Libellé ancre** | Contexte | `anchor.label` (reverse-geocode) | « Près de : … » ; masqué si null |
| **Stepper rayon** | Affiner recherche | 100–2000 m, pas 50 | Défaut 300 m ; label « Rayon : 300 m » |
| **Carte résultat nearby** | Sélection | titre, description?, distance, miniature? | Badge distance ; une sélection active |
| **Bandeau doublon** | Prévention | `existingNearbyPois` | « Un lieu existe déjà à ~40 m : Tour Eiffel » ; liens ouvrent A3.1 ; **non bloquant** |
| **État vide nearby** | Guidage | Aucun candidat wiki | « Aucun article Wikipedia à proximité. Essaie d’élargir le rayon ou recherche par nom. » |
| **Confirmation** | Preview | Article + « Position : point sur la carte » | Coords override ; note brouillon DRAFT |
| **Succès** | Continuité | Identique B9 | CTA audio + voir fiche |

## Interactions et règles

### Gestes

- **Long-press** carte (admin) : pose le pin au point pressé.
- **Drag** pin : met à jour l’ancre ; refetch nearby après debounce 400 ms.
- **Tap** « Ma position » (optionnel Phase 1) : centre le pin sur GPS si permission accordée.
- **Tap** résultat : sélection → confirmation.

### Chargements / validations

- Spinner liste pendant `GET /admin/wikipedia/nearby`.
- CTA création désactivé sans sélection.
- Pendant `POST from-wikipedia` : overlay (identique B9).

### Règles métier

- Coordonnées envoyées à la création = **position du pin**, pas les coords wiki (sauf si pas de pin actif — flux recherche pur B9).
- Même filtre candidats que B9 (coords + média + denylist P31).
- Doublon &lt; 75 m : alerte informative ; l’admin peut quand même créer (cas sous-POI, correction).
- Fermeture feuille : pin **conservé** pour ajustement ; bouton « Annuler le point » sur la carte efface le pin.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Pas de pin** | Ouverture via bouton + | Onglet nearby : invitation « Appuie longuement sur la carte ou utilise ta position » | Long-press / GPS |
| **Pin posé** | Long-press ou GPS | Marqueur + feuille nearby | Drag, élargir rayon |
| **Chargement nearby** | Pin ou rayon change | Skeleton liste | — |
| **Candidats** | 200 + items | Liste triée distance | Sélectionner |
| **Vide** | 200 items=[] | Message + CTA « Rechercher par nom » | Basculer onglet search |
| **Doublon** | existingNearbyPois | Bandeau ambre | Voir fiche existante / continuer |
| **Erreur API** | 5xx / timeout | Message + réessayer | Retry |
| **Confirm + création** | Identique B9 | + ligne position carte | Créer |
| **Succès** | 201 | Identique B9 | Audio / fiche |

## Contenus et microcopy (FR)

| Clé i18n | Texte proposé |
|----------|----------------|
| `tabNearby` | Près d’ici |
| `tabSearch` | Rechercher |
| `nearbySheetTitle` | Lieux à proximité |
| `nearbyHint` | Place un point sur la carte ou fais un appui long pour chercher des articles Wikipedia autour. |
| `anchorLabel` | Près de : {{label}} |
| `radiusLabel` | Rayon : {{meters}} m |
| `distanceBadge` | {{meters}} m |
| `duplicateWarning` | Un lieu existe déjà à environ {{meters}} m : « {{title}} » |
| `duplicateViewExisting` | Voir la fiche |
| `nearbyEmpty` | Aucun article Wikipedia à proximité. Élargis le rayon ou recherche par nom. |
| `confirmMapPosition` | Position : point placé sur la carte |
| `clearPin` | Annuler le point |
| `useMyLocation` | Ma position |

Ton : opérationnel, court, français (EN miroir dans `en/adminAddPlace.json`).

## Accessibilité

- Long-press : alternative bouton « Placer un point au centre de la carte » (accessibilité moteur).
- Pin : `accessibilityLabel` « Point de création de lieu, déplaçable ».
- Liste : annonce distance + titre ; cibles ≥ 44 pt.
- Bandeau doublon : rôle `alert` sans bloquer le flux.

## Indicateurs et analytics

| Événement | Payload (sans PII) |
|-----------|-------------------|
| `admin_map_pin_placed` | `source: long_press \| gps \| map_center` |
| `admin_wiki_nearby_search` | `radiusMeters`, `resultCount`, `hasDuplicates` |
| `admin_wiki_nearby_empty` | `radiusMeters` |
| `admin_poi_created_from_map` | `hadPinOverride: true`, `distanceToWikiCoordsMeters?` |

## Critères d’acceptation

1. **Given** un `USER`, **When** il long-press la carte, **Then** aucun pin admin n’apparaît.
2. **Given** un `ADMIN` avec pin sur la Tour Eiffel, **When** la feuille nearby charge, **Then** « Tour Eiffel » apparaît en tête avec distance &lt; 100 m.
3. **Given** une sélection + pin, **When** l’admin crée le lieu, **Then** le POI a `lat`/`lng` du pin (vérifier via `GET /admin/pois/:id` ou carte).
4. **Given** un POI existant à &lt; 75 m, **When** nearby charge, **Then** le bandeau doublon s’affiche et la création reste possible.
5. **Given** aucun candidat wiki, **When** l’état vide s’affiche, **Then** l’admin peut basculer vers la recherche texte B9 sans perdre le pin.
6. **Given** création réussie, **When** l’admin revient à la carte, **Then** le pin admin est effacé.

## Open questions

- [ ] Bouton « Ma position » en Phase 1 ou Phase 2 ?
- [ ] Édition pin sur l’écran confirmation (mini-carte) : Phase 2 ?
- [ ] Seuil doublon 75 m : ajustable par produit ?

## Références

- [B9](./ecran-B9-admin-wikipedia-poi-audio.md)
- [T28](./integration/T28-admin-carte-ancrage-poi.md)
