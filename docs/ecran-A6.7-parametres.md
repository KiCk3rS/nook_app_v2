# A6.7 — Paramètres

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A6.7 (+ action **A6.8** déconnexion documentée ci-dessous) |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.6, §5.2 ; écrans liés : **A6.4**, **A6.1**, **A8.1**, **A8.2**, **A8.3**, **A1.2** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Profil A6.4](./ecran-A6.4-profil.md) · [API client](./api-client-reference.md) |

## Résumé

**Utilisateur :** ajuster la langue, les préférences d'usage et les notifications, consulter les informations légales, gérer la sécurité du compte et se déconnecter.

**Produit :** écran de réglages secondaire accessible depuis le profil connecté ; sépare **identité** (A6.4) et **préférences / compte / légal** ; point d'entrée vers les réglages OS pour permissions refusées.

## Utilisateur et contexte

- **Persona / situation :** utilisateur connecté qui veut changer la langue de l'app, désactiver les notifications ou consulter la politique de confidentialité.
- **Contraintes :** accès réservé aux utilisateurs authentifiés ; certaines actions (permissions OS) sortent de l'app ; données minimales (brief §5.2).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A6.4** — ligne « Paramètres » ; deep link `/settings` (optionnel) ; bandeau permission **A1.2** / **A1.3** — lien « Paramètres » (réglages OS, pas cet écran). |
| **Sorties** | **A8.1** — confidentialité ; **A8.2** — CGU ; **A6.1** — changement mot de passe (flux futur) ; **A8.3** — gérer abonnement / restaurer achats ; Réglages OS (géoloc, notifications) ; retour **A6.4**. |
| **Retour arrière** | Bouton retour header → **A6.4** ; geste OS back = même comportement. |

**Garde d'entrée :** si non authentifié → redirect **A6.1** avec `returnTo=/settings`.

## Structure de l'interface

### Hiérarchie visuelle (1 = plus important)

1. **Section Préférences** — langue, unités si applicable.
2. **Section Notifications** — toggles push (si produit activé).
3. **Section Compte** — email (lecture seule), sécurité, premium.
4. **Section Confidentialité et légal** — liens A8.1, A8.2.
5. **Section Application** — version, licences open source (optionnel P2).
6. **Déconnexion (A6.8)** — action en bas de liste.

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Header** | Navigation | Titre « Paramètres », retour | Style stack, pas tab root |
| **Groupe Préférences** | Usage | Langue, préférences JSON | Sauvegarde immédiate ou bouton « Enregistrer » (voir règles) |
| **Sélecteur langue** | i18n | `preferences.language` | Valeurs : `fr`, `en` (extensible) ; applique locale app |
| **Toggle notifications push** | Engagement | `preferences.notifications.pushEnabled` | Si refus OS → lien « Ouvrir les réglages » |
| **Toggle rappels parcours** | Engagement P2 | `preferences.notifications.routeReminders` | Masqué si push désactivé |
| **Ligne email** | Info compte | `email` (GET `/me`) | Lecture seule ; pas d'édition P1 |
| **Ligne mot de passe** | Sécurité | — | « Modifier le mot de passe » → flux futur ou WebView (open question) |
| **Ligne Premium** | Monétisation | Statut abonnement | Tap → **A8.3** mode gestion / « Restaurer achats » |
| **Ligne Confidentialité** | Légal | — | → **A8.1** WebView ou page native |
| **Ligne CGU** | Légal | — | → **A8.2** |
| **Ligne Localisation** | Permissions | État permission OS | Tap → Réglages OS ; complète **A1.2** |
| **Ligne Version** | Info | `appVersion`, `buildNumber` | Non cliquable ; tap 7× easter egg support (optionnel) |
| **Bouton déconnexion** | Session **A6.8** | — | Style destructif discret ; modale confirmation |

### Schéma préférences (provisoire — fusion JSON)

Objet fusionné via `PATCH /api/v1/me/preferences` :

```json
{
  "language": "fr",
  "notifications": {
    "pushEnabled": true,
    "routeReminders": false,
    "marketingEnabled": false
  },
  "units": "metric"
}
```

Seules les clés envoyées sont mises à jour (fusion côté API).

## Interactions et règles

- **Chargement :** `GET /api/v1/me` pour email + `preferences` embarquées ou fetch séparé selon DTO réponse.
- **Langue :** changement → `PATCH /me/preferences` + mise à jour locale i18n immédiate ; rollback si erreur API.
- **Toggles notifications :** si activation et permission OS refusée → expliquer + proposer ouverture Réglages système (pattern **A1.2**).
- **Sauvegarde :** toggles et sélecteurs — **sauvegarde optimiste** avec retry ; pas de bouton « Enregistrer » global en P1.
- **Liens légaux :** WebView in-app ou navigateur in-app (Custom Tabs / SFSafariViewController) — open question ; pas de tracking silencieux.
- **Premium :** afficher « Abonnement actif » ou « Non abonné » ; lien vers **A8.3** pour achat ou restauration.
- **Déconnexion (A6.8) :** identique **A6.4** — modale confirmation → `POST /auth/logout` + purge tokens → redirect **A6.4** anonyme.

### Déconnexion (A6.8 — action, pas d'écran séparé)

| Étape | Comportement |
|-------|--------------|
| Tap « Se déconnecter » | Modale « Se déconnecter ? » |
| Confirmer | `POST /api/v1/auth/logout` `{ refreshToken }` ; purge stockage sécurisé ; reset état auth global |
| Annuler | Fermeture modale, session intacte |
| Post-logout | Navigation **A6.4** ; mini-player audio peut continuer en anonyme (open question **A6.4**) |

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Chargement** | Entrée écran | Skeleton groupes | — |
| **Contenu OK** | 200 `/me` | Liste réglages complète | Modifier préférences, naviguer |
| **Non authentifié** | Pas de token | Redirect **A6.1** | Connexion |
| **Session expirée** | 401 | Redirect **A6.1** + toast | Reconnexion |
| **Sauvegarde préférence** | Toggle / sélecteur | Indicateur discret ou optimiste | — |
| **Erreur sauvegarde** | PATCH échoue | Toast + revert UI | Réessayer |
| **Permission OS refusée** | Toggle push sans droit | Explication + lien Réglages | Ouvrir OS settings |
| **Déconnexion — confirmation** | Tap déconnexion | Modale | Confirmer / Annuler |
| **Déconnexion — en cours** | Confirm | Overlay | — |
| **Erreur réseau** | Fetch initial échoue | Bannière + réessayer | Réessayer |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre écran | « Paramètres » |
| Section préférences | « Préférences » |
| Langue | « Langue » |
| Langue fr | « Français » |
| Langue en | « English » |
| Section notifications | « Notifications » |
| Push | « Notifications push » |
| Push description | « Alertes sur vos parcours et nouveautés. » |
| Rappels parcours | « Rappels de parcours » |
| Permission refusée | « Autorisez les notifications dans les réglages de votre appareil. » |
| Ouvrir réglages | « Ouvrir les réglages » |
| Section compte | « Compte » |
| Email | « Adresse e-mail » |
| Mot de passe | « Mot de passe » |
| Modifier mot de passe | « Modifier le mot de passe » |
| Premium | « Abonnement Premium » |
| Premium actif | « Actif » |
| Premium inactif | « Non abonné » |
| Gérer premium | « Gérer mon abonnement » |
| Section légal | « Confidentialité et conditions » |
| Confidentialité | « Politique de confidentialité » |
| CGU | « Conditions d'utilisation » |
| Section app | « Application » |
| Localisation | « Localisation » |
| Localisation accordée | « Autorisée » |
| Localisation refusée | « Non autorisée » |
| Version | « Version {version} » |
| Déconnexion | « Se déconnecter » |
| Modale déconnexion titre | « Se déconnecter ? » |
| Modale déconnexion corps | « Vous devrez vous reconnecter pour accéder à vos parcours enregistrés. » |
| Erreur chargement | « Impossible de charger les paramètres. » |
| Erreur sauvegarde | « Modification non enregistrée. Réessayez. » |

**Ton :** neutre, transparent ; pas de dark patterns sur notifications.

## Accessibilité

- Titre annoncé : « Paramètres ».
- Toggles : label + état « activé / désactivé ».
- Liens et lignes menu : role button, hauteur ≥ 44 pt.
- Modale déconnexion : focus piégé, boutons clairement libellés.
- Contraste WCAG AA.

## Indicateurs et analytics

| Événement | Paramètres (sans PII) |
|-----------|------------------------|
| `settings_viewed` | — |
| `settings_language_changed` | `language` |
| `settings_notification_toggled` | `key`, `enabled` |
| `settings_legal_link_tapped` | `document` (privacy, terms) |
| `settings_premium_tapped` | `subscription_state` |
| `settings_os_settings_opened` | `reason` (location, notifications) |
| `settings_logout_tapped` | — |
| `settings_logout_confirmed` | — |

## Contrat API (existant)

| Méthode | Chemin | Usage |
|---------|--------|-------|
| GET | `/api/v1/me` | Email, préférences embarquées |
| PATCH | `/api/v1/me/preferences` | Mise à jour fusion JSON préférences |
| POST | `/api/v1/auth/logout` | Déconnexion **A6.8** |

## Pages légales (A8.1 / A8.2 — sections intégrées)

Pas de fiche séparée P1 ; comportement minimal depuis **A6.7** :

| ID | Titre affiché | Contenu | Notes |
|----|---------------|---------|-------|
| **A8.1** | Politique de confidentialité | URL CMS ou page statique | WebView ou navigateur in-app |
| **A8.2** | Conditions d'utilisation | URL CMS ou page statique | Lien aussi depuis inscription **A6.1** |

## Critères d'acceptation

1. **Given** utilisateur connecté sur **A6.4** **When** tap « Paramètres » **Then** ouverture **A6.7** avec préférences chargées.
2. **Given** utilisateur anonyme **When** accès direct `/settings` **Then** redirect **A6.1** avec `returnTo`.
3. **Given** paramètres **When** changement langue **Then** `PATCH /me/preferences` + UI app dans la nouvelle langue.
4. **Given** toggle push sans permission OS **When** activation **Then** message explicatif + lien Réglages système.
5. **Given** paramètres **When** tap « Politique de confidentialité » **Then** affichage contenu **A8.1**.
6. **Given** paramètres **When** tap « Se déconnecter » puis confirmer **Then** logout API, session purgée, retour **A6.4** anonyme.
7. **Given** PATCH préférences échoue **When** toggle **Then** revert visuel + toast erreur.
8. **Given** abonnement actif **When** affichage **Then** statut « Actif » visible ; tap ouvre **A8.3** gestion.

## Open questions

- **WebView vs navigateur externe** pour A8.1 / A8.2 ?
- **Changement mot de passe in-app** vs email reset (**A6.3**) vs absent P1 ?
- **Marketing notifications** : opt-in séparé dès P1 ?
- **Export / suppression compte (RGPD)** : entrée dans Paramètres ou flux support ?
- **Synchronisation langue** : préférence API vs locale appareil par défaut au premier lancement ?
