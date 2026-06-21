# A5.1 — Liste des parcours enregistrés

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A5.1 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.5, §3.6 ; écrans liés : **A6.4**, **A6.1**, **A5.5**, **A5.4**, **A3.1**, **A1.1** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Guidage A5.5](./ecran-A5.5-mode-guidage.md) · [Profil A6.4](./ecran-A6.4-profil.md) · [API client](./api-client-reference.md) |

## Résumé

**Utilisateur :** retrouver les parcours associés à son compte et reprendre une visite sur le terrain.

**Produit :** liste des parcours personnels (≠ itinéraires éditoriaux **A5.6**) ; hub de reprise vers guidage **A5.5** et vue carte **A5.4** ; nécessite authentification. **Hors périmètre actuel :** création et édition de parcours in-app.

## Utilisateur et contexte

- **Persona / situation :** visiteur connecté qui veut relancer un parcours depuis son espace compte.
- **Contraintes :** liste potentiellement longue ; réseau variable ; distinction claire parcours utilisateur vs contenu éditorial NOOK.

## Distinction parcours utilisateur vs itinéraire éditorial

| Aspect | Parcours utilisateur (**A5.1**) | Itinéraire éditorial (**A5.6**) |
|--------|-----------------------------------|----------------------------------|
| Source | `GET /api/v1/itineraries` | Hub ville, découverte |
| Création in-app | Hors périmètre actuel | Équipe NOOK |
| Édition | Hors périmètre actuel | Lecture seule |
| Guidage | **A5.5** `sourceType: user` | **A5.5** `sourceType: editorial` |
| Auth | Obligatoire | Contenu public / premium |

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A6.4** — « Mes parcours » ; deep link `/itineraries` (optionnel). |
| **Sorties** | **A5.5** — « Suivre le parcours » ; **A5.4** — vue carte ; **A3.1** — tap étape depuis aperçu ; **A6.1** — si non connecté ; **A1.1** — CTA « Explorer la carte » (état vide). |
| **Retour arrière** | Bouton retour → **A6.4** ; geste OS back = écran précédent. |

**Garde d'entrée :** non authentifié → **A6.1** avec `returnTo` liste parcours.

## Structure de l'interface

### Hiérarchie visuelle (1 = plus important)

1. **Liste des parcours** — cartes ordonnées (récent en premier par défaut).
2. **État vide** — invitation à explorer les itinéraires éditoriaux.
3. **Actions par carte** — suivre, supprimer (niveau 2).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Header** | Navigation | Titre « Mes parcours », retour | Retour vers **A6.4** |
| **Carte parcours** | Item liste | `id`, `title`, `stepCount`, `estimatedDurationMinutes?`, `coverImageUrl?` (1er POI) | Tap → détail rapide ou **A5.5** selon produit (open question) |
| **Métadonnées carte** | Contexte | « {n} étapes · {durée} » | Durée formatée « 1 h 30 » ou « 45 min » |
| **CTA carte « Suivre »** | Action primaire | — | Accès direct **A5.5** |
| **Menu contextuel carte** | Actions secondaires | Voir sur la carte, Supprimer | Swipe ou icône « … » ; 44×44 pt |
| **État vide** | Onboarding | Illustration + texte | CTA « Explorer la carte » ou « Découvrir les parcours » |
| **Modale suppression** | Confirmation | Titre parcours | Destructif ; « Supprimer » / « Annuler » |

### Données carte parcours (API)

Champs attendus depuis `GET /api/v1/itineraries` (liste) :

| Champ | Type | Affichage |
|-------|------|-----------|
| `id` | uuid | — |
| `title` | string | Titre carte |
| `stepCount` ou `poiIds.length` | number | « {n} étapes » |
| `estimatedDurationMinutes` | number? | Durée estimée |
| `distanceMeters` | number? | Optionnel sous-titre |
| `updatedAt` | ISO? | Tri par défaut |
| `coverImageUrl` | string? | Vignette ; fallback image 1er POI |

## Interactions et règles

- **Chargement liste :** `GET /api/v1/itineraries` avec pagination si > 20 items (`limit`, `offset` — DTO query).
- **Tri par défaut :** `updatedAt` desc (plus récemment modifié en tête) ; open question tri alternatif (alpha, date création).
- **Tap carte :** MVP — ouverture **A5.5** guidage si ≥ 2 étapes ; sinon message « Ce parcours ne peut pas être démarré » (parcours incomplet).
- **Voir sur la carte :** **A5.4** ou **A1.1** avec tracé parcours (`itineraryId`).
- **Supprimer :** `DELETE /api/v1/itineraries/:id` → 204 ; retrait optimiste de la liste ; toast « Parcours supprimé ».
- **Pull-to-refresh :** recharge liste.
- **Compteur profil :** **A6.4** affiche `savedRoutesCount` = longueur liste (ou total paginé).
- **Parcours < 2 POI :** API refuse création (≥ 2 POI publiés) ; liste peut afficher brouillon incomplet avec badge « Incomplet » si métier le permet (open question).

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Non authentifié** | Pas de token | Redirect **A6.1** | Connexion |
| **Chargement** | Entrée écran | Skeleton 3 cartes | — |
| **Liste OK** | 200, items > 0 | Liste scrollable | Suivre, supprimer |
| **Vide** | 200, items = 0 | Illustration + invitation | Explorer carte, découvrir parcours |
| **Erreur réseau** | Fetch échoue | Bannière + réessayer | Réessayer |
| **Session expirée** | 401 | Redirect **A6.1** + toast | Reconnexion |
| **Suppression — confirmation** | Action supprimer | Modale | Confirmer / Annuler |
| **Suppression — en cours** | Confirm | Item en loading ou overlay | — |
| **Pagination** | Scroll fin liste | Indicateur chargement | Charger plus |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre écran | « Mes parcours » |
| CTA suivre | « Suivre le parcours » |
| Voir carte | « Voir sur la carte » |
| Supprimer | « Supprimer » |
| Modale suppression titre | « Supprimer ce parcours ? » |
| Modale suppression corps | « « {title} » sera définitivement supprimé. » |
| Modale confirmer | « Supprimer » |
| Modale annuler | « Annuler » |
| État vide titre | « Aucun parcours pour l'instant » |
| État vide corps | « Explorez la carte ou les parcours NOOK pour commencer. » |
| État vide CTA | « Explorer la carte » |
| Badge incomplet | « Incomplet » |
| Toast supprimé | « Parcours supprimé » |
| Erreur chargement | « Impossible de charger vos parcours. » |
| Parcours trop court | « Ce parcours ne peut pas être démarré pour l'instant. » |
| Étapes | « {n} étapes » |
| Durée | « {h} h {m} min » / « {m} min » |

**Ton :** encourageant ; oriente vers la découverte éditoriale si liste vide.

## Accessibilité

- Titre annoncé : « Mes parcours ».
- Carte : « {title}, {n} étapes, {durée} » ; boutons actions nommés explicitement.
- Swipe actions : alternatives via menu « Plus d'actions ».
- Modale suppression : focus piégé.
- Cibles ≥ 44×44 pt ; contraste WCAG AA.

## Indicateurs et analytics

| Événement | Paramètres (sans PII) |
|-----------|------------------------|
| `itineraries_list_viewed` | `count` |
| `itinerary_card_tapped` | `itinerary_id`, `action` (open, follow) |
| `itinerary_map_tapped` | `itinerary_id` |
| `itinerary_delete_requested` | `itinerary_id` |
| `itinerary_delete_confirmed` | `itinerary_id` |
| `itineraries_list_empty_cta` | `cta` (explore_map, discover) |

## Contrat API (existant)

| Méthode | Chemin | Usage |
|---------|--------|-------|
| GET | `/api/v1/itineraries` | Liste **A5.1** |
| GET | `/api/v1/itineraries/:id` | Détail (preview ou **A5.5**) |
| DELETE | `/api/v1/itineraries/:id` | Suppression |

**Hors périmètre app actuel :** `POST` / `PATCH` (création et édition de parcours).

**Exemple item liste (schéma indicatif)**

```json
{
  "id": "uuid",
  "title": "Balade du dimanche",
  "stepCount": 4,
  "estimatedDurationMinutes": 120,
  "distanceMeters": 5000,
  "updatedAt": "2026-06-01T10:00:00Z"
}
```

## Critères d'acceptation

1. **Given** utilisateur connecté **A6.4** **When** tap « Mes parcours » **Then** ouverture **A5.1** avec liste chargée via `GET /itineraries`.
2. **Given** liste avec parcours **When** tap « Suivre le parcours » **Then** navigation **A5.5** (`sourceType: user`, bon `itineraryId`).
3. **Given** liste vide **When** affichage **Then** état vide avec CTA explorer ; pas de liste fantôme ; pas de CTA création.
4. **Given** parcours en liste **When** suppression confirmée **Then** `DELETE` 204, item retiré, toast succès.
5. **Given** utilisateur anonyme **When** accès **A5.1** **Then** redirect **A6.1** avec retour post-auth vers liste.
6. **Given** parcours **When** tap « Voir sur la carte » **Then** **A1.1** ou **A5.4** avec tracé du parcours.
7. **Given** erreur réseau **When** chargement **Then** bannière + « Réessayer ».
8. **Given** profil **A6.4** **When** compteur parcours affiché **Then** cohérent avec nombre d'items liste (hors pagination).

## Open questions

- **Tap carte** : ouvre guidage direct (**A5.5**) ou écran détail intermédiaire (preview + actions) ?
- **Parcours incomplet** (< 2 POI) : affichés en liste ou filtrés ?
- **Pagination** : seuil d'activation (20+ items) ?
- **Tri utilisateur** : manuel ou fixe `updatedAt` ?
- **Partage parcours** : lien profond vers parcours d'un ami (hors P1) ?
- **Sync offline** : liste cache hors ligne pour utilisateur connecté ?
