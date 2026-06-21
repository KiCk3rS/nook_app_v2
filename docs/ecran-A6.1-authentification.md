# A6.1 — Authentification (connexion, inscription, réinitialisation MDP)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | **A6.1** (connexion) · **A6.2** (inscription) · **A6.3** (réinitialisation MDP) |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §5.1, §6 ; écrans liés : **A6.4**, **A8.3**, **A6.7**, **A8.2** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Profil A6.4](./ecran-A6.4-profil.md) · [API client](./api-client-reference.md) |

## Résumé

**Utilisateur :** se connecter, créer un compte ou récupérer l'accès à son compte pour synchroniser parcours et préférences.

**Produit :** flux d'authentification unifié en **feuille modale ou pile dédiée**, invocable depuis le profil, le paywall ou tout écran nécessitant une session ; retour transparent vers l'écran d'origine après succès.

## Utilisateur et contexte

- **Persona / situation :** visiteur anonyme qui a exploré NOOK sans compte et souhaite sauvegarder ; utilisateur existant qui revient sur un nouvel appareil ; utilisateur ayant oublié son mot de passe.
- **Contraintes :** réseau variable ; clavier virtuel occupe l'écran ; méfiance sur la collecte de données (brief §5.2) ; rate-limit API (429).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A6.4** — CTA « Se connecter » / « Créer un compte » ; **A8.3** — achat lié au compte ; toute route protégée renvoyant 401 ; deep link `/auth/login` ou `/auth/register` (optionnel MVP). |
| **Sorties** | Succès → écran `returnTo` (défaut **A6.4** connecté) ; **A6.2** depuis lien « Créer un compte » sur connexion ; **A6.1** depuis lien « Déjà un compte » sur inscription ; **A6.3** depuis « Mot de passe oublié » ; **A8.2** — CGU (inscription). |
| **Retour arrière** | Bouton retour / swipe down (feuille) ; annule sans modifier la session ; retour à l'écran appelant. |

**Paramètres de navigation (contexte)**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `returnTo` | route ou callback | Destination post-auth (ex. `(tabs)/profil`, paywall) |
| `source` | string | Analytics : `profile`, `paywall`, `protected_route`, `deeplink` |
| `initialMode` | `login` \| `register` | Mode d'ouverture |

## Structure de l'interface

### Hiérarchie visuelle (1 = plus important)

**Connexion (A6.1)**

1. **Champs identifiants** — email, mot de passe.
2. **CTA « Se connecter »** — action primaire.
3. **Lien « Mot de passe oublié »** — accès A6.3.
4. **Lien « Créer un compte »** — bascule vers A6.2.

**Inscription (A6.2)**

1. **Champs obligatoires** — email, mot de passe, confirmation mot de passe.
2. **CTA « Créer mon compte »** — action primaire.
3. **Mention CGU** — acceptation implicite ou case à cocher (open question).
4. **Lien « Déjà un compte ? Se connecter »**.

**Réinitialisation MDP (A6.3)**

1. **Explication** — email de récupération.
2. **Champ email**.
3. **CTA « Envoyer le lien »**.
4. **État confirmation** — message succès (email envoyé).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Poignée / fermer** | Sortie | — | 44×44 pt ; visible en mode feuille |
| **En-tête** | Contexte | Titre selon mode | « Connexion », « Créer un compte », « Mot de passe oublié » |
| **Champ email** | Saisie | `email` | `keyboardType="email-address"`, `autoComplete="email"`, validation format |
| **Champ mot de passe** | Saisie | `password` | Masqué ; toggle visibilité ; min 8 car. (API) |
| **Champ confirmation MDP** | Saisie (inscription) | `passwordConfirm` | Uniquement A6.2 ; erreur si mismatch |
| **Champs optionnels inscription** | Enrichissement | `displayName?`, `firstName?`, `lastName?` | Section « Optionnel » repliée en MVP ou absent P1 |
| **CTA principal** | Soumission | — | Disabled si champs invalides ou requête en cours |
| **Liens secondaires** | Navigation inter-modes | — | Style texte, sous le CTA |
| **Mention légale** | Confiance | Lien **A8.2** | « En créant un compte, vous acceptez nos conditions d'utilisation. » |

### Champs et validation

| Champ | Obligatoire | Règles | Message erreur |
|-------|-------------|--------|----------------|
| `email` | Oui | Format email valide | « Adresse e-mail invalide » |
| `password` | Oui | ≥ 8 caractères | « Le mot de passe doit contenir au moins 8 caractères » |
| `passwordConfirm` | Oui (inscription) | Identique à `password` | « Les mots de passe ne correspondent pas » |
| `displayName` | Non | 1–50 car. si renseigné | Message API 422 |

## Interactions et règles

- **Connexion :** `POST /api/v1/auth/login` → stocker `accessToken` + `refreshToken` (stockage sécurisé) + objet `user` ; naviguer vers `returnTo`.
- **Inscription :** `POST /api/v1/auth/register` → même traitement tokens ; toast « Compte créé » ; navigation `returnTo`.
- **409 email existant :** message « Cette adresse e-mail est déjà utilisée » + lien vers connexion.
- **401 identifiants invalides :** message générique « E-mail ou mot de passe incorrect » (ne pas révéler si l'email existe).
- **422 validation :** messages par champ depuis l'API.
- **429 throttle :** « Trop de tentatives. Réessayez dans quelques minutes. » ; CTA disabled temporairement.
- **Refresh token :** hors écran — géré globalement (`POST /auth/refresh`) avant expiration access token ; si échec → redirect A6.1 avec `returnTo` courant.
- **Mot de passe oublié (A6.3) :** **pas d'endpoint documenté** dans l'API actuelle — flux client provisoire : saisie email → écran confirmation ; branchement API futur `POST /auth/forgot-password` (open question).
- **Exploration sans compte :** depuis **A6.4**, fermeture feuille sans auth = retour profil anonyme (pas de blocage).
- **Paywall :** si auth requise avant achat **A8.3**, ouvrir A6.1 avec `returnTo` = paywall ; après succès, rouvrir paywall sans perte de contexte (`itineraryId`, etc.).

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Connexion — initial** | Ouverture mode login | Formulaire vide ou email pré-rempli | Saisie, soumettre, basculer modes |
| **Inscription — initial** | Bascule ou `initialMode=register` | Formulaire inscription | Saisie, soumettre |
| **Soumission en cours** | Tap CTA | Bouton loading, champs disabled | — |
| **Succès auth** | 200 login/register | Fermeture feuille + navigation `returnTo` | — |
| **Erreur identifiants** | 401 login | Message inline sous formulaire | Corriger, réessayer |
| **Erreur email pris** | 409 register | Message inline + lien connexion | Connexion |
| **Erreur validation** | 422 | Messages par champ | Corriger |
| **Rate limit** | 429 | Bannière + CTA disabled | Attendre, réessayer |
| **Erreur réseau** | Timeout / offline | « Vérifiez votre connexion » | Réessayer |
| **Reset MDP — saisie** | Lien depuis login | Champ email + CTA | Envoyer |
| **Reset MDP — envoyé** | Soumission (client ou API) | Message confirmation | Retour connexion |
| **Reset MDP — email inconnu** | Réponse API future | Message neutre « Si un compte existe… » | Retour connexion |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre connexion | « Connexion » |
| Titre inscription | « Créer un compte » |
| Titre reset | « Mot de passe oublié » |
| Sous-titre connexion | « Retrouvez vos parcours et votre expérience NOOK. » |
| Sous-titre inscription | « Quelques informations pour commencer. » |
| Sous-titre reset | « Nous vous enverrons un lien pour réinitialiser votre mot de passe. » |
| Label email | « Adresse e-mail » |
| Label mot de passe | « Mot de passe » |
| Label confirmation | « Confirmer le mot de passe » |
| CTA connexion | « Se connecter » |
| CTA inscription | « Créer mon compte » |
| CTA reset | « Envoyer le lien » |
| Mot de passe oublié | « Mot de passe oublié ? » |
| Créer compte | « Pas encore de compte ? Créer un compte » |
| Déjà compte | « Déjà un compte ? Se connecter » |
| CGU inscription | « En créant un compte, vous acceptez nos [conditions d'utilisation]. » |
| Succès inscription | « Bienvenue sur NOOK ! » |
| Erreur 401 | « E-mail ou mot de passe incorrect. » |
| Erreur 409 | « Cette adresse e-mail est déjà utilisée. » |
| Erreur 429 | « Trop de tentatives. Réessayez dans quelques minutes. » |
| Erreur réseau | « Connexion impossible. Vérifiez votre réseau et réessayez. » |
| Reset envoyé | « Si un compte existe pour cette adresse, vous recevrez un e-mail sous peu. » |
| Fermer | « Fermer » |

**Ton :** direct, rassurant ; pas de jargon ; messages d'erreur sans fuite d'information (email existant vs identifiants).

## Accessibilité

- `accessibilityViewIsModal` en mode feuille.
- Ordre focus : fermer → email → mot de passe → CTA → liens secondaires.
- Labels explicites sur champs ; erreurs annoncées (`accessibilityLiveRegion`).
- Toggle visibilité mot de passe : label « Afficher le mot de passe » / « Masquer le mot de passe ».
- Cibles ≥ 44×44 pt ; contraste WCAG AA sur CTA et liens.
- Autofill : `autoComplete="email"`, `password`, `new-password` (inscription).

## Indicateurs et analytics

| Événement | Paramètres (sans PII) |
|-----------|------------------------|
| `auth_sheet_opened` | `mode` (login, register, reset), `source` |
| `auth_login_submitted` | `source` |
| `auth_login_success` | `source` |
| `auth_login_failed` | `error_type` (401, 422, 429, network) |
| `auth_register_submitted` | `source`, `has_display_name` (bool) |
| `auth_register_success` | `source` |
| `auth_register_failed` | `error_type` |
| `auth_mode_switched` | `from`, `to` |
| `auth_reset_requested` | — |
| `auth_dismissed` | `mode`, `had_input` |

## Contrat API (existant)

| Méthode | Chemin | Usage |
|---------|--------|-------|
| POST | `/api/v1/auth/login` | Connexion **A6.1** |
| POST | `/api/v1/auth/register` | Inscription **A6.2** |
| POST | `/api/v1/auth/refresh` | Renouvellement session (global) |
| POST | `/api/v1/auth/logout` | Déconnexion — voir **A6.4** / **A6.7** |

**Corps register :** `{ email, password, displayName?, firstName?, lastName?, birthDate? }`  
**Corps login :** `{ email, password }`  
**Réponse succès :** `{ accessToken, refreshToken, user }`

### Réinitialisation MDP (provisoire — non implémenté API)

Endpoint suggéré :

```
POST /api/v1/auth/forgot-password
{ "email": "…" }
→ 200 neutre (toujours même message côté client)
```

## Critères d'acceptation

1. **Given** profil anonyme **A6.4** **When** tap « Se connecter » **Then** feuille connexion **A6.1** s'ouvre.
2. **Given** feuille connexion **When** identifiants valides + « Se connecter » **Then** `POST /auth/login` 200, tokens stockés, retour **A6.4** en état connecté.
3. **Given** feuille connexion **When** identifiants invalides **Then** message « E-mail ou mot de passe incorrect » sans fermeture.
4. **Given** feuille connexion **When** tap « Créer un compte » **Then** bascule vers formulaire **A6.2** sans fermer la feuille.
5. **Given** inscription **When** email déjà utilisé (409) **Then** message explicite + lien vers connexion.
6. **Given** inscription **When** champs valides **Then** `POST /auth/register` 200, navigation `returnTo`.
7. **Given** paywall **A8.3** nécessitant compte **When** auth requise **Then** A6.1 avec `returnTo` paywall ; **When** login succès **Then** paywall rouvert avec contexte itinéraire intact.
8. **Given** rate limit 429 **When** soumission **Then** message throttle, pas de crash.
9. **Given** connexion **When** tap « Mot de passe oublié » **Then** écran **A6.3** ; **When** email soumis **Then** message confirmation neutre.
10. **Given** feuille auth **When** fermeture sans soumettre **Then** session inchangée, retour écran appelant.

## Open questions

- **CGU inscription :** acceptation implicite (lien) vs case à cocher obligatoire ?
- **Champs optionnels inscription** visibles P1 ou report post-création (feuille profil **A6.4**) ?
- **Endpoint forgot-password** : délai d'implémentation backend ?
- **Social login** (Apple, Google) : hors P1 ou inclus ?
- **Biométrie** (Face ID / empreinte) : post-MVP pour reconnexion rapide ?
- **Feuille vs pile plein écran** : feuille depuis profil, plein écran depuis deep link ?
