# A3.3 — Création de guide audio par l’IA

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A3.3 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §4.2, §5.1, §5.2 ; écrans liés : **A3.1**, **A3.2**, **A6.1**, **A8.3**, **A8.4** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Fiche lieu A3.1](./ecran-A3.1-fiche-lieu.md) · [Paywall premium A8.3](./ecran-A8.3-paywall-premium.md) · [Pack crédits A8.4](./ecran-A8.4-pack-credits.md) · [API client](./api-client-reference.md) |

## Résumé

**Utilisateur :** créer un guide audio personnalisé sur un lieu à partir d’une source encyclopédique (Wikipedia), en choisissant le niveau de détail, en échange de crédits ou d’un quota d’abonnement.

**Produit :** feuille modale depuis la fiche lieu ; monétisation par **crédits** (1 / 2 / 3 selon durée) avec **packs in-app** et **générations incluses dans l’abonnement** ; le guide produit reste **privé à l’auteur** en v1.

## Utilisateur et contexte

- **Persona / situation :** visiteur sur place ou en amont de visite, sur un lieu sans guide satisfaisant (ou thème manquant) ; souhaite un contenu sur mesure sans rédiger lui-même.
- **Contraintes :** debout, une main, réseau variable ; génération **asynchrone** (plusieurs minutes) — l’utilisateur ne reste pas bloqué sur l’écran ; reprise possible après fermeture de l’app.

## Modèle économique (v1)

| Ressource | Règle |
|-----------|--------|
| **Crédits** | Monnaie consommée à chaque génération selon le palier de durée choisi. |
| **Paliers durée** | **Court** = 1 crédit · **Normal** = 2 crédits · **Détaillé** = 3 crédits. |
| **Abonnement** | Inclut un **quota mensuel** de générations (consomme le quota avant les crédits achetés — ordre exact : open question backend). |
| **Packs in-app** | Recharge de crédits via store natif (**A8.4**) lorsque solde + quota épuisés. |
| **Visibilité** | Guide **privé à l’auteur** : visible uniquement pour lui sur **A3.1** ; invisible pour les autres utilisateurs. |

### Priorité de consommation (proposée)

1. Quota abonnement restant (si abonné actif).
2. Solde crédits achetés.
3. Sinon → feuille **A8.4** (pack crédits) ou **A8.3** (souscrire à l’abonnement si non abonné).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A3.1** — tap « Ajouter un nouveau guide audio » ; deep link optionnel `/place/[id]/create-guide` (auth requise). |
| **Sorties** | Succès lancement → retour **A3.1** (guide en `pending`) ; **A6.1** — si non connecté ; **A8.4** — crédits / quota insuffisants ; **A8.3** — incitation abonnement si pertinent. |
| **Retour arrière** | Swipe down ou bouton fermer ; annule sans lancer de job ni débit. |

**Contexte passé à la feuille :** `poiId`, `poiName`, `poiImageUrl?`, `sourceScreen`.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Contexte lieu** — nom du POI, rappel « guide privé ».
2. **Choix de durée** — trois cartes sélectionnables (Court / Normal / Détaillé) avec coût affiché.
3. **Source Wikipedia** — champ URL + aide contextuelle.
4. **Solde** — crédits restants + quota abonnement si applicable.
5. **CTA principal** — « Générer mon guide — {coût} ».
6. **Mentions** — source ouverte, délai de traitement, licence Wikipedia.

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Poignée / fermer** | Sortie | — | 44×44 pt ; annule sans débit |
| **En-tête contexte** | Ancrage | `poiName`, badge « Guide privé » | Rassurer : visible par vous seul |
| **Carte palier Court** | Sélection durée | Label « Court », sous-texte durée indicative (~2–3 min), « 1 crédit » | Une seule carte active |
| **Carte palier Normal** | Sélection durée | ~4–5 min, « 2 crédits » | Sélection par défaut recommandée |
| **Carte palier Détaillé** | Sélection durée | ~8–10 min, « 3 crédits » | |
| **Champ URL Wikipedia** | Entrée source | URL `https://*.wikipedia.org/wiki/…` | Clavier URL ; validation au blur et au submit |
| **Aide source** | Confiance | « Le guide s’appuie sur l’article indiqué. Vérifiez qu’il correspond bien au lieu. » | Lien « Comment trouver l’article ? » (optionnel P2) |
| **Bandeau solde** | Transparence | `creditsBalance`, `subscriptionGenerationsRemaining?`, libellé dynamique | Ex. « 4 crédits · 2 générations incluses ce mois-ci » |
| **CTA principal** | Lancement | « Générer mon guide — {coût affiché} » | Désactivé si URL invalide ou solde insuffisant |
| **Lien recharge** | Monétisation | « Obtenir des crédits » → **A8.4** | Visible si solde faible ou CTA secondaire |
| **Mentions légales** | Confiance | Crédits Wikipedia, délai estimé (ex. « Prêt en quelques minutes ») | Pas de fausse promesse instantanée |

### Paramètres métier envoyés à l’API (cible)

| Champ client | Valeur v1 | Notes |
|--------------|-----------|--------|
| `wikipediaUrl` | URL validée | Obligatoire |
| `durationTier` | `short` \| `normal` \| `detailed` | Mappe 1 / 2 / 3 crédits côté serveur |
| `language` | Code ISO (ex. `fr`) | Défaut = langue app (**A6.7**) |

Le **ton** éditorial reste géré côté pipeline (brief §4.2) ; pas de choix utilisateur en v1.

## Interactions et règles

### Authentification

- Tap « Ajouter un guide » sur **A3.1** sans session → feuille **A6.1** (ou redirect) puis retour automatique vers **A3.3** après connexion réussie (`returnTo`).

### Validation URL

- Domaines autorisés : `*.wikipedia.org` (http/https).
- Rejet : URL vide, domaine hors liste, page spéciale invalide (ex. `Special:`).
- Message d’erreur inline sous le champ ; CTA reste désactivé.

### Lancement et débit

- Tap CTA → overlay loading non dismissible.
- **Succès (202)** : débit crédit ou quota ; fermeture feuille ; retour **A3.1** avec nouvelle ligne guide `status: pending`.
- **402 crédits insuffisants** : ouvrir **A8.4** (packs) ; proposer **A8.3** si non abonné.
- **429** : message « Trop de demandes — réessayez dans quelques minutes ».
- **422** : erreur métier (URL rejetée, POI incompatible) — message explicite + correction possible.

### Suivi job (intégré au flux, pas d’écran séparé en v1)

- Sur **A3.1**, ligne guide `pending` : libellé « Génération en cours… », pas de bouton play.
- Polling ou push silencieux : passage à `ready` ou `error`.
- **Erreur job** : ligne avec badge « Échec » + action « Réessayer » (nouveau lancement = nouveau débit sauf politique retry gratuite — open question).
- **Succès** : ligne jouable (**A3.2**) ; badge discret « Mon guide ».

### Règles de visibilité (privé auteur)

- Seul l’auteur voit ses guides privés sur **A3.1**.
- Les autres utilisateurs voient uniquement les guides **publiés** par l’équipe éditoriale.
- Partage du guide privé : **hors périmètre v1** (open question).

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Ouvert — formulaire** | Feuille affichée | Contexte + paliers + URL + solde | Sélection, saisie, fermer |
| **Palier sélectionné** | Tap carte durée | Carte active + CTA mis à jour | Changer palier |
| **URL invalide** | Validation échouée | Bordure erreur + message | Corriger URL |
| **Solde OK** | Crédits ou quota suffisants | CTA actif avec coût | Générer |
| **Solde insuffisant** | Coût > disponible | CTA désactivé ou secondaire « Obtenir des crédits » | **A8.4** / **A8.3** |
| **Envoi en cours** | Tap CTA | Overlay loading | — |
| **Succès lancement** | API 202 | Toast discret + fermeture | Retour **A3.1** |
| **Erreur réseau** | Timeout / offline | Bannière + « Réessayer » | Réessayer |
| **Non connecté** | Session absente | Redirection **A6.1** | Connexion |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre feuille | « Créer un guide audio » |
| Badge privé | « Visible par vous seul » |
| Palier Court | « Court » · « Environ 2–3 min » · « 1 crédit » |
| Palier Normal | « Normal » · « Environ 4–5 min » · « 2 crédits » |
| Palier Détaillé | « Détaillé » · « Environ 8–10 min » · « 3 crédits » |
| Label URL | « Article Wikipedia » |
| Placeholder URL | « https://fr.wikipedia.org/wiki/… » |
| Erreur URL | « Indiquez une adresse Wikipedia valide pour ce lieu. » |
| Solde crédits | « {n} crédit(s) » |
| Quota abonnement | « {n} génération(s) incluse(s) ce mois-ci » |
| CTA | « Générer mon guide — {coût} » |
| Lien recharge | « Obtenir des crédits » |
| Pending (A3.1) | « Génération en cours… » |
| Erreur job | « La génération a échoué. » · « Réessayer » |
| Succès toast | « Votre guide est en cours de création. » |
| 402 | « Crédits insuffisants pour ce guide. » |
| 429 | « Trop de demandes. Réessayez dans quelques minutes. » |

**Ton :** clair, rassurant ; expliquer le délai et la source sans jargon IA.

## Accessibilité

- Labels explicites sur chaque palier (inclure durée + coût).
- Champ URL : label associé, annonce des erreurs de validation.
- Ordre de focus : fermer → paliers → URL → solde → CTA → lien recharge.
- Cibles tactiles ≥ 44×44 pt ; cartes palier espacées pour éviter les taps erronés.
- Annonce lecteur d’écran sur changement de coût du CTA.

## Indicateurs et analytics

| Événement | Moment | Propriétés |
|-----------|--------|------------|
| `audio_guide_create_open` | Ouverture feuille | `poi_id`, `source` |
| `audio_guide_tier_selected` | Changement palier | `tier`, `credit_cost` |
| `audio_guide_create_submit` | Tap CTA | `poi_id`, `tier`, `payment_type` (`credits` \| `subscription_quota`) |
| `audio_guide_create_success` | API 202 | `poi_id`, `job_id`, `tier` |
| `audio_guide_create_error` | Échec | `code`, `tier` |
| `audio_guide_credits_paywall_open` | Ouverture **A8.4** depuis flux | `poi_id`, `required_credits` |
| `audio_guide_job_ready` | Job terminé | `poi_id`, `guide_id`, `duration_sec` |
| `audio_guide_job_failed` | Job en erreur | `poi_id`, `job_id` |

## Contrat API cible (à implémenter côté backend)

Endpoint utilisateur proposé (symétrique au chat guide F-016) :

| Méthode | Chemin | Auth | Description | Codes notables |
|--------|--------|------|-------------|----------------|
| GET | `/api/v1/me/credits` | Bearer | Solde crédits + quota abonnement génération | 200 ; 401 |
| POST | `/api/v1/me/pois/:poiId/audio-guides/generate` | Bearer | Lance un job | **202** + `jobId` ; 401 ; 422 ; **402** (`AUDIO_GUIDE_INSUFFICIENT_CREDITS`) ; 429 |
| GET | `/api/v1/me/audio-guides/jobs/:jobId` | Bearer | Statut job auteur | 200 ; 404 ; 401 |

Corps POST proposé :

```json
{
  "wikipediaUrl": "https://fr.wikipedia.org/wiki/Tour_Eiffel",
  "durationTier": "normal",
  "language": "fr"
}
```

Mapping serveur `durationTier` → crédits : `short` = 1, `normal` = 2, `detailed` = 3.

## Critères d’acceptation

1. **Étant donné** un utilisateur **non connecté** sur **A3.1**, **quand** il tape « Ajouter un nouveau guide audio », **alors** le parcours **A6.1** s’ouvre et, après connexion, **A3.3** s’affiche pour le même lieu.
2. **Étant donné** **A3.3** ouvert avec un solde suffisant, **quand** l’utilisateur sélectionne « Détaillé », saisit une URL Wikipedia valide et confirme, **alors** l’API est appelée, **3 crédits** (ou 1 quota abonnement) sont consommés, et **A3.1** affiche une ligne guide en `pending`.
3. **Étant donné** un solde insuffisant pour le palier choisi, **quand** l’utilisateur tente de générer, **alors** le CTA mène vers **A8.4** (pack crédits) ou propose l’abonnement via **A8.3** sans lancer de job.
4. **Étant donné** un guide privé en `pending` puis `ready`, **quand** un **autre** utilisateur ouvre la même fiche lieu, **alors** ce guide n’apparaît pas dans sa liste.
5. **Étant donné** un guide privé `ready`, **quand** l’**auteur** ouvre **A3.1**, **alors** il peut lire le guide (**A3.2**) et le distingue des guides publics (badge « Mon guide »).
6. **Étant donné** une URL Wikipedia invalide, **quand** l’utilisateur tente de confirmer, **alors** un message d’erreur s’affiche et aucun appel API n’est effectué.
7. **Étant donné** un job en erreur, **quand** l’auteur consulte **A3.1**, **alors** la ligne affiche l’échec et propose « Réessayer ».

## Open questions

- **Quota abonnement** : nombre exact de générations incluses par mois (ex. 3 ? 5 ?).
- **Ordre de consommation** : quota abonnement avant crédits achetés — confirmer avec backend.
- **Retry gratuit** : en cas d’échec technique pipeline, rembourser crédit / quota ?
- **Durées indicatives** : validation éditoriale des fourchettes ~2–3 / ~4–5 / ~8–10 min avec l’équipe contenu.
- **Modération future** : passage du privé au public — hors v1.

---

*Implémentation MVP prévue : feuille depuis `app/place/[id].tsx` ; handler `handleAddGuide` ; mocks crédits dans `constants/` ; branchement API ultérieur.*
