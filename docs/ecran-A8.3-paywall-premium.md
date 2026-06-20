# A8.3 — Paywall premium (déblocage contenu)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A8.3 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §5.2 ; écrans liés : **A4.3**, **A5.6**, **A6.1** (compte pour restauration) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Itinéraire éditorial A5.6](./ecran-A5.6-detail-itineraire-editorial.md) |

## Résumé

**Utilisateur :** débloquer un itinéraire premium ou accéder à l’offre d’abonnement NOOK pour profiter du contenu payant.

**Produit :** feuille modale de monétisation déclenchée depuis le hub ville ou le détail itinéraire ; respecte la transparence et l’absence de dark patterns (brief §5.2).

## Utilisateur et contexte

- **Persona / situation :** visiteur intéressé par un parcours premium verrouillé ; compare les options avant achat.
- **Contraintes :** confiance requise (prix clairs, annulation facile) ; stores iOS/Android pour paiement in-app.

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A4.3** — tap carte premium verrouillée ; **A5.6** — CTA « Débloquer » ou tap étape verrouillée ; **A5.7** — tap ligne verrouillée. |
| **Sorties** | Succès achat → retour écran d’origine avec contenu débloqué ; **A6.1** — si connexion requise avant achat ; fermeture → écran d’origine inchangé. |
| **Retour arrière** | Swipe down, bouton fermer, tap scrim ; annule sans déblocage. |

**Contexte passé à la feuille :** `sourceScreen`, `cityId?`, `itineraryId`, `itineraryTitle`, `priceLabel?`.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Contexte** — titre itinéraire ou « Contenu premium » + vignette.
2. **Offres** — achat à l’unité et/ou abonnement.
3. **CTA achat** — un CTA principal par offre sélectionnée.
4. **Liens secondaires** — restaurer achats, conditions, confidentialité.

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Poignée / fermer** | Sortie | — | 44×44 pt |
| **En-tête contexte** | Rappel valeur | `itineraryTitle`, image, bénéfices (liste à puces) | Ex. « 8 étapes · 2 h · guides audio inclus » |
| **Carte offre unitaire** | Achat à l’unité | `productId`, `priceLabel`, « Accès permanent à ce parcours » | Sélectionnable |
| **Carte offre abonnement** | Abonnement | `subscriptionId`, `priceLabel`, période, « Tous les parcours premium » | Badge « Meilleure valeur » optionnel |
| **CTA principal** | Achat | « Continuer — {price} » | Déclenche flux store natif |
| **Restaurer achats** | Support | Lien texte | iOS/Android obligatoire |
| **Mentions légales** | Confiance | Liens **A8.2**, **A8.1** ; texte renouvellement abonnement | Visible sans scroll excessif |

## Interactions et règles

- **Sélection offre :** une offre active à la fois ; CTA reflète le prix de l’offre sélectionnée.
- **Achat :** délégation au SDK store (RevenueCat, expo-in-app-purchases, etc. — choix implémentation hors spec) ; pas de saisie CB native dans l’app.
- **Succès :** fermeture feuille + callback déblocage (`accessState` → `purchased` ou `included_in_subscription`) ; analytics `premium_purchase_success`.
- **Échec / annulation :** message discret ; écran d’origine reste verrouillé.
- **Restaurer :** appelle API store ; sync statut compte NOOK si auth requise.
- **Connexion :** si achat lié au compte, proposer **A6.1** avant ou après achat (à trancher — open question).
- **Pas de dark patterns :** fermeture visible ; pas de fausse urgence ; prix TTC affiché ; abonnement avec mention durée et renouvellement auto.

### États d’accès post-achat

| État | Description |
|------|-------------|
| `locked` | Aucun droit |
| `purchased` | Achat unitaire de l’itinéraire |
| `included_in_subscription` | Abonnement actif couvrant le contenu |

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Ouvert** | Tap contenu verrouillé | Feuille avec offres | Sélection, achat, fermer |
| **Chargement offres** | Fetch produits store | Skeleton ou spinner | — |
| **Offres indisponibles** | Store erreur | Message + réessayer + fermer | « Réessayer » |
| **Achat en cours** | CTA tap | Overlay loading non dismissible | — |
| **Succès** | Store confirme | Fermeture auto + toast « Contenu débloqué » | Retour écran origine |
| **Annulé** | User cancel store | Feuille reste ouverte | Choisir autre offre ou fermer |
| **Erreur** | Store / réseau | Message explicite | Réessayer |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre feuille | « Débloquer ce parcours » |
| Titre abonnement | « Accès premium NOOK » |
| Bénéfice 1 | « Guides audio à chaque étape » |
| Bénéfice 2 | « Parcours curatés par nos experts » |
| Bénéfice 3 (abo) | « Tous les parcours premium inclus » |
| CTA unitaire | « Acheter — {price} » |
| CTA abonnement | « S’abonner — {price}/mois » |
| Restaurer | « Restaurer mes achats » |
| Succès | « Parcours débloqué » |
| Erreur store | « L’achat n’a pas abouti. Réessayez ou contactez le support. » |
| Mention abonnement | « Abonnement renouvelé automatiquement. Résiliable à tout moment dans les réglages {Store}. » |
| Fermer | « Fermer » |

## Accessibilité

- `accessibilityViewIsModal` sur la feuille.
- Focus : fermer → offres → CTA → liens légaux.
- Labels offres : « Acheter le parcours {title}, {price} » / « S’abonner, {price} par mois ».

## Indicateurs et analytics

| Événement | Paramètres |
|-----------|------------|
| `premium_paywall_viewed` | `itinerary_id`, `source_screen`, `offers_available[]` |
| `premium_offer_selected` | `offer_type` (unit, subscription), `product_id` |
| `premium_purchase_started` | `offer_type`, `product_id` |
| `premium_purchase_success` | `offer_type`, `product_id`, `itinerary_id` |
| `premium_purchase_failed` | `offer_type`, `error_code` |
| `premium_restore_tapped` | — |
| `premium_paywall_dismissed` | `itinerary_id`, `had_purchase_attempt` |

## Critères d’acceptation

1. **Given** itinéraire verrouillé sur **A5.6** **When** tap « Débloquer » **Then** feuille **A8.3** avec contexte itinéraire et offres.
2. **Given** paywall ouvert **When** achat unitaire réussi **Then** feuille fermée et itinéraire accessible sur **A5.6**.
3. **Given** paywall ouvert **When** fermeture sans achat **Then** contenu reste verrouillé.
4. **Given** paywall **When** tap « Restaurer mes achats » avec achat antérieur **Then** déblocage sans nouveau paiement.
5. **Given** paywall **Then** liens conditions et confidentialité accessibles (**A8.2**, **A8.1**).
6. **Given** paywall **Then** bouton fermer toujours visible (pas de modal piège).

## Open questions

- Modèle prioritaire au lancement : abonnement seul, unitaire seul, ou les deux avec mise en avant abonnement.
- Compte NOOK obligatoire avant ou après achat store.
- Essai gratuit abonnement : oui/non et durée.
- SDK IAP retenu (RevenueCat, native, etc.).
