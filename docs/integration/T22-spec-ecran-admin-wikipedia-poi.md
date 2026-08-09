# T22 — Spec écran : admin Wikipedia → POI → audio

| | |
|---|---|
| **Dépôt** | `nook_app_v2` (docs) |
| **Durée** | 0,5–1 j |
| **Dépend de** | — |
| **Bloque** | T23, T25, T26 (cadrage UX) |
| **Priorité** | Admin |
| **Features** | F-014, F-015 ; écrans B1 / B3 / B6 |
| **Priorité écran** | Admin — Partie B [`ecrans.md`](../ecrans.md) |
| **Statut** | ✅ terminé — open question lat/lng V1.1 |

## Objectif

Rédiger la **fiche écran / flux** du parcours admin mobile : rechercher un article Wikipedia, créer un POI à partir de la sélection, puis lancer (et suivre) la génération d’un audioguide éditorial — sans implémenter le code dans cette tâche.

## Prérequis

- [x] Skill [`spec-ecran-app`](../../.cursor/skills/spec-ecran-app/SKILL.md) + checklist UX
- [x] Inventaire [`docs/ecrans.md`](../ecrans.md) Partie B (B1, B3, B6) manqué
- [x] Contrat admin existant lu : `POST /admin/pois`, `POST /admin/pois/:poiId/audio-guides/generate` (réf. API)

## Livrable

- [x] Fichier spec dédié : [`docs/ecran-B9-admin-wikipedia-poi-audio.md`](../ecran-B9-admin-wikipedia-poi-audio.md) (ID produit **B9**)
- [x] Mise à jour [`docs/ecrans.md`](../ecrans.md) : ligne B9 + note flux production
- [x] Gabarit skill rempli (toutes sections ; N/A justifié si besoin)

---

# B9 — Admin : Wikipedia → POI → audioguide

> Contenu cible de la fiche `ecran-B9-…` (à finaliser / extraire dans le livrable ci-dessus lors de l’exécution de T22).

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | B9 |
| Priorité | Admin / Évolution |
| Plateforme | Mobile (app NOOK, compte `ADMIN`) |
| Dépendances | Brief §4.1–4.2 ; B1 (auth admin via JWT rôle) ; B3 ; B6 ; A1.1 (entrée carte) ; A3.1 (sortie fiche) ; T23–T26 |

## Résumé

L’opérateur connecté en admin découvre un lieu via Wikipedia, matérialise un POI NOOK, puis lance la génération audio éditoriale. Produit : accélérer la production de contenu sans back-office web séparé pour ce flux minimal.

## Utilisateur et contexte

- Persona : éditeur / ops NOOK sur le terrain ou au bureau, compte `role: ADMIN`.
- Contraintes : usage ponctuel, souvent une main ; réseau variable ; pas d’exposition aux utilisateurs `USER`.

## Navigation

- Arrivée depuis : **A1.1** carte-accueil — contrôle « Ajouter un lieu » visible **uniquement** si `user.role === 'ADMIN'`.
- Sorties :
  - POI créé → **A3.1** fiche lieu (`/place/:id`)
  - Après lancement audio → reste sur fiche / feuille de suivi job (T26)
  - Annulation → retour carte
- Retour arrière : ferme la feuille recherche / confirmation ; ne crée pas de POI partiel.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. Champ de recherche Wikipedia + résultats
2. Détail de sélection (titre, extrait court, URL)
3. CTA « Créer le lieu » puis « Générer l’audioguide »

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|--------------------|----------|
| Bouton carte admin | Entrée flux | Icône + libellé « Ajouter un lieu » | Masqué si non-admin |
| Feuille recherche | Saisie `q` | Résultats T23 (`title`, `wikipediaUrl`, `description?`) | Debounce ; langue = préférence app ou `fr` |
| Carte résultat | Sélection | Titre + snip | Une sélection active |
| Confirmation création | Preview | Titre canonique, coords si dispo, statut défaut `DRAFT` | Prévenir si pas de géométrie |
| Feuille / bandeau job | Suivi F-015 | pending / ready / error | Pas de crédits (voie admin) |

## Interactions et règles

- Gestes : ouverture feuille depuis carte ; tap résultat ; CTA primaire bas d’écran.
- Chargements : spinner recherche ; disable CTA pendant `POST from-wikipedia` et generate.
- Règles métier :
  - Non-admin : aucune entrée UI (défense en profondeur ; API renvoie 403).
  - Création via `POST /admin/pois/from-wikipedia` (T24), pas collage d’URL seule en V1.
  - Audio via routes **admin** (pas `/me/...`, pas débit crédits).
  - Coords absentes : POI créable en brouillon ; message « position à renseigner plus tard ».

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| Idle entrée | Admin sur A1.1 | Bouton visible | Ouvrir recherche |
| Recherche vide | `q` trop court | Invitation à saisir | — |
| Résultats | 200 search | Liste | Sélectionner |
| Aucun résultat | 200 vide | État vide + reformuler | Modifier `q` |
| Erreur Wikipedia / API | 5xx / timeout | Message + réessayer | Retry |
| 403 | JWT non admin | Message accès refusé | Retour |
| Création en cours | POST from-wikipedia | Overlay / CTA disabled | — |
| POI créé | 201 | Toast + nav A3.1 | Option « Générer l’audio » |
| Job pending | 202 generate | Indicateur progression | Attendre / quitter |
| Job ready | poll terminal | Succès + piste dispo | Écouter (A3.2) |
| Job error | poll error | Message + retry | Relancer (si API retry) |

## Contenus et microcopy

- Titre feuille : « Ajouter un lieu (Wikipedia) »
- CTA : « Créer le lieu », « Générer l’audioguide »
- Erreur générique : « Impossible de contacter Wikipedia. Réessaie. »
- Sans coords : « Ce lieu n’a pas de position connue ; tu pourras l’ajuster ensuite. »
- Ton : opérationnel, court, français.

## Accessibilité

- Bouton carte : `accessibilityLabel` « Ajouter un lieu » (admin).
- Résultats : libellés titre + description ; cible ≥ 44 pt.
- Annonces état job pour lecteur d’écran (changement de statut).

## Indicateurs et analytics (si applicable)

- Événements suggérés (sans PII) : `admin_wiki_search`, `admin_poi_created_from_wiki`, `admin_audio_generate_started`, `admin_audio_generate_completed|failed`.

## Critères d’acceptation

1. **Given** un utilisateur `USER`, **When** il ouvre A1.1, **Then** aucune entrée « Ajouter un lieu » n’est visible.
2. **Given** un `ADMIN`, **When** il recherche un terme connu, **Then** il voit des résultats Wikipedia et peut en sélectionner un.
3. **Given** une sélection, **When** il valide la création, **Then** un POI est créé et il atterrit sur A3.1.
4. **Given** un POI avec `wikipediaUrl`, **When** il lance la génération, **Then** un job admin est suivi jusqu’à ready ou error, sans débit de crédits.
5. **Given** un article sans coordonnées, **When** il crée le POI, **Then** la création réussit avec un message sur l’absence de position.

## Open questions

- [x] Statut par défaut UI : forcer `DRAFT` uniquement (décision produit) — pas de `PUBLISHED` à la confirmation en V1.
- [ ] Override manuel lat/lng sur la carte avant création (V1.1) ?

## Étapes d’exécution T22

- [x] Copier la spec B9 ci-dessus dans `docs/ecran-B9-admin-wikipedia-poi-audio.md` et la peaufiner
- [x] Passer la [ux-checklist](../../.cursor/skills/spec-ecran-app/ux-checklist.md)
- [x] Ajouter B9 dans le tableau Partie B de `docs/ecrans.md`
- [x] Ajouter le flux dans la synthèse : B9 → A3.1 → (audio) B6/B7 via app

## Critères d’acceptation (tâche doc)

- [x] Fiche B9 complète (gabarit skill)
- [x] `ecrans.md` référence B9
- [x] Pas de code applicatif modifié dans T22

## Références

- [`docs/ecrans.md`](../ecrans.md) Partie B
- [T23](./T23-api-wikipedia-search.md), [T24](./T24-api-poi-from-wikipedia.md), [T25](./T25-app-admin-wikipedia-poi.md), [T26](./T26-app-admin-audio-guide.md)
- API : `nook_api_v2/docs/api-client-reference.md` § admin-pois / admin-audio-guides
