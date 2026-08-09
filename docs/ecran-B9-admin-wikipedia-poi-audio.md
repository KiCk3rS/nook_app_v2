# B9 — Admin : Wikipedia → POI → audioguide

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | B9 |
| Priorité | Admin / Évolution |
| Plateforme | Mobile iOS et Android (Expo) — compte `role: ADMIN` |
| Dépendances | Brief §4.1–4.2 ; écrans liés : **A1.1**, **A3.1**, **A3.2**, **B1**, **B3**, **B6**, **B7** ; tâches : [T22](./integration/T22-spec-ecran-admin-wikipedia-poi.md), [T23](./integration/T23-api-wikipedia-search.md), [T24](./integration/T24-api-poi-from-wikipedia.md), [T25](./integration/T25-app-admin-wikipedia-poi.md), [T26](./integration/T26-app-admin-audio-guide.md) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Fiche lieu A3.1](./ecran-A3.1-fiche-lieu.md) · [Création guide utilisateur A3.3](./ecran-A3.3-creation-guide-audio-ia.md) (distinct — crédits) · [API client](./api-client-reference.md) |

## Résumé

**Utilisateur (admin) :** découvrir un lieu via Wikipedia, créer le POI NOOK correspondant, puis lancer et suivre la génération d’un audioguide éditorial — sans back-office web pour ce flux minimal.

**Produit :** accélérer la production de contenu terrain / bureau ; voie **admin** (pas de débit de crédits), distincte de **A3.3** (utilisateur).

## Utilisateur et contexte

- **Persona / situation :** éditeur ou ops NOOK, compte `role: ADMIN`, sur le terrain ou au bureau ; crée un lieu manquant après découverte Wikipedia.
- **Contraintes :** usage ponctuel, souvent une main ; réseau variable ; **aucune** entrée de ce flux visible pour un `USER` ; contenu créé en **brouillon** (`DRAFT`) jusqu’à publication explicite ailleurs (B2 / B3).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A1.1** carte-accueil — contrôle « Ajouter un lieu » visible **uniquement** si `user.role === 'ADMIN'`. |
| **Sorties** | POI créé → **A3.1** fiche lieu (`/place/:id`) ; après lancement audio → reste sur **A3.1** / bandeau de suivi job (détail T26) ; annulation → retour **A1.1**. |
| **Retour arrière** | Ferme la feuille recherche / confirmation ; **ne crée pas** de POI partiel. Swipe down ou bouton fermer alignés. |

**Deep link :** N/A en V1 (entrée uniquement depuis A1.1 pour admin authentifié). Si ouvert sans session admin → pas d’entrée UI ; API renvoie 403.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. Champ de recherche Wikipedia + liste de résultats.
2. Détail de sélection (titre, extrait court, URL).
3. CTA « Créer le lieu » (puis, sur fiche / confirmation, « Générer l’audioguide »).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Bouton carte admin** | Entrée flux | Icône + libellé « Ajouter un lieu » | Masqué si non authentifié ou non `ADMIN` ; zone ≥ 44×44 pt ; demi-basse d’écran si possible (pouce) |
| **Feuille recherche** | Saisie `q` | Champ + résultats T23 (`title`, `wikipediaUrl`, `description?`, `thumbnailUrl?`) | Titre feuille : « Ajouter un lieu (Wikipedia) » ; debounce ; langue = préférence app (**A6.7**) ou `fr` |
| **État vide recherche** | Guidage | Invitation à saisir (≥ 2 caractères côté API) | Pas seulement « Aucun résultat » avant saisie |
| **Carte résultat** | Sélection | Titre + snip (`description`) | Une sélection active à la fois ; tap = sélection |
| **Confirmation création** | Preview | Titre canonique, URL, coords si connues (sinon message), statut **`DRAFT`** (lecture seule, non éditable) | CTA primaire bas d’écran « Créer le lieu » |
| **Alerte sans géométrie** | Confiance | Message position absente | Création quand même autorisée en brouillon |
| **Toast / nav post-création** | Continuité | Succès + navigation **A3.1** | Option immédiate ou CTA fiche : « Générer l’audioguide » |
| **Bandeau / feuille job** | Suivi F-015 | `pending` / `ready` / `error` | Pas d’affichage de crédits ; voie admin uniquement |

### Contrat API consommé (cible)

| Étape | Méthode | Chemin | Auth | Notes |
|-------|---------|--------|------|-------|
| Recherche | GET | `/api/v1/admin/wikipedia/search?q=&lang=&limit=` | JWT `ADMIN` | T23 ; `q` &lt; 2 → 422 |
| Création | POST | `/api/v1/admin/pois/from-wikipedia` | JWT `ADMIN` | T24 ; corps avec `wikipediaUrl` ; **`status` forcé `DRAFT` côté client** (pas de choix UI V1) |
| Génération | POST | `/api/v1/admin/pois/:poiId/audio-guides/generate` | JWT `ADMIN` | 202 + `jobId` ; pas `/me/...` |
| Suivi | GET | `/api/v1/admin/audio-guides/jobs/:jobId` | JWT `ADMIN` | Poll jusqu’à terminal |
| Retry (opt.) | POST | `/api/v1/admin/audio-guides/jobs/:jobId/retry` | JWT `ADMIN` | Si exposé |

Corps création proposé (V1) :

```json
{
  "wikipediaUrl": "https://fr.wikipedia.org/wiki/Tour_Eiffel",
  "status": "DRAFT"
}
```

Pas d’override `lat`/`lng` depuis l’UI en V1 (coords = MediaWiki si disponibles).

## Interactions et règles

### Gestes

- Ouverture feuille depuis le bouton admin **A1.1**.
- Tap résultat → sélection active + zone confirmation / CTA.
- CTA primaire ancré en bas (safe area) ; scroll de liste ne masque pas le CTA sans padding bas documenté.

### Chargements / validations

- Recherche : debounce ; spinner ou skeleton liste ; pas de flash de « aucun résultat » pendant le debounce.
- CTA « Créer le lieu » : désactivé sans sélection ; désactivé + overlay pendant `POST from-wikipedia`.
- CTA « Générer l’audioguide » : désactivé pendant `POST generate` ; suivi job non bloquant (l’admin peut quitter la fiche).

### Règles métier

- **Non-admin :** aucune entrée UI (défense en profondeur ; API 403).
- **Création :** uniquement via `POST /admin/pois/from-wikipedia` (T24) — pas de collage d’URL libre en V1.
- **Statut :** toujours **`DRAFT`** à la création depuis ce flux ; publication ultérieure via B2 / B3.
- **Audio :** routes **admin** uniquement — **aucun** débit de crédits (contraire à **A3.3**).
- **Coords absentes :** POI créable ; message « position à renseigner plus tard » ; le lieu brouillon peut ne pas apparaître correctement sur la carte publique tant qu’il n’est pas géolocalisé + publié.
- **Hors ligne / API partielle :** message d’erreur + réessayer ; pas de création locale optimiste persistée.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Idle entrée** | Admin sur **A1.1** | Bouton « Ajouter un lieu » visible | Ouvrir recherche |
| **USER / non auth** | Rôle ≠ `ADMIN` | Bouton absent | — |
| **Recherche vide** | `q` trop court / vide | Invitation à saisir | Continuer la saisie |
| **Recherche en cours** | Debounce expiré, requête partie | Spinner / skeleton | Annuler = fermer feuille |
| **Résultats** | 200 search avec items | Liste sélectionnable | Sélectionner |
| **Aucun résultat** | 200 vide | État vide + reformuler | Modifier `q` |
| **Erreur Wikipedia / API** | 5xx / timeout / 503 | Message + « Réessayer » | Retry |
| **403** | JWT non admin | Message accès refusé | Fermer → **A1.1** |
| **422 recherche** | `q` invalide | Aide « saisis au moins 2 caractères » | Corriger `q` |
| **Sélection active** | Tap résultat | Carte mise en avant + CTA actif | Créer / changer sélection |
| **Création en cours** | POST from-wikipedia | Overlay / CTA disabled | — |
| **POI créé** | 201 | Toast + nav **A3.1** | Option « Générer l’audio » |
| **Sans coords** | Réponse sans lat/lng | Message position à renseigner | Continuer quand même |
| **Job pending** | 202 generate | Indicateur progression sur fiche | Attendre / quitter |
| **Job ready** | Poll terminal ready | Succès + piste dispo | Écouter (**A3.2**) |
| **Job error** | Poll error | Message + retry | Relancer si API retry |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre feuille | « Ajouter un lieu (Wikipedia) » |
| Placeholder recherche | « Rechercher un article… » |
| Invitation vide | « Tape un nom de lieu pour chercher sur Wikipedia. » |
| Aucun résultat | « Aucun article trouvé. Essaie un autre libellé. » |
| Badge statut | « Brouillon » (confirmation) |
| Sans coords | « Ce lieu n’a pas de position connue ; tu pourras l’ajuster ensuite. » |
| CTA création | « Créer le lieu » |
| CTA audio | « Générer l’audioguide » |
| Erreur générique | « Impossible de contacter Wikipedia. Réessaie. » |
| Accès refusé | « Accès réservé aux administrateurs. » |
| Création OK | « Lieu créé en brouillon. » |
| Job pending | « Génération en cours… » |
| Job ready | « Audioguide prêt. » |
| Job error | « La génération a échoué. » · « Réessayer » |

**Ton :** opérationnel, court, français ; jargon technique limité (pas d’IDs job exposés en premier plan).

## Accessibilité

- Bouton carte : `accessibilityLabel` « Ajouter un lieu » (admin).
- Champ recherche : label associé ; annonce du nombre de résultats quand la liste se met à jour.
- Résultats : libellés titre + description ; cible ≥ 44×44 pt ; espacement anti-tap erroné.
- CTA bas : focus / ordre logique fermer → champ → liste → confirmation → CTA.
- Annonces lecteur d’écran sur changement de statut job (`pending` → `ready` / `error`).
- Contraste texte / fond suffisant pour corps et CTA ; réduction de mouvement si animations de feuille.

## Indicateurs et analytics (si applicable)

| Événement | Moment | Propriétés (sans PII) |
|-----------|--------|------------------------|
| `admin_wiki_search` | Requête search lancée | `lang`, `q_length`, `result_count?` |
| `admin_poi_created_from_wiki` | 201 création | `poi_id`, `has_coordinates` |
| `admin_audio_generate_started` | 202 generate | `poi_id`, `job_id` |
| `admin_audio_generate_completed` | Job ready | `poi_id`, `job_id` |
| `admin_audio_generate_failed` | Job error | `poi_id`, `job_id` |

## Critères d’acceptation

1. **Given** un utilisateur `USER`, **When** il ouvre **A1.1**, **Then** aucune entrée « Ajouter un lieu » n’est visible.
2. **Given** un `ADMIN`, **When** il recherche un terme connu (≥ 2 caractères), **Then** il voit des résultats Wikipedia et peut en sélectionner un.
3. **Given** une sélection, **When** il valide la création, **Then** un POI est créé en **`DRAFT`** et il atterrit sur **A3.1**.
4. **Given** un POI avec `wikipediaUrl`, **When** il lance la génération, **Then** un job admin est suivi jusqu’à `ready` ou `error`, **sans** débit de crédits.
5. **Given** un article sans coordonnées, **When** il crée le POI, **Then** la création réussit avec un message sur l’absence de position.
6. **Given** une feuille ouverte sans validation, **When** l’admin ferme / revient arrière, **Then** aucun POI n’est créé.

## Open questions

- [x] Statut par défaut UI : **forcé `DRAFT`** (décision produit) — pas de choix `PUBLISHED` en V1.
- [ ] Override manuel lat/lng sur la carte avant création (**V1.1** — hors V1).
- [ ] Paramètres audio admin en V1 (durée / langue / ton) : défauts pipeline uniquement, ou feuille type B6 allégée ?
- [ ] Après création : proposer immédiatement « Générer l’audioguide » en toast/sheet, ou uniquement CTA sur **A3.1** ?

## Périmètre d’implémentation (hors T22)

| Tâche | Contenu |
|-------|---------|
| **T22** (ce doc) | Spec UX / flux uniquement |
| **T23** | API search Wikipedia |
| **T24** | API `from-wikipedia` |
| **T25** | App : recherche + création POI |
| **T26** | App : génération + suivi job admin |

---

*Cadrage UX pour T23–T26. Ne constitue pas l’implémentation applicative.*
