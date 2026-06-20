# A3.1 — Fiche lieu (détail point d'intérêt)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A3.1 |
| Priorité | P0 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.3 ; écrans liés : **A1.4**, **A3.2**, **A3.3**, **A6.5**, **A4.1**, **A2.3** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Design](./DESIGN.md) |

## Résumé

**Utilisateur :** consulter le détail d'un lieu (image, description, guides audio) pour décider d'écouter ou d'ajouter le lieu à un parcours.

**Produit :** convertir l'aperçu carte (**A1.4**) en fiche complète avec intention primaire « écouter un guide » et actions secondaires (favori, partage).

## Utilisateur et contexte

- **Persona / situation :** visiteur ayant repéré un lieu sur la carte ou dans le fil ; souhaite en savoir plus avant de se déplacer ou d'écouter.
- **Contraintes :** debout, une main, réseau variable ; reprise possible après interruption (lecteur **A3.2**).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A1.4** — CTA « Voir la fiche » ; **A4.1**, **A2.3/A2.4**, **A6.5** (favoris) — même route `/place/[id]`. |
| **Sorties** | **A3.2** — tap play sur une piste ou CTA sticky « Écouter le guide » ; **A3.3** — « Ajouter au parcours » (P1, hors MVP implémenté) ; retour écran précédent. |
| **Retour arrière** | Bouton retour en haut à gauche (sur l'image) ; geste OS back = même comportement. |

**Lien profond :** `/place/[id]` — si `id` inconnu : écran « Lieu introuvable » + retour.

## Structure de l'interface

### Hiérarchie visuelle (1 = plus important)

1. **Image de couverture** (héros pleine largeur).
2. **Titre** + métadonnées (catégorie, adresse).
3. **Liste des guides audio** — intention primaire.
4. **Description** (« À propos »).
5. Barre **sticky bas** — CTA « Écouter le guide » (première piste ou piste sélectionnée).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Hero image** | Ancrage visuel | `imageUrl` principale | Hauteur ~300 px ; scrim bas pour contrôles |
| **Barre flottante hero** | Nav + actions | Retour (gauche) ; favori + partage (droite) | Boutons 44×44 pt, fond `canvas`, `elevation.control` — aligné **A1.4** |
| **Badge catégorie** | Contexte | Label taxonomie (ex. « Monument ») | Pill bas-gauche de l'image |
| **Titre** | Identification | `name` | Token `display-lg` |
| **Meta adresse** | Localisation | `address` | Icône pin + `body-sm` / `muted` |
| **Section « Guides audio »** | CTA principal | `audioGuides[]` | Titre `display-md` ; lignes : titre, durée, langue, play |
| **Section « À propos »** | Description | `description` | Corps `body-md` |
| **Barre sticky bas** | CTA persistant | « Écouter le guide » | 48 px min ; safe area ; masquée si aucun guide |

### Ligne guide audio

| Champ | Type | Notes |
|-------|------|-------|
| Titre | texte | Titre éditorial de la piste |
| Durée | secondes → « X min » | Affichage arrondi |
| Langue | code ISO affiché | ex. « FR », « EN » |
| Action | bouton play | Ouvre **A3.2** sur cette piste |

## Interactions et règles

- **Gestes :** scroll vertical sur le contenu ; pas de carousel image en P0 (une couverture).
- **Favori :** toggle local (MVP) ; synchronisation compte **A6.5** ultérieure.
- **Partage :** sheet native OS avec titre + adresse du lieu (pas d'URL profonde obligatoire en MVP).
- **Play :** une piste « active » à la fois ; CTA sticky et ligne liste cohérents.
- **Règle métier :** ordre des guides = `order` croissant côté API ; mock : ordre du tableau.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Chargement** | Navigation vers fiche, données async | Skeleton hero + 2 lignes | — |
| **Contenu OK** | Données lieu disponibles | Fiche complète | Play, favori, partage |
| **Sans audio** | `audioGuides` vide | Message « Aucun guide audio disponible pour ce lieu pour le moment. » | Pas de CTA sticky play |
| **Lieu introuvable** | `id` invalide | Titre + message + retour | Retour |
| **Erreur réseau** | Échec fetch (futur API) | Bannière + réessayer | « Réessayer » |
| **Hors ligne** | Pas de réseau | Texte + image cache si dispo | « Réessayer » |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| CTA sticky | « Écouter le guide » |
| Section audio | « Guides audio » |
| Section description | « À propos » |
| Vide audio | « Aucun guide audio disponible pour ce lieu pour le moment. » |
| Lieu introuvable | « Ce lieu n'existe pas ou n'est plus disponible. » |
| Partage (message) | « Découvrez {name} sur NOOK — {address} » |
| Favori actif | « Retirer des favoris » / inactif : « Ajouter aux favoris » |
| Retour | « Retour » |

**Ton :** clair, orienté action ; pas de jargon technique.

## Accessibilité

- Labels explicites sur retour, favori, partage, chaque piste (inclure titre + durée).
- Ordre de focus : retour → favori → partage → titre → liste audio → description → CTA sticky.
- Contraste : boutons hero sur fond opaque `canvas`, pas de texte seul sur photo sans scrim.
- Cibles tactiles ≥ 44×44 pt.

## Indicateurs et analytics (si applicable)

| Événement | Moment |
|-----------|--------|
| `place_detail_view` | Ouverture fiche (`place_id`, `source`) |
| `place_favorite_toggle` | Tap cœur |
| `place_share` | Partage réussi |
| `audio_guide_play_tap` | Tap play (piste id) |
| `place_not_found` | Id invalide |

## Critères d'acceptation

1. **Étant donné** un lieu affiché en **A1.4**, **quand** l'utilisateur tape « Voir la fiche », **alors** **A3.1** s'ouvre avec l'image, le titre, la description et les guides du lieu.
2. **Étant donné** **A3.1** avec au moins un guide, **quand** l'utilisateur tape play sur une piste, **alors** la piste est marquée active et le flux **A3.2** peut être amorcé (MVP : état visuel + même handler que le CTA sticky).
3. **Étant donné** **A3.1** ouvert, **quand** l'utilisateur tape retour, **alors** il revient à l'écran précédent (carte avec **A1.4** si applicable).
4. **Étant donné** un lieu sans guide audio, **quand** la fiche s'affiche, **alors** la section audio montre le message vide et la barre sticky play est absente.
5. **Étant donné** un `id` inconnu dans l'URL, **quand** la route est résolue, **alors** l'état « Lieu introuvable » s'affiche avec action retour.

## Open questions

- **Note / popularité** (token `rating-display`) : afficher en P0 ou reporter ?
- **Distance** depuis la position utilisateur : calcul live ou texte statique en mock ?
- **Ajouter au parcours** (**A3.3**) : bouton secondaire sous le CTA sticky ou entrée dans le menu partage ?
- **Carousel** d'images multiples (**B4**) : hors P0 ; une seule couverture suffit pour le MVP.

---

*Implémentation MVP : route `app/place/[id].tsx`, mocks `constants/mockPlaces.ts`, composants `components/place/`.*
