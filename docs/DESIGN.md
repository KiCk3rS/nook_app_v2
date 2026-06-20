# Guidelines design — NOOK

**Rôle :** source de vérité **interne** pour garder une identité visuelle et des règles UX **cohérentes** entre maquettes, code et specs d’écran. Ce document ne dépend d’aucun outil externe (Figma, Stitch, etc.).

**Version :** 0.3 — guidelines produit  
**Dernière mise à jour :** 2026-06-18  
**Tokens en code (provisoire) :** `constants/theme.ts`

**Documents liés :** [brief produit](./brief.md) · [inventaire écrans](./ecrans.md) · fiches écran `docs/ecran-{ID}.md` (spec comportementale, skill `spec-ecran-app`)

---

## Comment utiliser ce fichier

| Besoin | Où regarder |
|--------|-------------|
| Couleurs, typo, composants, espacements | Sections 1 à 5 + bloc tokens YAML |
| Règles de ton, microcopy, cohérence | Section 6 |
| Suivre l’avancement design par écran | Section 7 |
| États, flux, accessibilité transverses | Section 8 |
| Comportement détaillé d’un écran (navigation, cas limites) | `docs/ecran-{ID}.md` |

**Principe :** `DESIGN.md` = **quoi** doit ressembler l’app et **comment** rester cohérent. Les fiches `ecran-*.md` = **comportement** écran par écran.

**Statuts design (section 7) :** `Non démarré` · `Exploration` · `Maquette` · `Validé` · `Implémenté` · `N/A`

---

## Tokens machine-readable

Bloc dérivé de l’analyse marketplace (structure Airbnb), adapté NOOK : **couleur primaire brand conservée** (`#2E6BFF`), **police Inter** à la place d’Airbnb Cereal VF.

```yaml
---
version: alpha
name: nook-design-system
description: Application mobile de découverte territoriale — carte au premier plan, interfaces légères en surimpression, CTA brand bleu #2E6BFF, typo Inter à poids modestes. Formes douces (pill search, cartes arrondies), photographie et lisibilité extérieure prioritaires sur la densité typographique.

colors:
  primary: "#2E6BFF"
  primary-active: "#214FBF"
  primary-disabled: "#C5D7FF"
  primary-error-text: "#C13B3B"
  primary-error-text-hover: "#A32F2F"
  ink: "#0E1116"
  body: "#3F3F46"
  muted: "#5B6470"
  muted-soft: "#8A929B"
  hairline: "#E5E7EB"
  hairline-soft: "#EEF0F2"
  border-strong: "#CBD0D6"
  canvas: "#FFFFFF"
  surface-soft: "#F7F7F8"
  surface-card: "#FFFFFF"
  surface-strong: "#F1F2F4"
  on-primary: "#FFFFFF"
  on-dark: "#FFFFFF"
  legal-link: "#428BFF"
  success: "#1DA371"
  warning: "#B8731A"
  star-rating: "#0E1116"
  scrim: "#0E1116"
  map-offline-overlay: "#0E1116"
  marker-default: "#2E6BFF"
  marker-selected: "#0E1116"
  cluster-fill: "#0E1116"
  cluster-text: "#FFFFFF"

typography:
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"
  display-xl:
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: 0
  display-lg:
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: -0.44px
  display-md:
    fontSize: 21px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: 0
  display-sm:
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.18px
  title-md:
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  title-sm:
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0
  rating-display:
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1px
  body-md:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  caption:
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  caption-sm:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.23
    letterSpacing: 0
  badge:
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: 0
  micro-label:
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: 0
  uppercase-tag:
    fontSize: 8px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.32px
    textTransform: uppercase
  button-md:
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0
  button-sm:
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  link:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  nav-link:
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 14px
  lg: 20px
  xl: 32px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px
---
```

---

## 1. Identité visuelle & atmosphère

NOOK est une application de **découverte territoriale** : carte, lieux, guides audio, parcours. L’expérience doit être **fluide, rassurante et lisible en mobilité** (marche, soleil, réseau variable, interruptions, reprise de lecture).

### Direction visuelle

Le canvas de base est **blanc pur** (`{colors.canvas}` — #ffffff) avec encre quasi noire (`{colors.ink}` — #0E1116) pour titres et corps, et une seule tension de **brand bleu** (`{colors.primary}` — #2E6BFF) portant chaque CTA primaire, le marqueur carte par défaut et les liens d’action. La typo tourne sur **Inter** (stack système en repli) à poids modestes — les titres d’affichage restent à 22–28 px en 500/600 plutôt qu’en 700+ lourd ; le système fait confiance à la carte, aux photos de lieu et aux espacements généreux plutôt qu’à la masse typographique.

Le langage de formes est **doux** : boutons à 8 px (`{rounded.sm}`), cartes lieu ~14 px (`{rounded.md}`), barre de recherche en pill (`{rounded.full}`), bottom sheets à 16–20 px (`{rounded.lg}`–`{rounded.xl}`). Pas d’angle dur sauf la grille elle-même.

| Dimension | Intention | Notes |
|-----------|-----------|-------|
| Densité | **Aérée sur la carte** ; contenu éditorial un peu plus dense en fil / listes | La carte reste le plan principal |
| Ton émotionnel | **Exploratoire, clair, moderne** — ni institutionnel rigide ni visuel « startup criard » | — |
| Hiérarchie | **Le lieu et l’action primaire** avant le compte et les réglages | Une intention primaire par vue |
| Mouvement | Transitions **courtes et utiles** ; respect de la réduction des animations système | `motion` dans `theme.ts` |
| Mode | **Clair par défaut** ; mode sombre _à trancher_ | Impact carte et marqueurs |

### Résumé en une phrase (pour briefs internes)

> Application mobile de découverte, carte au premier plan, interfaces légères en surimpression, actions primaires bleu brand, typo Inter lisible en extérieur.

**Caractéristiques clés :**
- Accent unique : `{colors.primary}` (#2E6BFF) pour CTA, marqueurs, liens d’action — utilisé avec parcimonie ; la plupart des écrans restent blanc + encre avec un ou deux moments brand.
- Typo Inter, poids modestes en display (500–700), corps à 400.
- Écran racine = carte (A1.1) ; chrome en surimpression, pas de hub séparé.
- Cartes lieu photo-first : clipping `{rounded.md}`, badge flottant, cœur favori, meta en 4–5 lignes.
- Une seule tier d’élévation (ombre légère au hover / feuilles) — la profondeur vient surtout de la carte et des photos.

---

## 2. Couleurs — palette et rôles

Valeurs alignées sur **`constants/theme.ts`**. Chaque couleur a un **rôle** : ne pas réutiliser une couleur « au feeling » sans vérifier le tableau.

### Brand & accent

| Token | Hex | Rôle |
|-------|-----|------|
| `{colors.primary}` | `#2E6BFF` | CTA primaire, marqueur carte par défaut, liens d’action |
| `{colors.primary-active}` | `#214FBF` | État pressed / pointer-down |
| `{colors.primary-disabled}` | `#C5D7FF` | CTA désactivé (teinte brand pâle) |
| `{colors.on-primary}` | `#FFFFFF` | Texte sur fond brand |

### Surfaces

| Token | Hex | Rôle |
|-------|-----|------|
| `{colors.canvas}` | `#FFFFFF` | Fond principal, cartes |
| `{colors.surface-soft}` | `#F7F7F8` | Feuilles, listes, zones secondaires |
| `{colors.surface-strong}` | `#F1F2F4` | Regroupements, boutons icône circulaires |
| `{colors.surface-card}` | `#FFFFFF` | Cartes lieu, host-card |

### Hairlines & bordures

| Token | Hex | Rôle |
|-------|-----|------|
| `{colors.hairline}` | `#E5E7EB` | Séparateurs, contours légers, diviseurs search |
| `{colors.hairline-soft}` | `#EEF0F2` | Séparations listes / menus |
| `{colors.border-strong}` | `#CBD0D6` | Champs, focus, contours renforcés |

### Texte

| Token | Hex | Rôle |
|-------|-----|------|
| `{colors.ink}` | `#0E1116` | Titres, corps, nav active, marqueur sélectionné |
| `{colors.body}` | `#3F3F46` | Texte courant long (descriptions, avis) |
| `{colors.muted}` | `#5B6470` | Sous-titres, métadonnées lieu, onglets inactifs |
| `{colors.muted-soft}` | `#8A929B` | Hints, labels tertiaires, liens désactivés |
| `{colors.star-rating}` | `#0E1116` | Notes — encre, pas d’or « cheap » |

### Sémantique

| Token | Hex | Rôle |
|-------|-----|------|
| `{colors.success}` | `#1DA371` | Confirmations |
| `{colors.warning}` | `#B8731A` | Alertes non bloquantes |
| `{colors.primary-error-text}` | `#C13B3B` | Erreurs inline, validation |
| `{colors.primary-error-text-hover}` | `#A32F2F` | Erreur au survol |
| `{colors.legal-link}` | `#428BFF` | Liens légaux (CGU, confidentialité) |

### Carte & overlays

| Token | Valeur | Rôle |
|-------|--------|------|
| `{colors.marker-default}` | `#2E6BFF` | Marqueur POI par défaut |
| `{colors.marker-selected}` | `#0E1116` | Marqueur sélectionné |
| `{colors.cluster-fill}` / `{colors.cluster-text}` | `#0E1116` / `#FFFFFF` | Regroupement marqueurs |
| `{colors.scrim}` | `#0E1116` @ 45 % | Modales, sheets plein écran |
| `{colors.map-offline-overlay}` | `#0E1116` @ 18 % | Dégradation carte hors ligne |

**Règle :** toute nouvelle couleur dans le code passe par `theme.ts` et est documentée ici avec son rôle.

**À compléter :** mode sombre, couleurs par catégorie de lieu, validation **WCAG AA** (texte + CTA brand).

---

## 3. Typographie

### Famille

Le système utilise **Inter** pour tout — display, corps, navigation, captions. Stack de repli : `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`. Pas de famille display séparée ; une seule stack porte toute l’échelle.

En React Native / Expo : charger Inter via `expo-font` et définir `typography.fontFamily` dans `theme.ts`.

### Hiérarchie

| Token | Taille | Poids | Interligne | Tracking | Usage NOOK |
|-------|--------|-------|------------|----------|------------|
| `{typography.rating-display}` | 64 px | 700 | 1.1 | -1 px | Note lieu (fiche A3.1) — moment typographique le plus fort |
| `{typography.display-xl}` | 28 px | 700 | 1.43 | 0 | Accroche fil / titre écran (parcimonie) |
| `{typography.display-lg}` | 22 px | 500 | 1.18 | -0.44 px | Titre fiche lieu |
| `{typography.display-md}` | 21 px | 700 | 1.43 | 0 | Sections fiche (« Ce que propose le lieu ») |
| `{typography.display-sm}` | 20 px | 600 | 1.20 | -0.18 px | Sous-sections |
| `{typography.title-md}` | 16 px | 600 | 1.25 | 0 | Titres cartes lieu, blocs ville |
| `{typography.title-sm}` | 16 px | 500 | 1.25 | 0 | En-têtes colonnes footer / paramètres |
| `{typography.body-md}` | 16 px | 400 | 1.5 | 0 | Corps par défaut |
| `{typography.body-sm}` | 14 px | 400 | 1.43 | 0 | Meta carte (distance, durée audio, prix) |
| `{typography.caption}` | 14 px | 500 | 1.29 | 0 | Labels segments search (« Où », « Quand ») |
| `{typography.caption-sm}` | 13 px | 400 | 1.23 | 0 | Ligne légale, copyright |
| `{typography.badge}` | 11 px | 600 | 1.18 | 0 | Badge « Coup de cœur », tags compacts |
| `{typography.micro-label}` | 12 px | 700 | 1.33 | 0 | Micro-labels amenities |
| `{typography.uppercase-tag}` | 8 px | 700 | 1.25 | 0.32 px (uppercase) | Badge « NOUVEAU » |
| `{typography.button-md}` | 16 px | 500 | 1.25 | 0 | CTA primaire |
| `{typography.button-sm}` | 14 px | 500 | 1.29 | 0 | Boutons compacts, strip catégories |
| `{typography.link}` | 14 px | 400 | 1.43 | 0 | Liens inline |
| `{typography.nav-link}` | 16 px | 600 | 1.25 | 0 | Tab bar, nav produit |

### Échelle simplifiée (`theme.ts`)

| Token code | px | Équivalent doc |
|------------|-----|----------------|
| `xs` | 12 | `micro-label` |
| `sm` | 14 | `body-sm`, `button-sm` |
| `md` | 16 | `body-md`, `button-md` |
| `lg` | 18 | — (intermédiaire) |
| `xl` | 20 | `display-sm` |
| `xxl` | 24 | — |
| `display` | 28 | `display-xl` |

### Principes

Poids display modestes — le titre écran à 28 px / 700 reste volontairement contenu ; la carte et les photos portent la hiérarchie. Le seul moment typographiquement « fort » hors titres d’écran est l’affichage de note (`rating-display`, 64 px / 700) sur fiche lieu.

---

## 4. Composants

Détails pixel-perfect à valider en maquette ; règles ci-dessous guident dev et design.

### Boutons

| Composant | Règle |
|-----------|--------|
| `button-primary` | Fond `{colors.primary}`, texte `{colors.on-primary}`, `{typography.button-md}`, `{rounded.sm}`, padding 14×24 px, hauteur 48 px |
| `button-primary-active` | Fond `{colors.primary-active}` — pas de transform ni changement d’ombre |
| `button-primary-disabled` | Fond `{colors.primary-disabled}`, curseur non autorisé |
| `button-secondary` | Fond `{colors.canvas}`, texte `{colors.ink}`, contour 1 px ink, `{rounded.sm}`, 48 px |
| `button-tertiary-text` | Texte ink, pas de surface ; souligné au survol (« Voir plus ») |
| `button-pill-brand` | Pill `{rounded.full}`, fond brand, `{typography.button-sm}`, padding 10×20 px |
| Icône | Cible **≥ 44×44 pt** ; label accessibilité obligatoire |

### Recherche

| Composant | Règle |
|-----------|--------|
| `search-bar-pill` | Fond blanc, `{rounded.full}`, 64 px, bordure hairline ; segments `{search-field-segment}` |
| `search-orb` | Disque brand 48×48 px, `{rounded.full}`, icône loupe blanche — CTA recherche |

### Cartes & surfaces

| Composant | Règle |
|-----------|--------|
| `property-card` / carte lieu | Photo `{rounded.md}`, carousel, badge favori, cœur ; meta `{typography.body-sm}` |
| `guest-favorite-badge` | Pill blanc `{rounded.full}`, `{typography.badge}`, ombre légère |
| `host-card` | Surface blanche, `{rounded.md}`, padding 24 px |
| `reservation-card` | Rail sticky fiche (si applicable), bordure hairline + ombre unique |
| Bottom sheet | `{rounded.lg}` supérieur, ombre `elevation.sheet` |
| Bannière statut | Pleine largeur ; warning / error selon cas |

### Champs

| Composant | Règle |
|-----------|--------|
| `text-input` | Fond blanc, bordure `{colors.hairline}`, `{rounded.sm}`, 56 px, padding 14×12 px ; focus 2 px `{colors.ink}`, pas de glow |
| Erreur | Texte `{colors.primary-error-text}` sous le champ |

### Carte

| Élément | Règle |
|---------|--------|
| Marqueur | `{colors.marker-default}` ; sélection `{colors.marker-selected}` |
| Cluster | `{colors.cluster-fill}` / `{colors.cluster-text}` |
| Contrôles flottants | Ombre `elevation.control`, `zIndex.mapControls` |

### Date picker

| Composant | Règle |
|-----------|--------|
| `date-picker-day` | Cellule 40×40 px, `{rounded.full}`, `{typography.body-sm}` |
| `date-picker-day-selected` | Fond `{colors.ink}`, texte blanc |

### Lecteur audio (mini-player)

Persistant (`zIndex.miniPlayer`) : titre tronqué, progression, play/pause, lien fiche lieu. Ne pas cacher le CTA principal sans offset documenté.

### Navigation (racine A1.1)

Accès fil, recherche, compte depuis la carte — **pas de hub séparé**. Tab bar hauteur 64 px (`tabBarHeight`). Icônes avec libellés accessibles.

### Footer / légal

| Composant | Règle |
|-----------|--------|
| `footer-light` | Fond canvas, padding 48×80 px, colonnes liens |
| `legal-band` | Copyright, langue, réseaux — `{typography.caption-sm}`, `{colors.muted}` |

---

## 5. Mise en page, espacement & élévation

### Spacing

- **Unité de base :** 4 px (micro-step 2 px).
- **Tokens :** `{spacing.xxs}` 2 · `{spacing.xs}` 4 · `{spacing.sm}` 8 · `{spacing.md}` 12 · `{spacing.base}` 16 · `{spacing.lg}` 24 · `{spacing.xl}` 32 · `{spacing.xxl}` 48 · `{spacing.section}` 64.
- **Marges écran :** horizontales 16–20 px (`spacing.base`–`lg`).
- **Safe areas :** feuilles et mini-player au-dessus des zones système.
- **Padding cartes :** 24 px (`host-card`, `reservation-card`) ; 16 px meta carte lieu ; 8 px gouttières captions.

### Grille & conteneur

- **Mobile-first (Expo)** ; admin (partie B) _à trancher_.
- **Largeur contenu max :** ~1280 px éditorial ; fiches lieu ~1080 px si split colonnes.
- **Z-index :** `theme.zIndex` — map → contrôles → chrome → mini-player → bannières → sheets → modales → toasts.

### Élévation

Une seule tier d’ombre + baseline plate :

- **Plat :** corps, carte, footer — ~95 % des surfaces.
- **Float / hover :** `box-shadow: rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px` — cartes au survol, search bar, dropdowns, `elevation.card` / `elevation.sheet` en code.
- **Scrim modal :** `{colors.scrim}` @ 45 %.

### Responsive (mobile)

| Plage | Changements clés |
|-------|------------------|
| Mobile | < 744 px — search en pill unique ; cartes 1 colonne ; fiche lieu : rail réservation → barre sticky bas |
| Tablette | 744–1128 px — cartes 2-up ; split recherche _à trancher_ |
| Desktop / web | > 1128 px — grilles multi-colonnes si applicable |

### Cibles tactiles

- CTA primaire ≥ 48×48 px.
- Orb recherche 48×48 px.
- Bouton cœur / icône ≥ 44×44 pt effectif (padding inclus).

**À compléter :** tablette paysage, split recherche, couleurs catégories carte.

---

## 6. Voix, microcopy & cohérence

### Ton

- **Clair et rassurant** — pas de jargon technique vers l’utilisateur.
- **Orienté action** sur les boutons : « Écouter le guide », « Ajouter au parcours », « Réessayer ».
- **Vide utile** : expliquer pourquoi c’est vide + proposer une action, pas seulement « Aucun résultat ».

### Règles produit à respecter partout

- **Écran racine** = carte (A1.1), pas d’accueil hub distinct.
- **Une intention primaire** par écran.
- **Permissions** (géoloc, notifications) : bénéfice explicite avant la demande système.
- **Erreurs** : message compréhensible + action (réessayer, paramètres, continuer sans).

### Ce que ce document ne couvre pas

Les parcours détaillés, états edge case et critères d’acceptation vivent dans **`docs/ecran-{ID}.md`**, en renvoyant ici pour les tokens visuels.

---

## 7. Registre des écrans

Dérivé de [ecrans.md](./ecrans.md). Mettre à jour au fil de l’eau.

| ID | Écran | Priorité | Statut design | Référence maquette | Fiche spec |
|----|--------|----------|---------------|-------------------|------------|
| A1.1 | Carte-accueil (racine) | P0 | Exploration | — | _à créer_ |
| A1.2 | Demande d’autorisations | P0 | Non démarré | — | — |
| A1.3 | Erreur / indisponibilité racine | P1 | Non démarré | — | — |
| A1.4 | Aperçu rapide lieu | P0 | Non démarré | — | — |
| A2.1 | Recherche textuelle | P1 | Non démarré | — | — |
| A2.2 | Panneau filtres | P1 | Non démarré | — | — |
| A2.3 | Liste résultats | P1 | Non démarré | — | — |
| A2.4 | Carte filtrée / résultats | P1 | Non démarré | — | — |
| A3.1 | Fiche lieu | P0 | Non démarré | — | — |
| A3.2 | Lecteur audio | P0 | Non démarré | — | — |
| A3.3 | Ajout au parcours | P1 | Non démarré | — | — |
| A4.1 | Fil de découverte | P0 | Non démarré | — | — |
| A4.2 | Recommandations | Évolution | N/A | — | — |
| A5.1 | Liste parcours | P1 | Non démarré | — | — |
| A5.2 | Création / édition parcours | P1 | Non démarré | — | — |
| A5.3 | Modèles de parcours | P2 | Non démarré | — | — |
| A5.4 | Parcours sur carte | P1 | Non démarré | — | — |
| A5.5 | Détail parcours (guidage) | P1 | Non démarré | — | — |
| A6.1 | Connexion | P1 | Non démarré | — | — |
| A6.2 | Inscription | P1 | Non démarré | — | — |
| A6.3 | Réinitialisation MDP | P1 | Non démarré | — | — |
| A6.4 | Profil | P1 | Non démarré | — | — |
| A6.5 | Favoris | P2 | Non démarré | — | — |
| A6.6 | Historique d’écoute | P2 | Non démarré | — | — |
| A6.7 | Paramètres | P1 | Non démarré | — | — |
| A6.8 | Déconnexion | P1 | Non démarré | — | — |
| A7.1 | Dialogue guide | Évolution | N/A | — | — |
| A8.1 | Légal / confidentialité | P1 | Non démarré | — | — |
| A8.2 | CGU | P1 | Non démarré | — | — |

### Administration (partie B)

| ID | Écran | Statut design | Référence maquette | Fiche spec |
|----|--------|---------------|-------------------|------------|
| B1–B8 | _(voir ecrans.md)_ | Non démarré | — | — |

**Fusions possibles :** plusieurs IDs → une vue (ex. A2.1 + A2.2). Noter les IDs couverts dans la fiche spec de la vue maître.

**Colonne « Référence maquette » :** lien Figma, capture dans `docs/assets/`, ou chemin fichier — ce qui vous utilisez.

---

## 8. Patterns transversaux

### États obligatoires (chaque écran)

| État | Affichage | Action |
|------|-----------|--------|
| Chargement | Skeleton / indicateur adapté | — |
| Vide | Message + invitation | CTA contextuel |
| Erreur réseau | Message clair | Réessayer |
| Hors ligne | Overlay carte léger ou bannière | Dégradé si prévu |
| Permission refusée | Explication | Réglages / continuer sans |

### Flux prioritaires (design)

1. A1.1 → A1.4 → A3.1 → A3.2  
2. A4.1 → A3.1 → A3.2  
3. A2.x → A3.1  
4. A5.x ↔ A1.1 / A3  
5. Compte minimal : A6.1–A6.4, A6.7–A6.8  

### Accessibilité (minimum)

- Contraste **WCAG AA** sur texte et CTA  
- Icônes seules : libellé lecteur d’écran  
- Cibles **≥ 44×44 pt**  

---

## Journal des décisions

| Date | Décision |
|------|----------|
| 2026-05-22 | Création ; tokens `theme.ts` ; A1.1 en Exploration |
| 2026-05-22 | v0.2 : document recentré guidelines internes (sans Stitch) |
| 2026-06-18 | v0.3 : enrichissement tokens (couleurs, typo, spacing, composants, élévation) depuis analyse marketplace ; primary `#2E6BFF` conservée ; typo **Inter** |

---

## Open questions

- [ ] Chargement Inter via `expo-font` — variante variable ou statique ?
- [ ] Mode sombre  
- [ ] Bottom nav vs barre supérieure sur A1.1  
- [ ] Couleurs catégories sur la carte  
- [ ] Validation WCAG brand / erreur  

---

*Maintenir ce fichier à chaque décision visuelle figée. Implémenter les tokens dans `constants/theme.ts` pour garder code et doc alignés.*
