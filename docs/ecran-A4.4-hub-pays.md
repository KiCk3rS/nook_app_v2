# A4.4 — Hub pays (vitrine territoriale — évolution)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A4.4 |
| Priorité | P2 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.4, §3.5 ; **pattern commun [A4.3](./ecran-A4.3-hub-ville.md)** ; écrans liés : **A4.3**, **A5.6**, **A5.7**, **A8.3** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Hub ville A4.3](./ecran-A4.3-hub-ville.md) · [Brief](./brief.md) |

## Résumé

**Utilisateur :** explorer un pays dans son ensemble — villes à visiter, itinéraires transverses, pass touristiques et expériences à l’échelle nationale.

**Produit :** extension du hub ville (**A4.3**) à l’échelle pays ; réutilise le même gabarit vitrine avec des sections spécifiques (grille de villes, road trips).

## Pattern commun avec A4.3

Les sections suivantes sont **identiques** au hub ville — se référer à [ecran-A4.3-hub-ville.md](./ecran-A4.3-hub-ville.md) pour le détail (composants, états, analytics, affiliation, premium) :

- En-tête héros (photo, nom, stats)
- CTA « Voir sur la carte » (bbox pays)
- Catégories d’itinéraires → **A5.7**
- Bloc itinéraire premium → **A5.6** / **A8.3**
- POI incontournables (national/regional)
- Recommandé pour vous
- Pass touristiques (affiliation)
- Expériences (affiliation)

**Règles transverses inchangées :** transparence partenaires, cohérence carte/liste, itinéraires éditoriaux vs parcours utilisateur, états chargement / erreur / hors ligne.

## Utilisateur et contexte

- **Persona / situation :** voyageur planifiant un séjour multi-villes ou un road trip ; arrive depuis le fil, la recherche ou un lien partagé.
- **Contraintes :** même que **A4.3** ; contenu plus volumineux (plus de villes, itinéraires longs).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A4.1** — section pays ; **A2.1** — résultat recherche pays (évolution) ; lien profond `/country/[slug]`. |
| **Sorties** | **A4.3** — tap ville ; **A5.7**, **A5.6**, **A8.3**, **A3.1**, **A1.1**, affiliation — comme **A4.3**. |
| **Retour arrière** | Bouton retour héros ; geste OS back. |

**Lien profond :** `/country/[slug]` — slug inconnu → état introuvable.

## Structure de l’interface — deltas pays vs ville

### Hiérarchie visuelle (1 = plus important)

1. **Héros pays** — photo, nom du pays, stats nationales (ex. « 24 villes · 18 parcours »).
2. **CTA « Voir sur la carte »** — bbox pays entier.
3. **Villes à explorer** — **spécifique pays** ; grille de cartes ville → **A4.3**.
4. **Catégories d’itinéraires transverses** — road trip, régions, nature, etc.
5. **Bloc itinéraire premium national** — ex. « Tour de France culturel ».
6. **Incontournables** — POI iconiques multi-régions.
7. **Recommandé pour vous**
8. **Pass touristiques** — pass nationaux ou multi-villes (partenaires tourisme).
9. **Expériences** — activités multi-villes.

### Zones spécifiques pays

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Section villes** | Navigation territoriale | `cities[]` : `slug`, `name`, `coverImageUrl`, `poiCount?` | Grille 2 colonnes ; tap → **A4.3** |
| **Catégories transverses** | Itinéraires nationaux | Slugs ex. `road-trip`, `regions`, `coast`, `mountains` | Labels éditoriaux ; tap → **A5.7** avec contexte `countryId` |
| **Stats héros** | Contexte | `cityCount`, `itineraryCount`, `poiCount` | Sous-titre sous le nom du pays |

### Catégories transverses de référence (pays)

| Slug | Label proposé |
|------|---------------|
| `road-trip` | Road trip |
| `regions` | Par région |
| `highlights` | Incontournables du pays |
| `nature` | Nature et grands espaces |
| `heritage` | Patrimoine |

## Interactions et règles (spécifiques)

- **Tap ville :** navigation **A4.3** avec `citySlug` ; conserver `countrySlug` dans la pile pour retour cohérent pays → ville.
- **A5.7 / A5.6 :** paramètre `countryId` en plus de `cityId` lorsque l’itinéraire est national (sans ville unique).
- **Carte **A1.1** : bbox pays ; filtre POI optionnel par ville si sélection préalable.

## États

Reprendre le tableau d’états **A4.3** en remplaçant « ville introuvable » par « pays introuvable » et en ajoutant :

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Sans villes indexées** | `cities.length === 0` | Section villes masquée | Itinéraires nationaux restent accessibles |

## Contenus et microcopy (delta)

| Contexte | Texte |
|----------|-------|
| Section villes | « Villes à explorer » |
| Stats héros | « {n} villes · {m} parcours » |
| Pays introuvable | « Ce pays n’existe pas ou n’est plus disponible. » |
| Carte CTA | « Voir le pays sur la carte » |

Les autres libellés : voir **A4.3**.

## Accessibilité

- Titre d’écran : « Hub {pays} ».
- Carte ville : « Explorer {ville}, {poiCount} lieux ».

## Indicateurs et analytics (delta)

| Événement | Paramètres |
|-----------|------------|
| `hub_country_viewed` | `country_id`, `country_slug`, `source` |
| `hub_country_city_tapped` | `country_id`, `city_id` |

Événements communs hub (catégories, premium, affiliation) : reprendre **A4.3** avec `country_id` en paramètre additionnel.

## Critères d’acceptation

1. **Given** hub pays **When** tap ville **Then** navigation **A4.3** avec la bonne ville.
2. **Given** hub pays **When** tap catégorie « Road trip » **Then** **A5.7** avec itinéraires nationaux filtrés.
3. **Given** slug pays invalide **When** lien profond **Then** état introuvable + retour.
4. **Given** hub pays chargé **When** retour depuis **A4.3** **Then** retour hub pays (si pile navigation conservée).

## Open questions

- Entrée depuis **A2.1** : recherche unifiée ville + pays ou onglets séparés ?
- Profondeur navigation : pays → ville → itinéraire — limite de pile ou onglets ?
- API : `GET /api/v1/countries/:slug/hub` — structure miroir de l’endpoint ville **A4.3**.

## Périmètre livraison

- **P2 / évolution** : spec prête pour design ; implémentation après hub ville (**A4.3**) stabilisé.
- Pas de duplication du détail premium / affiliation : source de vérité = **A4.3** + **A8.3** + **A5.6**.
