# A5.5 — Mode guidage pas-à-pas

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A5.5 |
| Priorité | P1 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.5 ; écrans liés : **A5.6**, **A5.1**, **A5.4**, **A3.1**, **A3.2**, **A1.1**, **A8.3**, **A1.2** (permissions arrière-plan — P2) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Itinéraire éditorial A5.6](./ecran-A5.6-detail-itineraire-editorial.md) · [Brief](./brief.md) · [Design](./DESIGN.md) |

## Résumé

**Utilisateur :** suivre un parcours sur place, étape par étape, en sachant où il est dans le déroulé et en accédant rapidement au guide audio du lieu courant.

**Produit :** expérience de guidage active distincte de la fiche itinéraire (**A5.6**) et de la fiche lieu (**A3.1**) ; un seul composant d’écran partagé entre parcours utilisateur et itinéraires éditoriaux, différencié par `sourceType`.

## Utilisateur et contexte

- **Persona / situation :** visiteur en déplacement qui a tapé « Démarrer le parcours » sur **A5.6** ou « Suivre » sur un parcours personnel (**A5.1**) ; alterne marche, écoute audio et consultation ponctuelle d’une fiche.
- **Contraintes :** une main, soleil, réseau variable, interruptions (appels, photos) ; reprise de l’étape courante et de la lecture audio (**A3.2**) ; batterie si géoloc active (hors MVP).

## Distinction des vues parcours

| Vue | ID | Rôle | Moment d’usage |
|-----|-----|------|----------------|
| Fiche itinéraire éditorial | **A5.6** | Préparation — aperçu complet, teaser premium | Avant de partir |
| **Mode guidage** | **A5.5** | Exécution — une étape à la fois, navigation séquentielle | Sur le terrain |
| Parcours sur carte | **A5.4** | Spatial — tracé complet, toutes les étapes | Besoin de vue d’ensemble |
| Fiche lieu | **A3.1** | Contenu — description, tous les guides | Pause enrichie sur un POI |

| Aspect | Parcours utilisateur (`sourceType: user`) | Itinéraire éditorial (`sourceType: editorial`) |
|--------|-------------------------------------------|------------------------------------------------|
| Source données | `GET /api/v1/itineraries/:id` (auth) | Mock / futur API éditoriale (cf. **A5.6**) |
| Arrivée typique | **A5.1** — « Suivre le parcours » | **A5.6** — « Démarrer le parcours » |
| Premium | N/A | Guidage bloqué si itinéraire verrouillé ; pas de guidage partiel freemium |
| Persistance progression | Local + sync API (évolution) | Local par `itineraryId` |

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A5.6** — CTA « Démarrer le parcours » (débloqué) ; **A5.1** — CTA « Suivre le parcours » ; lien profond guidage (voir ci-dessous). |
| **Sorties** | **A3.2** — lecture audio étape courante (mini-player persistant) ; **A3.1** — « Voir la fiche » ; **A1.1** / **A5.4** — « Voir sur la carte » ; **A8.3** — si étape premium verrouillée (cas edge reprise session) ; fin de parcours → retour **A5.6** ou **A5.1**. |
| **Retour arrière** | Bouton « Quitter le guidage » (header) → confirmation si progression > étape 1 ; geste OS back = même comportement. Retour depuis **A3.1** / carte → **A5.5** à la même étape. |

**Routes (Expo Router)**

| `sourceType` | Route | Exemple |
|--------------|-------|---------|
| `editorial` | `/city/[slug]/itinerary/[id]/guide` | `/city/paris/itinerary/itin-paris-highlights/guide` |
| `user` | `/itinerary/[id]/guide` | `/itinerary/uuid-balade/guide` |

**Paramètres optionnels :** `step` (index 0-based) pour lien profond ou reprise ; ignoré si hors bornes → clamp ou étape 0.

**Garde d’entrée :** si itinéraire éditorial premium verrouillé → redirect **A5.6** + CTA paywall (pas d’entrée directe en guidage).

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Progression** — « Étape {n} sur {total} » + indicateur (barre ou pastilles).
2. **Étape courante** — image, nom du lieu, indication vers la suivante (distance / durée si dispo).
3. **CTA principal** — « Écouter le guide » (étape courante).
4. **Mini-carte** — position étape courante + tracé vers la suivante ; tap → carte plein écran.
5. **Navigation séquentielle** — précédent / suivant (zone basse, zone pouce).
6. **Actions secondaires** — « Voir la fiche », « Quitter le guidage ».

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Header** | Contexte + sortie | Titre parcours (tronqué), bouton quitter | Pas de partage en guidage actif (P1) |
| **Barre de progression** | Orientation | `currentStepIndex + 1`, `stepCount` | Annoncé accessibilité : « Étape 2 sur 5 » |
| **Carte étape courante** | Ancrage visuel | `coverImageUrl` ou image POI, `name`, `address?` | Hauteur ~200 px ; badge numéro d’étape |
| **Indication prochaine étape** | Anticipation | « Ensuite : {nextName} » + `distanceToNextMeters?` / `walkMinutesToNext?` | Masquée sur dernière étape |
| **CTA sticky « Écouter »** | Action primaire | Première piste audio du POI ou piste liée à l’itinéraire | Masqué si pas d’audio ; ouvre **A3.2** |
| **Mini-carte** | Spatial | Marqueur étape courante, segment vers suivante | Tap → **A1.1** mode **A5.4** ; hauteur ~120–160 px |
| **Barre navigation bas** | Séquentiel | « Étape précédente », « Étape suivante » / « Terminer » | Boutons ≥ 44 pt ; précédent disabled sur étape 1 |
| **Lien secondaire** | Contenu | « Voir la fiche du lieu » | Texte bouton, pas icône seule |
| **Mini-player** | Audio persistant | Composant global **A3.2** | `zIndex.miniPlayer` ; ne masque pas la barre nav sans offset |

### Données étape (vue guidage)

| Champ | Type | Notes |
|-------|------|-------|
| `order` | number | 1…n affiché |
| `poiId` | string | Lien **A3.1** |
| `name` | string | Titre lieu |
| `thumbnailUrl?` | string | Fallback image héros itinéraire |
| `address?` | string | Sous le titre |
| `audioGuideId?` | string | Piste par défaut pour CTA écouter |
| `audioDurationSeconds?` | number | Sous le CTA ou dans la ligne |
| `distanceToNextMeters?` | number | Calcul côté client si coords dispo |
| `isLocked?` | boolean | Éditorial premium — ne doit pas apparaître en guidage débloqué |

## Interactions et règles

### Démarrage et reprise

- **Premier démarrage :** ouverture **A5.5** à l’étape 1 (`stepIndex = 0`).
- **Reprise :** si progression locale existante pour ce parcours, feuille de choix avant entrée :
  - « Reprendre à l’étape {n} — {name} » (primaire)
  - « Recommencer depuis le début » (secondaire)
- **Recommencer :** remet `stepIndex = 0` et efface la progression locale (confirmation si étape > 1).

### Navigation entre étapes

- **Étape suivante :** incrémente l’index ; analytics `guidance_step_completed` sur l’étape quittée.
- **Étape précédente :** décrémente ; pas d’analytics « completed ».
- **Dernière étape :** CTA droit = « Terminer le parcours » → écran / feuille **fin de parcours** (inline, même route avec état `completed`).

### Audio

- Tap « Écouter le guide » : lance **A3.2** sur la piste de l’étape ; mini-player visible sur **A5.5**.
- Changement d’étape : audio en pause automatique (pas de changement de piste silencieux) ; utilisateur relance sur la nouvelle étape.
- Retour depuis **A3.1** : guidage à la même étape ; mini-player conserve état lecture.

### Carte

- Mini-carte : étape courante + segment vers la suivante (ou tracé complet atténué).
- Tap mini-carte ou lien « Voir sur la carte » : **A1.1** avec contexte parcours (**A5.4**) — étape courante mise en évidence, tracé complet visible.
- Retour carte → **A5.5** même étape.

### Quitter le guidage

- Tap « Quitter » : si `stepIndex === 0` et aucune audio active → retour direct écran précédent (**A5.6** ou **A5.1**).
- Sinon : alerte « Quitter le guidage ? Votre progression est enregistrée. » — Confirmer / Continuer.

### Géolocalisation (hors MVP P1)

| Fonction | Priorité | Règle |
|----------|----------|-------|
| Avancement auto par proximité | P2 | Passage à l’étape suivante quand distance < seuil (ex. 50 m) — avec confirmation ou notification |
| Guidage arrière-plan | P2 | Permission *Always* + motion (**A1.2**) |
| Affichage distance temps réel | P2 | « Vous êtes à {x} m » sur mini-carte |

**MVP P1 :** navigation **manuelle** uniquement ; mini-carte statique ou centrée sur coords POI sans suivi live.

### Règles premium (éditorial)

- Entrée guidage uniquement si itinéraire débloqué (aligné **A5.6**).
- Pas de guidage sur sous-set freemium (2 étapes visibles en fiche ≠ guidage partiel).

### Cohérence carte / liste (brief §3.2)

- Ordre des étapes en guidage = ordre **A5.6** / API `poiIds` = tracé **A5.4** sur **A1.1**.

## Fin de parcours (état inline)

Affiché quand l’utilisateur termine la dernière étape ou tape « Terminer » sur l’étape finale.

| Élément | Contenu |
|---------|---------|
| Illustration / icône | Succès sobre (check ou marqueur carte) |
| Titre | « Parcours terminé ! » |
| Sous-titre | « Vous avez complété {title} » |
| Stats optionnelles | « {n} étapes · {duration} » |
| CTA primaire | « Retour au parcours » → **A5.6** ou **A5.1** |
| CTA secondaire | « Retour à {ville} » → **A4.3** (éditorial) ou carte **A1.1** |

Progression locale : marquer `completedAt` ; prochain « Démarrer » propose « Recommencer » par défaut.

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Chargement** | Navigation | Skeleton progression + carte étape | — |
| **Choix reprise** | Progression locale trouvée | Feuille reprise / recommencer | Entrer guidage ou reset |
| **Guidage actif** | Données OK | UI étape courante | Écouter, nav, carte, fiche |
| **Sans audio (étape)** | POI sans guide | Carte étape sans CTA écouter ; message « Aucun guide audio pour cette étape » | Nav séquentielle disponible |
| **Terminé** | Dernière étape validée | Écran fin de parcours | Retour hub / liste |
| **Intrrouvable** | `id` invalide | Message + retour | Retour |
| **Erreur / hors ligne** | Fetch échoué | Bannière ; guidage possible si étapes en cache | Réessayer ; quitter |
| **Verrouillé** | Éditorial non débloqué | Redirect **A5.6** | Débloquer via **A8.3** |

## Contenus et microcopy

| Contexte | Texte |
|----------|-------|
| Titre accessibilité écran | « Guidage — {title} » |
| Progression | « Étape {n} sur {total} » |
| CTA écouter | « Écouter le guide » |
| Sans audio | « Aucun guide audio pour cette étape. » |
| Ensuite | « Ensuite : {name} » |
| Distance | « {distance} m » / « ~{minutes} min de marche » |
| Étape précédente | « Étape précédente » |
| Étape suivante | « Étape suivante » |
| Terminer | « Terminer le parcours » |
| Voir fiche | « Voir la fiche du lieu » |
| Voir carte | « Voir sur la carte » |
| Quitter (header) | « Quitter le guidage » |
| Confirmation quitter | « Quitter le guidage ? Votre progression est enregistrée. » |
| Bouton confirmer quitter | « Quitter » |
| Bouton continuer | « Continuer le guidage » |
| Reprise | « Reprendre à l’étape {n} » |
| Recommencer | « Recommencer depuis le début » |
| Parcours terminé | « Parcours terminé ! » |
| Sous-titre terminé | « Vous avez complété {title} » |
| Retour parcours | « Retour au parcours » |
| Intrrouvable | « Ce parcours n’existe pas ou n’est plus disponible. » |

## Accessibilité

- Progression annoncée à chaque changement d’étape (live region).
- CTA écouter : « Écouter le guide de {name}, {duration} ».
- Boutons nav : « Étape précédente, désactivée » sur étape 1.
- Mini-carte : label « Carte, étape {n}, {name} » ; action « Ouvrir la carte plein écran ».
- Réduction de mouvement : pas d’animation de transition agressive entre étapes.
- Cibles ≥ 44 pt ; barre nav dans zone pouce (safe area bas).

## Persistance locale (MVP)

| Clé | Valeur |
|-----|--------|
| `guidance:{sourceType}:{id}` | `{ stepIndex, updatedAt, completedAt? }` |

- Stockage : `AsyncStorage` (ou équivalent Expo).
- Pas de sync serveur P1 ; évolution : champ `lastStepIndex` sur ressource user itinerary.

## Indicateurs et analytics

| Événement | Paramètres |
|-----------|------------|
| `guidance_started` | `source_type`, `itinerary_id`, `city_slug?`, `resume` (bool) |
| `guidance_step_viewed` | `source_type`, `itinerary_id`, `step_index`, `poi_id` |
| `guidance_step_completed` | `source_type`, `itinerary_id`, `step_index`, `poi_id` |
| `guidance_audio_tapped` | `source_type`, `itinerary_id`, `poi_id`, `audio_guide_id` |
| `guidance_map_tapped` | `source_type`, `itinerary_id`, `step_index` |
| `guidance_place_detail_tapped` | `source_type`, `itinerary_id`, `poi_id` |
| `guidance_quit_tapped` | `source_type`, `itinerary_id`, `step_index`, `confirmed` |
| `guidance_completed` | `source_type`, `itinerary_id`, `step_count`, `duration_seconds?` |
| `guidance_resume_prompt_shown` | `source_type`, `itinerary_id`, `saved_step_index` |
| `guidance_resume_choice` | `source_type`, `itinerary_id`, `choice` (`resume` \| `restart`) |

## Critères d’acceptation

1. **Given** itinéraire éditorial débloqué sur **A5.6** **When** « Démarrer le parcours » **Then** navigation **A5.5** à l’étape 1 avec progression « Étape 1 sur {n} ».
2. **Given** guidage actif étape 2 **When** « Étape suivante » **Then** étape 3 affichée et analytics `guidance_step_completed` pour l’étape 2.
3. **Given** guidage étape 1 **When** « Étape précédente » **Then** bouton désactivé ou sans effet.
4. **Given** POI avec audio **When** « Écouter le guide » **Then** mini-player **A3.2** actif sur la piste de l’étape.
5. **Given** audio en lecture **When** changement d’étape **Then** lecture en pause ; nouvelle étape affichée.
6. **Given** guidage actif **When** « Voir la fiche du lieu » **Then** **A3.1** ; retour **Then** même étape sur **A5.5**.
7. **Given** guidage actif **When** tap mini-carte **Then** **A1.1** avec tracé parcours (**A5.4**) et étape courante visible.
8. **Given** dernière étape **When** « Terminer le parcours » **Then** écran fin + `guidance_completed` ; progression marquée terminée.
9. **Given** progression locale étape 3 **When** nouveau « Démarrer » **Then** feuille reprise avec choix reprendre / recommencer.
10. **Given** itinéraire premium verrouillé **When** lien profond guidage **Then** redirect **A5.6** sans affichage guidage.
11. **Given** guidage étape > 1 **When** « Quitter » puis confirmer **Then** retour écran précédent ; progression locale conservée.
12. **Given** POI sans audio **When** affichage étape **Then** pas de CTA « Écouter » ; message explicite ; navigation séquentielle OK.

## Décision d’architecture UI

**Un écran / route partagé** avec prop ou param `sourceType: 'editorial' | 'user'` — pas deux implémentations divergentes. Les différences (auth, premium, route parent) sont gérées au chargement des données, pas dans la mise en page.

Réponse à l’open question **A5.6** : composant unique `GuidanceScreen` + flag `sourceType` (cf. section ci-dessus).

## Open questions

- Seuil et UX d’avancement automatique par géoloc (P2) : notification vs auto-advance.
- Sync progression guidage sur API user itinerary : P1 ou post-MVP ?
- Partage « J’ai terminé ce parcours » depuis l’écran de fin : P1 ou P2 ?
- Afficher la liste complète des étapes en panneau repliable pendant le guidage (accès saut libre) ou navigation strictement séquentielle seule ?
- Piste audio « recommandée » par itinéraire vs toujours première piste du POI ?
