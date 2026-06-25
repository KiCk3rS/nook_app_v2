# A8.4 — Achat pack crédits (in-app)

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A8.4 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §5.2 ; écrans liés : **A3.3**, **A6.1**, **A6.4**, **A8.3** |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Création guide A3.3](./ecran-A3.3-creation-guide-audio-ia.md) · [Paywall premium A8.3](./ecran-A8.3-paywall-premium.md) |

## Résumé

**Utilisateur :** recharger son solde de crédits pour générer des guides audio IA lorsque le quota d’abonnement est épuisé ou s’il n’est pas abonné.

**Produit :** feuille modale déclenchée depuis **A3.3** (402 ou solde insuffisant) ou depuis **A6.4** (raccourci solde) ; achats via store natif ; complète **A8.3** (abonnement inclut des générations mensuelles, pas des crédits illimités).

## Utilisateur et contexte

- **Persona / situation :** utilisateur engagé sur un lieu, prêt à payer pour un guide sur mesure ; compare les packs avant achat.
- **Contraintes :** confiance (prix clairs, pas de dark patterns) ; restauration achats obligatoire iOS/Android.

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A3.3** — crédits insuffisants ou lien « Obtenir des crédits » ; **A6.4** — tap sur ligne solde crédits (optionnel P1). |
| **Sorties** | Succès achat → retour écran d’origine avec solde mis à jour ; **A8.3** — lien « Voir l’abonnement » ; fermeture → écran d’origine. |
| **Retour arrière** | Swipe down, fermer ; annule sans achat. |

**Contexte passé :** `sourceScreen`, `requiredCredits?` (depuis A3.3), `poiId?`.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Solde actuel** — crédits disponibles + rappel usage (1 / 2 / 3 crédits par guide).
2. **Packs** — cartes sélectionnables (ex. 5 / 15 / 30 crédits — montants à fixer éditorialement).
3. **CTA achat** — « Continuer — {price} ».
4. **Abonnement** — encart « Générations incluses chaque mois » → **A8.3**.
5. **Restaurer achats** + mentions légales.

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **En-tête** | Contexte | « Crédits » ; solde `{n}` | Si `requiredCredits` : « Il vous faut {n} crédit(s) pour ce guide » |
| **Rappel coûts** | Éducation | Court 1 · Normal 2 · Détaillé 3 | Une ligne, pas de tableau dense |
| **Cartes packs** | Offres | `productId`, crédits, `priceLabel`, prix unitaire indicatif | Une offre sélectionnée |
| **CTA principal** | Achat | Flux store natif | Non dismissible pendant achat |
| **Encart abonnement** | Upsell | Lien **A8.3** | « Des générations incluses chaque mois avec Premium » |
| **Restaurer achats** | Support | Lien texte | Obligatoire stores |

## Interactions et règles

- **Auth obligatoire** : anonyme → **A6.1** avant achat.
- **Succès** : sync solde via API ; callback vers **A3.3** si ouvert depuis ce flux ; analytics `credits_pack_purchase_success`.
- **Échec / annulation** : message discret ; solde inchangé.
- **Cohérence A8.3** : l’abonnement **ne remplace pas** les packs pour usage intensif ; il fournit un **quota mensuel** de générations (voir **A3.3**).

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Ouvert** | Tap recharge | Packs + solde | Sélection, achat, fermer |
| **Chargement offres** | Fetch store | Skeleton | — |
| **Offres indisponibles** | Erreur store | Message + réessayer | « Réessayer » |
| **Achat en cours** | CTA tap | Overlay loading | — |
| **Succès** | Store OK | Toast + fermeture | Retour origine |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre | « Crédits » |
| Solde | « Vous avez {n} crédit(s) » |
| Besoin (depuis A3.3) | « Ce guide nécessite {n} crédit(s). » |
| Rappel paliers | « Court · 1 crédit — Normal · 2 — Détaillé · 3 » |
| CTA | « Continuer — {price} » |
| Upsell abo | « Des générations incluses chaque mois avec Premium » |
| Succès | « {n} crédits ajoutés à votre compte. » |

## Accessibilité

- Chaque pack : label incluant nombre de crédits + prix.
- CTA avec prix annoncé ; focus logique top → bottom.

## Indicateurs et analytics

| Événement | Moment |
|-----------|--------|
| `credits_pack_sheet_open` | Ouverture | `source`, `required_credits?` |
| `credits_pack_selected` | Sélection pack | `product_id`, `credits_amount` |
| `credits_pack_purchase_success` | Achat OK | `product_id`, `credits_amount` |
| `credits_pack_purchase_cancel` | Annulation | — |

## Critères d’acceptation

1. **Étant donné** **A3.3** avec solde 0 et palier Normal sélectionné, **quand** l’utilisateur tape « Obtenir des crédits », **alors** **A8.4** s’ouvre avec le message « Ce guide nécessite 2 crédits ».
2. **Étant donné** un achat pack réussi, **quand** l’utilisateur revient à **A3.3**, **alors** le solde affiché est à jour et le CTA génération est actif si suffisant.
3. **Étant donné** **A8.4** ouvert, **quand** l’utilisateur tape l’encart abonnement, **alors** **A8.3** s’ouvre sans perdre le contexte lieu si applicable.

## Open questions

- **Grille packs** : nombre de crédits et prix par pack (5 / 15 / 30 ?).
- **API sync** : `GET /api/v1/me/credits` après webhook store — délai acceptable.
- **Affichage profil** : ligne solde crédits sur **A6.4** en P1 ou P2.

---

*Complète **A8.3** (itinéraires premium) ; ne pas fusionner les deux feuilles pour garder des intentions d’achat distinctes.*
