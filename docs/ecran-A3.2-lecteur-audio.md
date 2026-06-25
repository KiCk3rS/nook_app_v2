# A3.2 — Lecteur audio intégré

## Méta

| Champ | Valeur |
|-------|--------|
| ID produit | A3.2 |
| Priorité | P0 |
| Plateforme | Mobile iOS et Android (Expo) |
| Dépendances | Brief §3.3, §5.4 ; écrans liés : **A3.1**, **A5.5**, **A6.1**, **A8.4** ; feature **F-016** (chat guide IA) |
| Document lié | [Inventaire écrans](./ecrans.md) · [Brief](./brief.md) · [Fiche lieu A3.1](./ecran-A3.1-fiche-lieu.md) · [API client](./api-client-reference.md) · [Design](./DESIGN.md) |

## Résumé

**Utilisateur :** écouter un guide audio sur un lieu, ajuster la lecture (vitesse, minuteur…) et **poser des questions au guide IA Nook** pour obtenir des précisions pendant l’écoute.

**Produit :** lecteur plein écran + mini-player persistant ; onglets secondaires dont **Discussion** (chat contextuel au POI et au guide en cours) ; reprise de position ; branchement API **F-016** avec fallback mock hors API.

## Utilisateur et contexte

- **Persona / situation :** visiteur en déplacement ou en préparation, guide audio lancé depuis **A3.1** ou le mode guidage **A5.5** ; souhaite approfondir un passage sans quitter la lecture.
- **Contraintes :** debout, une main, réseau variable ; le chat ne doit pas interrompre la piste audio ; clavier mobile (évitement clavier sur le composer).

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A3.1** — play sur une piste ou CTA « Écouter le guide » ; **A5.5** — CTA « Écouter » ; mini-player global (expansion). |
| **Sorties** | Minimiser → mini-player ; fermer (dismiss) → arrêt session audio ; **A6.1** — connexion requise pour Discussion si anonyme ; **A8.4** — crédits insuffisants chat (402, P1). |
| **Retour arrière** | Bouton chevron bas (minimize) ; bouton OS back = minimize ; pas de perte de position audio. |

**Contexte conservé :** `poiId`, `poiName`, `guideId`, `guideTitle`, position de lecture.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Contrôles lecture** (timeline, play/pause, ±15 s / +30 s) — vue **Contenu** (défaut).
2. **Hero** — artwork, titre guide, nom lieu (fixe en haut).
3. **Barre d’onglets** — Contenu · Options · Discussion · Thématiques.
4. **Panneau contextuel** — remplace la zone contrôles selon l’onglet actif.

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Hero** | Contexte | `imageUrl`, `guide.title`, `place.name` | Toujours visible |
| **Timeline + contrôles** | Lecture | `positionMs`, `durationMs` | Onglet Contenu (actif par défaut) |
| **Panneau Options** | Réglages audio | Vitesse, voice boost, silences, minuteur | Toggle onglet Options |
| **Panneau Discussion** | Chat guide IA | Messages, composer | Toggle onglet Discussion — cf. § Discussion |
| **Mini-player** | Reprise globale | Titre, play/pause, progress | `GlobalAudioChrome` ; au-dessus tab bar si `(tabs)` |
| **Barre onglets** | Navigation secondaire | 4 onglets | Contenu actif si aucun panneau ouvert |

### Panneau Discussion (F-016)

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **État vide** | Invitation | Icône bulle + « Posez une question sur cet audioguide » | Centré ; pas de fausse conversation |
| **Fil messages** | Historique | `role: user \| assistant`, `content`, horodatage | Scroll ; bulles utilisateur à droite, Nook à gauche |
| **Indicateur envoi** | Feedback | Typing / envoi en cours | Pendant POST |
| **Composer** | Saisie | Champ + bouton envoi | Placeholder « Posez votre question… » ; max 4000 car. |
| **Bandeau erreur** | Récupération | Message + Réessayer | Réseau, 429, 422 |
| **État non connecté** | Gate auth | Message + CTA connexion | → **A6.1** avec `returnTo` |

## Interactions et règles

### Lecture audio

- Play/pause, seek sur timeline, skip −15 s / +30 s.
- Minimize : audio continue ; expand depuis mini-player.
- Options (vitesse, etc.) : locales à la session ; pas d’appel API.

### Onglets

- **Contenu** : affiche timeline + contrôles ; désactive les panneaux Options / Discussion.
- **Options** / **Discussion** : exclusifs l’un de l’autre ; second tap sur le même onglet = retour Contenu.
- **Thématiques** : hors périmètre MVP (P2) — pas d’action en v1.

### Discussion — règles métier

- **Auth obligatoire** : anonyme → CTA connexion, pas d’appel API.
- **Contexte** : messages liés au **POI** (`poiId`) ; le guide en cours (`guideTitle`) sert au contexte UI et au mock ; l’API F-016 est POI-scoped.
- **Envoi** : tap envoi ou submit clavier ; trim du texte ; refus si vide ou envoi en cours.
- **Historique** : chargé à l’ouverture du panneau (GET messages).
- **Crédits** : consommation côté serveur (402 `GUIDE_CHAT_INSUFFICIENT_CREDITS`) ; message utilisateur + lien recharge **A8.4** (P1).
- **Throttle** : 429 → message + réessayer plus tard.
- **Sources absentes** : 422 `GUIDE_CHAT_NO_SOURCES` → message explicite.
- **Audio** : la piste continue pendant le chat ; pas de pause automatique.

### API (F-016)

| Méthode | Chemin | Usage |
|--------|--------|--------|
| GET | `/api/v1/me/pois/:poiId/guide-chat/messages` | Historique + solde crédits |
| POST | `/api/v1/me/pois/:poiId/guide-chat/messages` | `{ "content": "…" }` max 4000 car. |

Hors API configurée ou session mock : réponses simulées localement (`lib/mockGuideChat.ts`).

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Mini-player** | Minimize | Barre compacte | Expand, play/pause, dismiss |
| **Expanded — Contenu** | Expand / onglet Contenu | Hero + timeline + contrôles | Lecture, onglets |
| **Expanded — Options** | Onglet Options | Panneau réglages | Modifier options |
| **Discussion — vide** | Panneau ouvert, 0 message | Invitation + composer | Saisir question |
| **Discussion — conversation** | ≥ 1 message | Fil + composer | Continuer |
| **Discussion — chargement** | GET en cours | Indicateur | — |
| **Discussion — envoi** | POST en cours | Composer désactivé + typing | — |
| **Discussion — non connecté** | Session absente | Gate auth | Connexion |
| **Discussion — erreur** | API / réseau | Bandeau + Réessayer | Retry |
| **Discussion — crédits** | 402 | Message crédits | Obtenir des crédits (**A8.4**) |

## Contenus et microcopy

| Contexte | Texte (FR) |
|----------|------------|
| Onglet | « Discussion » |
| Vide | « Posez une question sur cet audioguide » |
| Placeholder | « Posez votre question… » |
| Envoi (a11y) | « Envoyer la question » |
| Non connecté | « Connectez-vous pour discuter avec le guide Nook » |
| CTA connexion | « Se connecter » |
| Erreur réseau | « Impossible de joindre le guide. Vérifiez votre connexion. » |
| Réessayer | « Réessayer » |
| 402 | « Crédits insuffisants pour poser une question. » |
| Lien crédits | « Obtenir des crédits » |
| 429 | « Trop de questions en peu de temps. Réessayez dans quelques minutes. » |
| 422 sans sources | « Ce lieu n’a pas encore de sources pour répondre à vos questions. » |
| Assistant (mock) | Réponses contextuelles au guide et au lieu |

**Ton :** clair, curieux, jamais « IA » ou « modèle » dans l’UI ; Nook = guide personnalisé.

## Accessibilité

- Onglets : `accessibilityState.selected` ; labels localisés.
- Composer : label associé ; annonce erreur inline.
- Messages : rôle texte ; distinction user / assistant via label accessibilité (« Vous », « Guide Nook »).
- Cibles tactiles envoi ≥ 44×44 pt.
- `KeyboardAvoidingView` sur iOS pour le composer.

## Indicateurs et analytics

| Événement | Moment | Propriétés |
|-----------|--------|------------|
| `audio_player_expand` | Ouverture plein écran | `poi_id`, `guide_id` |
| `audio_player_tab` | Changement onglet | `tab` (`content` \| `options` \| `discussion` \| `themes`) |
| `guide_chat_open` | Panneau Discussion affiché | `poi_id`, `guide_id` |
| `guide_chat_send` | Envoi message | `poi_id`, `content_length` |
| `guide_chat_error` | Erreur API | `poi_id`, `code`, `status` |
| `guide_chat_auth_gate` | Tap connexion depuis gate | `poi_id`, `source` |

## Critères d’acceptation

1. **Étant donné** un guide en lecture sur **A3.2**, **quand** l’utilisateur minimise, **alors** le mini-player reste visible et la piste continue à la même position.
2. **Étant donné** le lecteur expanded, **quand** l’utilisateur ouvre **Discussion**, **alors** le panneau chat remplace timeline/contrôles et l’onglet Discussion est actif.
3. **Étant donné** un utilisateur **connecté** et un panneau Discussion ouvert, **quand** il envoie une question non vide, **alors** le message utilisateur apparaît et une réponse assistant est affichée (API ou mock).
4. **Étant donné** un utilisateur **non connecté**, **quand** il ouvre Discussion, **alors** un message invite à se connecter et le CTA mène à **A6.1** sans appeler l’API chat.
5. **Étant donné** une erreur réseau au chargement, **quand** l’utilisateur tape « Réessayer », **alors** l’historique est rechargé.
6. **Étant donné** une réponse API **402**, **quand** l’utilisateur envoie un message, **alors** un message crédits s’affiche sans planter le lecteur audio.
7. **Étant donné** l’onglet Discussion actif, **quand** l’utilisateur tape **Contenu**, **alors** timeline et contrôles réapparaissent.

## Open questions

- **Coût crédits par message** chat : fixe ou variable — à confirmer backend.
- **A7.1 « Dialogue guide »** (Évolution) : fusionner avec cet onglet ou écran dédié ?
- **Thématiques** : contenu et API — P2.
- **Suggestions de questions** (chips) : P2 pour amorcer la conversation.

---

*Implémentation MVP : `AudioPlayerSheet`, `AudioDiscussionPanel`, `useGuideChat`, `lib/api/guideChat.ts`, mock `lib/mockGuideChat.ts`.*
