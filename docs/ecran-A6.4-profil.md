# A6.4 — Profil (Mon compte)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A6.4 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.6, §5.1, §5.2, §6 ; écrans liés : **A6.1**, **A6.2**, **A6.7**, **A6.8**, **A5.1**, **A6.5**, **A6.6**, **A8.3**, **A8.1**, **A8.2** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Authentification A6.1](./ecran-A6.1-authentification.md) · [Paramètres A6.7](./ecran-A6.7-parametres.md) · [Parcours A5.1](./ecran-A5.1-liste-parcours.md) · [Paywall A8.3](./ecran-A8.3-paywall-premium.md) · [API client](./api-client-reference.md) |

## Résumé

**Utilisateur :** accéder à son espace personnel, voir ou modifier les informations qu'il choisit d'afficher, et atteindre ses parcours, paramètres et actions de compte.

**Produit :** hub « Mon compte » depuis la bottom nav ; différencie clairement **visiteur anonyme** (incitation à se connecter sans bloquer l'exploration) et **utilisateur authentifié** (identité, raccourcis, déconnexion).

## Utilisateur et contexte

- **Persona / situation :** voyageur qui veut retrouver ses parcours, gérer son compte ou se connecter après avoir exploré sans compte ; accès fréquent depuis l'onglet **Profil** (4ᵉ onglet).
- **Contraintes :** usage une main, debout ; réseau variable ; session expirée possible (401) ; données personnelles limitées au strict nécessaire (brief §5.2).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | Bottom nav **Profil** (route `(tabs)/profil`) — point d'entrée principal ; deep link `/profil` (optionnel MVP) ; retour depuis **A6.1** / **A6.2** après connexion réussie. |
| **Sorties** | **A6.1** — « Se connecter » ; **A6.2** — « Créer un compte » ; **A6.7** — « Paramètres » ; **A5.1** — « Mes parcours » ; **A6.6** — « Historique d'écoute » (P2) ; **A8.3** — statut premium / « Passer à Premium » ; **A8.1** / **A8.2** — liens légaux (via paramètres ou pied de page) ; **A6.5** — onglet Favoris (tab dédié, pas de navigation obligatoire depuis le profil). |
| **Retour arrière** | Pas de retour in-app (racine d'onglet) ; changement d'onglet via bottom nav ; geste OS back = comportement natif (sortie app ou onglet précédent selon pile). |

**Note navigation :** l'onglet **Favoris** existe déjà en tab séparé — le profil **ne duplique pas** cette entrée en P1 ; un raccourci « Mes favoris » reste optionnel (P2) si produit le souhaite.

## Structure de l'interface

### Hiérarchie visuelle (1 = plus important)

**État anonyme**

1. **Message d'accueil** — valeur du compte NOOK (sauvegarder parcours, sync multi-appareils).
2. **CTA « Se connecter »** — action primaire.
3. **CTA secondaire « Créer un compte »**.
4. **Lien « Continuer sans compte »** — renvoie vers onglet Carte ou ferme la feuille si contexte modal.

**État connecté**

1. **En-tête identité** — avatar, nom affiché, email (partiellement masqué si souhaité).
2. **CTA « Modifier le profil »** — accès feuille édition.
3. **Bloc raccourcis** — parcours, paramètres, premium (si applicable).
4. **Actions de compte** — déconnexion (niveau 2, style destructif discret).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **En-tête écran** | Ancrage | Titre « Mon compte » | Fixe ; pas de bouton retour |
| **Carte bienvenue (anonyme)** | Incitation | Illustration légère + 2–3 bénéfices (parcours, sync, premium) | Ton rassurant, pas culpabilisant |
| **CTA connexion** | Action primaire | Lien **A6.1** | Bouton pleine largeur, zone ≥ 44×44 pt |
| **CTA inscription** | Action secondaire | Lien **A6.2** | Style outline / texte |
| **En-tête identité (connecté)** | Reconnaissance | `displayName` ou `firstName` + `lastName` ; fallback email ; `email` ; avatar initiales ou photo | Email masqué partiel : `u***@example.com` (open question) |
| **Badge statut premium** | Monétisation | `subscriptionStatus?`, `premiumUntil?` | Visible si abonnement actif ; sinon lien discret vers **A8.3** |
| **Ligne « Mes parcours »** | Raccourci | Compteur `savedRoutesCount?` | Chevron → **A5.1** |
| **Ligne « Paramètres »** | Raccourci | — | Chevron → **A6.7** |
| **Ligne « Historique d'écoute »** | Raccourci P2 | Compteur ou « Récent » | Masquée en P1 si écran **A6.6** non livré |
| **Bouton « Se déconnecter »** | Fin de session | Action **A6.8** | Style texte rouge discret ; confirmation modale |
| **Feuille édition profil** | Modification | Champs éditables (voir ci-dessous) | Swipe down pour fermer ; sauvegarde explicite |
| **Modale confirmation déconnexion** | Sécurité | « Se déconnecter ? » | Annuler / Confirmer |

### Champs profil éditables (feuille intégrée)

| Champ | Source API | Éditable | Validation / notes |
|-------|------------|----------|------------------|
| `displayName` | GET/PATCH `/api/v1/me` | Oui | Optionnel ; 1–50 car. ; nom public |
| `firstName` | idem | Oui | Optionnel |
| `lastName` | idem | Oui | Optionnel |
| `birthDate` | idem | Oui | Optionnel ; sélecteur date ; usage conformité si requis |
| `email` | GET `/api/v1/me` | Non (MVP) | Lecture seule ; changement email = flux dédié (hors P1) |
| `avatarUrl` | — | Non (MVP) | Initiales générées localement ; upload photo = évolution |

**Préférences** (langue, notifications) : **A6.7** via `PATCH /api/v1/me/preferences` — pas sur la feuille profil identité.

## Interactions et règles

- **Gestes :** scroll vertical sur la page ; swipe down pour fermer la feuille édition.
- **Session :** au focus onglet Profil, si token présent → `GET /api/v1/me` ; 401 → bascule état anonyme + toast « Session expirée » + proposition **A6.1**.
- **Édition profil :** `PATCH /api/v1/me` partiel ; bouton « Enregistrer » actif seulement si changements ; 422 → messages par champ.
- **Déconnexion (A6.8) :** `POST /api/v1/auth/logout` avec `refreshToken` ; purge tokens locaux ; retour état anonyme ; mini-player audio et parcours locaux : conserver cache anonyme (open question sync).
- **Exploration sans compte :** message explicite « Vous pouvez continuer à explorer sans compte » (aligné placeholder actuel).
- **Premium :** si abonnement actif, badge « Premium actif » ; tap → **A8.3** en mode gestion / info (restaurer achats).
- **Pull-to-refresh :** recharge profil si connecté.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Anonyme** | Pas de token ou logout | Carte bienvenue + CTA connexion/inscription | **A6.1**, **A6.2**, changer d'onglet |
| **Chargement** | Token présent, fetch `/me` en cours | Skeleton en-tête + 2 lignes | — |
| **Connecté — contenu OK** | 200 `/me` | Identité + raccourcis + déconnexion | Édition, navigation, déconnexion |
| **Connecté — profil minimal** | Champs vides | Initiales + email ; invite « Compléter votre profil » | Ouvrir feuille édition |
| **Erreur réseau** | Fetch échoue | Bannière « Impossible de charger votre profil » | « Réessayer » |
| **Session expirée** | 401 sur `/me` | Bascule anonyme + toast | **A6.1** |
| **Édition — sauvegarde** | PATCH en cours | Bouton loading | — |
| **Édition — succès** | 200 PATCH | Toast « Profil mis à jour » ; fermeture feuille | — |
| **Édition — erreur validation** | 422 | Messages inline sous champs | Corriger et réessayer |
| **Déconnexion — confirmation** | Tap « Se déconnecter » | Modale | Annuler / Confirmer |
| **Déconnexion — en cours** | Confirm tap | Overlay discret | — |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre écran | « Mon compte » |
| Bienvenue anonyme | « Connectez-vous pour retrouver vos parcours et synchroniser votre expérience. » |
| Bénéfice 1 | « Sauvegardez vos parcours » |
| Bénéfice 2 | « Reprenez où vous en étiez sur tous vos appareils » |
| CTA connexion | « Se connecter » |
| CTA inscription | « Créer un compte » |
| Lien sans compte | « Continuer sans compte » |
| Invité compléter profil | « Ajoutez un nom pour personnaliser votre espace » |
| Modifier profil | « Modifier le profil » |
| Enregistrer | « Enregistrer » |
| Annuler édition | « Annuler » |
| Mes parcours | « Mes parcours » |
| Paramètres | « Paramètres » |
| Historique | « Historique d'écoute » |
| Premium actif | « Premium actif » |
| Passer premium | « Découvrir Premium » |
| Déconnexion | « Se déconnecter » |
| Modale déconnexion titre | « Se déconnecter ? » |
| Modale déconnexion corps | « Vous devrez vous reconnecter pour accéder à vos parcours enregistrés. » |
| Modale confirmer | « Se déconnecter » |
| Modale annuler | « Annuler » |
| Session expirée | « Votre session a expiré. Reconnectez-vous pour continuer. » |
| Erreur chargement | « Impossible de charger votre profil. Vérifiez votre connexion. » |
| Réessayer | « Réessayer » |
| Succès mise à jour | « Profil mis à jour » |
| Erreur générique | « Une erreur est survenue. Réessayez. » |

**Ton :** clair, rassurant ; pas de jargon technique ; pas de culpabilisation pour l'usage anonyme.

## Accessibilité

- Titre d'écran annoncé : « Mon compte ».
- Labels : « Se connecter », « Créer un compte », « Modifier le profil », « Mes parcours », « Paramètres », « Se déconnecter », « Fermer l'édition du profil ».
- Avatar : alternative textuelle « Photo de profil de {displayName} » ou « Initiales {XX} ».
- Champs formulaire : labels associés, messages d'erreur annoncés au focus.
- Cibles tactiles ≥ 44×44 pt ; espacement entre lignes de menu ≥ 8 pt.
- Contraste WCAG AA sur CTA et texte destructif (déconnexion).
- Réduction de mouvement : pas d'animation d'entrée agressive sur la feuille édition.

## Indicateurs et analytics

| Événement | Paramètres (sans PII) |
|-----------|------------------------|
| `profile_viewed` | `auth_state` (anonymous, authenticated) |
| `profile_login_tapped` | `source` (profile_cta) |
| `profile_register_tapped` | `source` (profile_cta) |
| `profile_edit_opened` | — |
| `profile_updated` | `fields_changed[]` (ex. displayName, firstName — pas de valeurs) |
| `profile_logout_tapped` | — |
| `profile_logout_confirmed` | — |
| `profile_shortcut_tapped` | `destination` (routes, settings, history, premium) |
| `profile_load_error` | `error_type` (network, 401, 5xx) |

## Contrat API (existant)

| Méthode | Chemin | Usage écran |
|---------|--------|-------------|
| GET | `/api/v1/me` | Chargement profil connecté |
| PATCH | `/api/v1/me` | Mise à jour identité |
| POST | `/api/v1/auth/logout` | Déconnexion (**A6.8**) |

Champs utilisateur connus (auth + profil) : `id`, `email`, `displayName`, `firstName`, `lastName`, `birthDate`, `role`.

## Critères d'acceptation

1. **Given** utilisateur anonyme sur l'onglet Profil **When** l'écran s'affiche **Then** carte bienvenue, CTA « Se connecter » et « Créer un compte » visibles ; exploration possible via les autres onglets.
2. **Given** utilisateur anonyme **When** tap « Se connecter » **Then** navigation vers **A6.1** ; **When** connexion réussie **Then** retour profil en état connecté avec données `/me`.
3. **Given** utilisateur connecté **When** ouverture Profil **Then** nom affiché (ou email fallback), email visible, raccourcis parcours et paramètres actifs.
4. **Given** profil connecté **When** tap « Modifier le profil » **Then** feuille édition ; **When** modification `displayName` + « Enregistrer » **Then** `PATCH /me` 200, toast succès, valeurs rafraîchies.
5. **Given** PATCH invalide (422) **When** sauvegarde **Then** messages d'erreur par champ, feuille reste ouverte.
6. **Given** session expirée (401) **When** chargement profil **Then** état anonyme + toast session expirée.
7. **Given** utilisateur connecté **When** tap « Se déconnecter » puis confirmer **Then** logout API, tokens purgés, état anonyme, pas de données profil résiduelles à l'écran.
8. **Given** erreur réseau au chargement **When** affichage **Then** bannière erreur + « Réessayer » relance `GET /me`.
9. **Given** utilisateur connecté **When** tap « Mes parcours » **Then** navigation **A5.1**.
10. **Given** utilisateur connecté sans abonnement **When** tap lien Premium **Then** ouverture **A8.3**.

## Open questions

- **Email masqué** en affichage : partiel vs complet ?
- **Changement d'email / mot de passe** : flux dédié dans **A6.7** ou écran séparé ?
- **Raccourci Favoris** depuis le profil alors qu'un onglet dédié existe ?
- **Parcours locaux non synchronisés** après déconnexion : conserver, migrer ou avertir ?
- **Photo de profil** : MVP initiales uniquement ou upload dès P1 ?
- **Statut premium** : champ API dédié ou dérivé côté client / store ?
- **Deep link `/profil`** : nécessaire au lancement ou post-MVP ?
