# A1.2 — Autorisations (feuille depuis la carte)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A1.2 |
| Priorité | P0 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.1, §3.6 ; écrans liés : **A1.1** (déclencheur), **A1.3** (refus / dégradé), **A6.7** (paramètres), **A8.1** (confidentialité) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Design](./DESIGN.md) |

## Résumé

**Utilisateur :** comprendre pourquoi NOOK demande la position (et, le cas échéant, d’autres droits) et les accorder au moment où il en a besoin sur la carte.

**Produit :** ne pas bloquer l’ouverture de l’app par un onboarding permissions ; signaler l’absence de droits sur un **contrôle carte** et proposer une **feuille modale par le bas** (pre-permission) avant chaque **dialogue système**.

## Principes de conception (produit fini)

| Principe | Règle |
|----------|--------|
| Pas de popup au cold start | Aucune demande système à la première frame de **A1.1**. |
| Déclenchement contextuel | La feuille **A1.2** s’ouvre depuis le **contrôle géoloc** de la carte (référence concurrent : icône avec indicateur « manquant »). |
| Une intention par carte | Chaque **« Activer maintenant »** lance **au plus une** popup système à la fois. |
| Minimalisme des droits | Ne lister que les permissions **réellement utilisées** par le produit (pas de copier-coller « Always » + « Mouvement » sans cas d’usage NOOK). |
| Refus acceptable | La carte reste utilisable ; l’état refus est géré sur **A1.1** / **A1.3**, pas par une seconde feuille bloquante. |

## Utilisateur et contexte

- **Persona / situation :** visiteur en déplacement sur un territoire ; ouvre la carte pour se situer ou découvrir des lieux à proximité.
- **Contraintes :** debout, soleil, une main ; méfiance envers les demandes « toutes permissions » ; possible refus initial puis changement d’avis dans Paramètres.

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A1.1** — tap sur le contrôle géoloc en état « autorisation manquante ou incomplète » ; optionnellement depuis un bandeau **A1.3** (« Autoriser la localisation ») qui rouvre la même feuille. |
| **Sorties** | Retour **A1.1** (feuille fermée) ; ouverture **Paramètres** OS (lien secondaire si refus persistant) ; **Politique de confidentialité** (**A8.1** ou webview). |
| **Retour arrière** | Swipe vers le bas ou tap sur la zone dimmed / poignée de feuille → ferme la feuille sans modifier les droits. Geste OS back (Android) = même comportement que fermeture. |

**Hors périmètre de cette fiche :** écran plein page d’onboarding permissions au premier lancement ; file d’attente de 3 popups système consécutives sans action utilisateur par carte.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. Titre / message d’intention (« pourquoi nous avons besoin de ces autorisations »).
2. Cartes de permissions **non satisfaites** (icône, titre, bénéfice, CTA).
3. Lien **Politique de confidentialité** + rappel « modifiable dans les paramètres ».
4. Poignée de fermeture / dismiss de la feuille (secondaire mais toujours visible).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Contrôle géoloc (A1.1)** | Entrée vers A1.2 | Icône « ma position » ; badge **indicateur manquant** (ex. point d’interrogation sur fond d’alerte) si au moins une permission listée dans la feuille est absente | Position : coin carte, `zIndex.mapControls` ; 44×44 pt min ; n’affiche pas la feuille si tout est déjà accordé (comportement = centrage / suivi position). |
| **Scrim** | Focus | Overlay semi-transparent sur la carte | `colors.scrim` ; tap = fermer feuille (si politique produit validée). |
| **Feuille (bottom sheet)** | Conteneur A1.2 | Radius supérieur `radius.xl`–`lg`, ombre `elevation.sheet`, fond `colors.surface` | Hauteur : contenu + safe area bas ; scroll si > ~70 % écran. |
| **En-tête feuille** | Réassurance | Illustration légère optionnelle + titre | Ton rassurant, pas culpabilisant. |
| **Liste de cartes permission** | Pre-permission | Une carte par droit **requis ou optionnel activé produit** | Cartes **masquées** si permission déjà accordée au bon niveau. |
| **Carte permission** | Détail + action | Icône ronde, titre, description (1–2 lignes), bouton **Activer maintenant** | Bouton primaire par carte ; désactivé / libellé « Autorisé » si déjà OK. |
| **Pied de feuille** | Confiance | Texte paramètres + lien confidentialité | Lien souligné vers **A8.1**. |

### Permissions ciblées (périmètre NOOK)

| Permission | Niveau / API | Carte affichée quand | Justification brief |
|------------|--------------|----------------------|----------------------|
| **Localisation** | *When In Use* / équivalent Android | Position non disponible pour la carte | §3.1 — position utilisateur, proximité |
| **Localisation — Toujours** | *Always* | **Uniquement si** fonction « guidage parcours en arrière-plan » livrée | §3.5 — _sinon carte masquée_ |
| **Mouvement et forme** | Activité / motion | **Uniquement si** détection déplacement pour économie batterie en guidage actif | §2 — mobilité ; _sinon carte masquée_ |
| **Notifications** | Push | **Uniquement si** cas produit documenté (rappel parcours, etc.) | §3.6 — _sinon hors feuille carte ; demande depuis **A6.7**_ |

> **Décision produit par défaut (v1 feuille) :** une carte **Localisation (en utilisation)** obligatoire à l’affichage ; les autres cartes sont **conditionnelles** (feature flag ou version produit) pour éviter l’effet « mur de permissions » de la concurrence si NOOK n’en a pas besoin.

## Interactions et règles

### Contrôle géoloc sur A1.1

| État contrôle | Condition | Action au tap |
|---------------|-----------|---------------|
| **Normal** | Localisation *When In Use* (ou équivalent) accordée | Centre la carte sur l’utilisateur ; pas d’ouverture A1.2 |
| **Attention** | Permission absente, refusée, ou réglage insuffisant pour l’usage prévu | Ouvre la feuille **A1.2** |
| **Chargement** | Vérification du statut en cours | Indicateur discret ; pas de double tap |

### Feuille A1.2

| Geste / action | Comportement |
|----------------|--------------|
| Swipe down / poignée | Ferme la feuille |
| Tap scrim | Ferme la feuille (si validé produit) |
| **Activer maintenant** (carte N) | 1) Ferme rien ; 2) Déclenche la demande système pour la permission N ; 3) Au retour app, rafraîchit le statut de la carte N et du contrôle géoloc |
| Permission déjà accordée | Carte N masquée ou CTA remplacé par « Autorisé » (non cliquable) |
| Toutes permissions requises accordées | Feuille peut se fermer automatiquement **ou** afficher message de succès bref puis fermeture — _à trancher implémentation_ |
| Lien **Paramètres** (texte pied) | Ouvre les réglages OS de l’app (deep link) — utile si refus « ne plus demander » |
| **Politique de confidentialité** | Ouvre **A8.1** |

### Règles techniques (implémentation ultérieure)

- Textes des popups système : `NSLocationWhenInUseUsageDescription` (iOS), permissions Android, via config Expo — **cohérents** avec la carte pre-permission.
- Ne pas enchaîner automatiquement plusieurs `request*` sans tap utilisateur sur chaque carte.
- Après refus : ne pas re-boucler la popup système à chaque retour carte ; conserver l’état **Attention** sur le contrôle.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Feuille fermée — OK** | Permission suffisante | Contrôle géoloc normal sur **A1.1** | Centrage carte |
| **Feuille fermée — manquant** | Permission absente / refusée | Contrôle avec indicateur manquant | Tap → ouvre feuille |
| **Feuille ouverte** | Tap contrôle ou bandeau A1.3 | Sheet + scrim ; cartes non satisfaites listées | Activer / fermer |
| **Carte permission — en attente** | Avant toute demande | Description + **Activer maintenant** | Lance popup système |
| **Carte permission — accordée** | Statut OS accordé | Carte masquée ou badge « Autorisé » | — |
| **Carte permission — refusée** | Utilisateur refuse popup | Carte reste avec **Activer maintenant** ; pied rappelle Paramètres | Réessayer ou Paramètres |
| **Carte permission — refus définitif** | « Ne plus demander » | Carte + message « Activez dans les paramètres de l’appareil » | Lien Paramètres |
| **Erreur technique** | Service localisation indisponible | Message sur carte ou bandeau **A1.3** | Réessayer |

## Contenus et microcopy

### Contrôle carte (accessibilité)

- **Libellé (état attention) :** « Autoriser la localisation — requis pour vous situer sur la carte »
- **Libellé (état normal) :** « Afficher ma position sur la carte »

### Feuille — en-tête (proposition FR)

- **Titre :** « Autorisez la localisation pour explorer autour de vous »
- **Sous-titre (optionnel) :** « NOOK utilise votre position pour afficher les lieux à proximité et vous guider sur la carte. »

### Carte — Localisation (en utilisation)

- **Titre :** « Localisation »
- **Description :** « Indiquez où vous vous trouvez pour voir les lieux autour de vous et centrer la carte. »
- **CTA :** « Activer maintenant »

### Carte — Localisation toujours (si activée produit)

- **Titre :** « Localisation — Toujours »
- **Description :** « Permet le guidage de parcours même lorsque l’application est en arrière-plan. »
- **CTA :** « Activer maintenant »

### Carte — Mouvement (si activée produit)

- **Titre :** « Mouvement et forme physique »
- **Description :** « Permet d’adapter le guidage quand vous êtes à l’arrêt et de limiter la consommation de batterie. »
- **CTA :** « Activer maintenant »

### Carte — Notifications (si présente)

- **Titre :** « Notifications »
- **Description :** _À rédiger selon le cas produit (ex. rappels de parcours)._  
- **CTA :** « Activer maintenant »

### Pied de feuille

- **Texte :** « Vous pouvez modifier ces autorisations à tout moment dans les paramètres de l’appareil. Nous prenons votre vie privée au sérieux — consultez notre **Politique de confidentialité**. »

### Ton

Clair, rassurant, bénéfice utilisateur avant vocabulaire technique (« permission », « SDK »).

## Accessibilité

| Point | Cible |
|-------|--------|
| Contrôle géoloc | ≥ 44×44 pt ; état annoncé (autorisé / action requise) |
| Feuille | Rôle dialog / bottom sheet ; focus piégé optionnel ; titre annoncé à l’ouverture |
| Cartes | Titre de carte = en-tête accessible ; bouton avec libellé complet (pas « Activer » seul) |
| Contraste | Texte et CTA conformes objectif **WCAG AA** (`DESIGN.md`) |
| Mouvement | Fermeture feuille sans animation obligatoire si « réduire les animations » OS |
| Icône seule indicateur manquant | Texte alternatif : « Autorisation de localisation manquante » |

## Présentation (renvoi design)

- Tokens : `constants/theme.ts` — `colors.surface`, `elevation.sheet`, `radius.xl`, `spacing.lg`, `zIndex` ≥ feuille carte POI (**A1.4**).
- Référence visuelle : feuille concurrente (illustration en-tête, cartes empilées, CTA sombre par carte) — **adapter** à la charte NOOK (pas de copie couleur/forme concurrente).
- Le contrôle géoloc et la feuille **ne remplacent pas** le chrome existant (recherche, catégories, tab bar).

## Indicateurs et analytics (si applicable)

| Événement | Quand |
|-----------|--------|
| `permission_sheet_opened` | Feuille ouverte (source : `map_control` \| `banner_a13`) |
| `permission_sheet_dismissed` | Fermeture sans accord |
| `permission_request_started` | Tap **Activer maintenant** (type : `location_when_in_use` \| …) |
| `permission_request_result` | Résultat OS : `granted` \| `denied` \| `blocked` |

Sans données personnelles dans les payloads analytics.

## Critères d’acceptation

1. **Étant donné** l’utilisateur sur **A1.1** sans localisation accordée, **quand** il observe le contrôle géoloc, **alors** un indicateur « autorisation manquante » est visible et le contrôle est activable (≥ 44×44 pt).

2. **Étant donné** la localisation déjà accordée (*When In Use*), **quand** l’utilisateur tape le contrôle géoloc, **alors** la feuille **A1.2** ne s’ouvre pas et la carte exécute l’action « ma position » (comportement **A1.1**).

3. **Étant donné** une permission requise non accordée, **quand** l’utilisateur tape le contrôle en état attention, **alors** une feuille monte depuis le bas avec au moins la carte **Localisation** et le copy de bénéfice associé.

4. **Étant donné** la feuille ouverte, **quand** l’utilisateur tape **Activer maintenant** sur une carte, **alors** une seule popup système correspondante s’affiche (pas de chaîne automatique sur les autres cartes).

5. **Étant donné** l’utilisateur a accordé la permission depuis la popup, **quand** il revient à la feuille, **alors** la carte correspondante disparaît ou passe en état « Autorisé » et le contrôle géoloc repasse en état normal.

6. **Étant donné** l’utilisateur a refusé la permission, **quand** il ferme la feuille, **alors** **A1.1** reste utilisable (marqueurs, aperçu **A1.4**) et le contrôle reste en état attention.

7. **Étant donné** un refus persistant (« ne plus demander »), **quand** la feuille est ouverte, **alors** le pied de feuille rappelle les paramètres système et un lien ouvre les réglages de l’app.

8. **Étant donné** la feuille ouverte, **quand** l’utilisateur swipe vers le bas ou tape le scrim (si activé), **alors** la feuille se ferme sans demande système supplémentaire.

9. **Étant donné** toute ouverture de la feuille, **alors** un lien **Politique de confidentialité** est visible et mène à **A8.1**.

10. **Étant donné** le lancement de l’application (cold start), **alors** aucune popup système de permission n’apparaît avant une action utilisateur sur le contrôle ou une carte de la feuille.

## Open questions

| # | Question | Impact |
|---|----------|--------|
| 1 | **Guidage parcours en arrière-plan** : livrons-nous *Always* + *Mouvement* au même train que la géoloc carte ? | Affichage des cartes 2 et 3 |
| 2 | **Notifications** dans cette feuille ou uniquement depuis **A6.7** ? | Périmètre cartes |
| 3 | Fermeture **automatique** de la feuille quand tout est accordé ? | Micro-interaction |
| 4 | Tap sur **scrim** ferme-t-il la feuille (comme la concurrence) ? | Gestes |
| 5 | Illustration en-tête : asset brand ou pas d’illustration (plus sobre) ? | Design |
| 6 | Position exacte du contrôle géoloc sur **A1.1** (bas droite carte, au-dessus tab bar + marge POI) | Maquette |

---

*Spec A1.2 — créée pour implémentation ultérieure. Statut suggéré dans `DESIGN.md` : **Spec rédigée** (écran / feuille à implémenter).*
