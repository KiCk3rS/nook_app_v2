# A2.1 — Recherche textuelle (feuille découverte + résultats)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A2.1 (+ A2.3 liste résultats fusionnés) |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.2 ; écrans liés : **A1.1** (déclencheur), **A3.1** (fiche lieu), **A2.4** (carte filtrée — évolution) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Design](./DESIGN.md) |

## Résumé

**Utilisateur :** lancer une recherche de lieu depuis la carte et découvrir des suggestions pertinentes avant même de taper un mot-clé, puis consulter les résultats textuels.

**Produit :** convertir la barre recherche **A1.1** en feuille modale par le bas avec contenu découverte (promu, populaires, teaser) et bascule vers liste de résultats à la saisie — même jeu de lieux que le catalogue mock (futur API).

## Utilisateur et contexte

- **Persona / situation :** visiteur sur la carte qui connaît vaguement un lieu ou explore sans idée précise.
- **Contraintes :** debout, une main, clavier virtuel ; réseau variable (MVP : données locales synchrones).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A1.1** — tap sur la barre « Rechercher un lieu… » ou l’orb loupe. |
| **Sorties** | **A4.3** — tap sur une carte destination **ville** (promu, populaire) ; **A3.1** — tap sur un **POI** (résultat recherche) ; retour **A1.1** (fermeture feuille). |
| **Retour arrière** | Chevron bas, tap scrim, bouton retour Android ; effacer la recherche (×) revient à l’état découverte sans fermer. |

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Barre de recherche** (pill, focus clavier à l’ouverture).
2. **Contenu contextuel** : liste résultats **ou** sections découverte.
3. **Poignée / chevron** de fermeture.

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Chevron fermer** | Sortie | — | 44×44 pt min |
| **Barre recherche** | Saisie | Placeholder « Rechercher un lieu… » | Auto-focus ; bouton × si query non vide |
| **Section promue** | Contenu sponsorisé | 1 carte large + badge « Promu » | Lien « Masquer » (session) ; transparence type annonce |
| **Section populaires** | Inspiration | Carrousel horizontal 4–6 **villes** | Cartes verticales compactes ; tap → **A4.3** |
| **Teaser lieu manquant** | Teaser produit | Texte + « Bientôt disponible » | **Non cliquable** en MVP |
| **Liste résultats** | Recherche active | Vignette, catégorie caps, titre, chevron | Badge « Promu » si applicable |
| **État vide** | Aucun match | Message + suggestion | — |

## Interactions et règles

- **Gestes :** scroll vertical (découverte / résultats) ; scroll horizontal (populaires).
- **Bascule états :** `query.trim().length >= 1` → résultats ; effacer → découverte.
- **Recherche mock :** champs `name`, `address`, `description`, label catégorie ; tri : (1) préfixe `name`, (2) match partiel `name`, (3) autres champs ; tie-break `id` ascendant (brief §3.2).
- **Debounce :** 200 ms sur la saisie.
- **Promu masqué :** state local jusqu’à fermeture de la feuille.
- **Distance promue :** affichée si géoloc accordée (optionnel MVP).

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Découverte** | Ouverture feuille, query vide | Promu, populaires, teaser | Tap destination ville → **A4.3** ; Masquer promu |
| **Résultats** | Query ≥ 1 caractère | Liste filtrée (POI et villes) | Tap POI → **A3.1** ; tap ville → **A4.3** |
| **Aucun résultat** | Query sans match | Message vide | Effacer recherche |
| **Chargement** | N/A MVP (local) | — | — |
| **Erreur / hors ligne** | Futur API | Bannière + réessayer | Documenté pour évolution |
| **Fermé** | Dismiss | Carte A1.1 | — |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Placeholder | « Rechercher un lieu… » |
| Section promue | « Destinations promues » |
| Badge promu | « Promu » |
| Masquer promu | « Masquer » |
| Section populaires | « Destinations populaires » |
| Teaser titre | « Il vous manque un lieu ? » |
| Teaser corps | « Les guides locaux et les autorités peuvent publier du contenu sur NOOK. » |
| Teaser footer | « Bientôt disponible » |
| Vide résultats | « Aucun lieu pour « {query} » » |
| Suggestion vide | « Essayez un autre mot-clé » |
| Fermer | « Fermer la recherche » |
| Effacer | « Effacer la recherche » |

**Ton :** clair, transparent sur le contenu promu ; pas de jargon technique.

## Accessibilité

- `accessibilityViewIsModal` sur le modal.
- Labels : « Fermer la recherche », « Effacer la recherche », « Lieu promu — {name} », « Résultat — {name} », « Proposer un lieu — bientôt disponible ».
- Cibles tactiles ≥ 44 pt ; ordre de focus : fermer → recherche → contenu.

## Indicateurs et analytics (stub)

- `search_sheet_opened`
- `search_query` (longueur bucket, pas le texte brut)
- `search_result_tap` (place_id)
- `promoted_hidden`

## Critères d’acceptation

1. **Given** carte A1.1 **When** tap barre recherche **Then** feuille monte avec découverte (promu, populaires, teaser).
2. **Given** feuille ouverte **When** saisie « Notre » **Then** liste filtrée sans sections découverte.
3. **Given** résultats POI **When** tap ligne **Then** navigation fiche **A3.1** et feuille fermée.
4. **Given** découverte **When** tap destination ville **Then** navigation hub **A4.3** et feuille fermée.
5. **Given** section promue **When** « Masquer » **Then** section absente jusqu’à fermeture feuille.
6. **Given** teaser lieu manquant **Then** visible mais non activable.

## Open questions

- **Afficher à proximité** (réf. SmartGuide) : à traiter avec **A2.4** (carte filtrée / recherche géographique).
- **Persistance « Masquer promu »** : session MVP ; AsyncStorage si produit le demande.
- **Source API promu / populaires** : mock IDs en MVP ; endpoint éditorial futur.
- **Destinations vs POI** : les cartes promues/populaires ciblent des **villes** (**A4.3**) ; la recherche active peut retourner POI (**A3.1**) et villes (**A4.3**) — règle de tri et libellé de type à documenter à l’implémentation.
