# Guidelines design — NOOK

**Rôle :** source de vérité **interne** pour garder une identité visuelle et des règles UX **cohérentes** entre maquettes, code et specs d’écran. Ce document ne dépend d’aucun outil externe (Figma, Stitch, etc.).

**Version :** 0.2 — guidelines produit  
**Dernière mise à jour :** 2026-05-22  
**Tokens en code (provisoire) :** `constants/theme.ts`

**Documents liés :** [brief produit](./brief.md) · [inventaire écrans](./ecrans.md) · fiches écran `docs/ecran-{ID}.md` (spec comportementale, skill `spec-ecran-app`)

---

## Comment utiliser ce fichier

| Besoin | Où regarder |
|--------|-------------|
| Couleurs, typo, composants, espacements | Sections 1 à 5 |
| Règles de ton, microcopy, cohérence | Section 6 |
| Suivre l’avancement design par écran | Section 7 |
| États, flux, accessibilité transverses | Section 8 |
| Comportement détaillé d’un écran (navigation, cas limites) | `docs/ecran-{ID}.md` |

**Principe :** `DESIGN.md` = **quoi** doit ressembler l’app et **comment** rester cohérent. Les fiches `ecran-*.md` = **comportement** écran par écran.

**Statuts design (section 7) :** `Non démarré` · `Exploration` · `Maquette` · `Validé` · `Implémenté` · `N/A`

---

## 1. Identité visuelle & atmosphère

**À compléter** après atelier brand ou premières maquettes figées.

### Direction actuelle (issue du brief produit)

NOOK est une application de **découverte territoriale** : carte, lieux, guides audio, parcours. L’expérience doit être **fluide, rassurante et lisible en mobilité** (marche, soleil, réseau variable, interruptions, reprise de lecture).

| Dimension | Intention | Notes |
|-----------|-----------|-------|
| Densité | **Aérée sur la carte** ; contenu éditorial un peu plus dense en fil / listes | La carte reste le plan principal |
| Ton émotionnel | **Exploratoire, clair, moderne** — ni institutionnel rigide ni visuel « startup criard » | — |
| Hiérarchie | **Le lieu et l’action primaire** avant le compte et les réglages | Une intention primaire par vue |
| Mouvement | Transitions **courtes et utiles** ; respect de la réduction des animations système | `motion` dans `theme.ts` |
| Mode | **Clair par défaut** ; mode sombre _à trancher_ | Impact carte et marqueurs |

### Résumé en une phrase (pour briefs internes)

> Application mobile de découverte, carte au premier plan, interfaces légères en surimpression, actions primaires bleu brand, lisibilité forte en extérieur.

---

## 2. Couleurs — palette et rôles

Valeurs alignées sur **`constants/theme.ts` (provisoire)**. Chaque couleur a un **rôle** : ne pas réutiliser une couleur « au feeling » sans vérifier le tableau.

| Nom sémantique | Hex | Rôle |
|----------------|-----|------|
| Canvas | `#FFFFFF` | Fond principal |
| Surface surélevée | `#F7F7F8` | Feuilles, listes, zones secondaires |
| Surface enfoncée | `#F1F2F4` | Regroupements, alternance |
| Texte principal | `#0E1116` | Titres, corps, marqueur sélectionné |
| Texte secondaire | `#5B6470` | Sous-titres, métadonnées lieu |
| Texte atténué | `#8A929B` | Hints, labels tertiaires |
| Texte sur brand | `#FFFFFF` | Boutons primaires |
| Bordure | `#E5E7EB` | Séparateurs, contours légers |
| Bordure forte | `#CBD0D6` | Champs, focus (_à préciser_) |
| Diviseur | `#EEF0F2` | Séparations listes / menus |
| Brand / CTA | `#2E6BFF` | Action primaire, marqueur par défaut |
| Brand pressé | `#214FBF` | État pressed |
| Succès | `#1DA371` | Confirmations |
| Avertissement | `#B8731A` | Alertes non bloquantes |
| Erreur | `#C13B3B` | Erreurs, échecs |
| Scrim | `rgba(14, 17, 22, 0.45)` | Modales |
| Overlay carte hors ligne | `rgba(14, 17, 22, 0.18)` | Dégradation carte |
| Cluster carte | `#0E1116` / `#FFFFFF` | Regroupement marqueurs |

**À compléter :** mode sombre, couleurs par catégorie de lieu, états focus, validation **WCAG AA** (texte + CTA brand).

**Règle :** toute nouvelle couleur dans le code passe par `theme.ts` et est documentée ici avec son rôle.

---

## 3. Typographie

**À compléter** — famille(s) de polices non figées.

### Échelle (`theme.ts`)

| Token | px | Usage |
|-------|-----|--------|
| `xs` | 12 | Badges, meta compacte |
| `sm` | 14 | Secondaire, boutons compacts |
| `md` | 16 | Corps |
| `lg` | 18 | Sous-titres de section |
| `xl` | 20 | Titres cartes / feuilles |
| `xxl` | 24 | Titres d’écran |
| `display` | 28 | Accroches fil (parcimonie) |

### Hiérarchie

| Niveau | Poids | Interligne | Contexte |
|--------|-------|------------|----------|
| Titre écran | 600–700 | 1.25 | En-têtes, modales |
| Titre de bloc | 600 | 1.4 | Sections fil, listes |
| Corps | 400–500 | 1.4 | Descriptions |
| Meta | 400 | 1.4 | Distance, durée audio |
| CTA | 600 | 1.4 | Boutons — **verbe d’action** |

---

## 4. Composants

Détails pixel-perfect à valider en maquette ; en attendant, ces règles guident dev et design.

### Boutons

| Variante | Règle |
|----------|--------|
| Primaire | Fond brand, texte blanc, coins `radius.md`–`lg` ; pressed `#214FBF` |
| Secondaire | Fond surface ou contour, texte principal |
| Lien | Texte brand, sans fond |
| Icône | Cible **≥ 44×44 pt** ; label accessibilité obligatoire |

### Cartes & surfaces

| Composant | Règle |
|-----------|--------|
| Carte lieu | Fond blanc/surface, radius 12–16 px, ombre `elevation.card` |
| Bottom sheet | Radius supérieur 16–20 px, ombre `elevation.sheet` |
| Bannière statut | Pleine largeur ; couleurs warning/error selon cas |

### Champs

**À compléter.** Fond blanc, bordure `#E5E7EB`, erreur `#C13B3B` sous le champ.

### Carte

| Élément | Règle |
|---------|--------|
| Marqueur | `#2E6BFF` ; sélection `#0E1116` |
| Cluster | Pastille sombre, chiffre blanc |
| Contrôles flottants | Ombre `elevation.control`, `zIndex.mapControls` |

### Lecteur audio (mini-player)

**À compléter.** Persistant (`zIndex.miniPlayer`) : titre tronqué, progression, play/pause, lien fiche lieu. Ne pas cacher le CTA principal sans offset documenté.

### Navigation (racine A1.1)

**À compléter.** Accès fil, recherche, compte depuis la carte — **pas de hub séparé**. Icônes avec libellés accessibles.

---

## 5. Mise en page & espacement

| Principe | Règle |
|----------|--------|
| Plateforme | Mobile-first (Expo) ; admin (partie B) _à trancher_ |
| Marges | Horizontales 16–20 px (`spacing.lg`–`xl`) |
| Safe areas | Feuilles et mini-player au-dessus des zones système |
| Z-index | `theme.zIndex` : map → contrôles → chrome → mini-player → bannières → sheets → modales → toasts |
| Carte / liste | Même jeu de résultats et tri documenté (brief §3.2) |
| Gestes | Retour swipe sur feuilles ; actions critiques accessibles au pouce |

**À compléter :** tablette, paysage, split recherche.

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

---

## Open questions

- [ ] Famille typographique officielle  
- [ ] Mode sombre  
- [ ] Bottom nav vs barre supérieure sur A1.1  
- [ ] Couleurs catégories sur la carte  
- [ ] Validation WCAG brand / erreur  

---

*Maintenir ce fichier à chaque décision visuelle figée. Implémenter les tokens dans `constants/theme.ts` pour garder code et doc alignés.*
