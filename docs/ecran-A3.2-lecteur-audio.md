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

**Utilisateur :** écouter un guide audio sur un lieu, **suivre le script phrase par phrase** (style karaoké), **basculer vers un autre thème** du même POI, ajuster la lecture (vitesse, minuteur…) et **poser des questions au guide IA Nook** pour obtenir des précisions pendant l’écoute.

**Produit :** lecteur plein écran + mini-player persistant ; vue par défaut = contrôles de lecture seuls (aucun onglet actif) ; onglet **Contenu** pour les paroles synchronisées ; onglet **Thématiques** pour les autres guides du lieu ; onglet **Discussion** (chat contextuel au POI) ; reprise de position ; branchement API **F-016** avec fallback mock hors API.

## Utilisateur et contexte

- **Persona / situation :** visiteur en déplacement ou en préparation, guide audio lancé depuis **A3.1** ou le mode guidage **A5.5** ; souhaite lire en même temps qu’écouter, changer de thème sans quitter le lecteur, ou approfondir un passage.
- **Contraintes :** debout, une main, réseau variable ; le chat ne doit pas interrompre la piste audio ; clavier mobile (évitement clavier sur le composer) ; lisibilité du texte en plein soleil.

## Navigation

| Sens | Détail |
|------|--------|
| **Arrivée depuis** | **A3.1** — play sur une piste ou CTA « Écouter le guide » ; **A5.5** — CTA « Écouter » ; mini-player global (expansion). |
| **Sorties** | Minimiser → mini-player ; fermer (dismiss) → arrêt session audio ; **A6.1** — connexion requise pour Discussion si anonyme ; **A8.4** — crédits insuffisants chat (402, P1). |
| **Retour arrière** | Bouton chevron bas (minimize) ; bouton OS back = minimize ; pas de perte de position audio. |

**Contexte conservé :** `poiId`, `poiName`, `guideId`, `guideTitle`, position de lecture.

## Structure de l’interface

### Hiérarchie visuelle (1 = plus important)

1. **Contrôles lecture** (timeline, play/pause, ±15 s / +30 s) — **vue par défaut** (aucun onglet actif).
2. **Hero** — artwork, titre guide, nom lieu (fixe en haut).
3. **Barre d’onglets** — Contenu · Options · Discussion · Thématiques.
4. **Panneau contextuel** — remplace la zone centrale selon l’onglet actif (paroles, options, discussion, thèmes).

### Zones / composants

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Hero** | Contexte | `imageUrl`, `guide.title`, `place.name` | Toujours visible ; se met à jour au changement de thème |
| **Timeline + contrôles** | Lecture | `positionMs`, `durationMs` | Toujours visibles sauf Options / Discussion / Thématiques ouverts |
| **Panneau paroles** | Script karaoké | `segments[]` : `{ startMs, endMs, text }` | Uniquement si onglet **Contenu** actif |
| **Panneau Options** | Réglages audio | Vitesse, voice boost, silences, minuteur | Toggle onglet Options |
| **Panneau Discussion** | Chat guide IA | Messages, composer | Toggle onglet Discussion — cf. § Discussion |
| **Panneau Thématiques** | Autres guides du POI | `place.audioGuides` hors guide en cours | Toggle onglet Thématiques — cf. § Thématiques |
| **Mini-player** | Reprise globale | Titre, play/pause, progress | `GlobalAudioChrome` ; au-dessus tab bar si `(tabs)` |
| **Barre onglets** | Navigation secondaire | 4 onglets | Aucun onglet actif à l’ouverture ; icône Thématiques : `layers-outline` |

### Panneau paroles (onglet Contenu)

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **Liste phrases** | Script oral | Segments horodatés phrase par phrase | Aligné à gauche ; scroll auto vers la phrase active |
| **Phrase active** | Synchronisation | Segment où `startMs ≤ positionMs < endMs` | Fond discret + texte renforcé (couleur primaire / encre) |
| **Phrases passées** | Contexte | Segments antérieurs | Texte atténué |
| **Phrases à venir** | Anticipation | Segments futurs | Texte secondaire |
| **État vide** | Absence transcript | « Le texte de ce guide n'est pas encore disponible. » | Pas de crash ; contrôles lecture restent visibles |
| **Tap phrase** | Navigation | Seek à `startMs` du segment | Reprend la lecture à cette phrase |

**Granularité v1 :** phrase par phrase (pas mot par mot).

**Affichage :** les paroles ne sont **pas** visibles à l’ouverture du lecteur ; elles apparaissent uniquement après tap sur l’onglet **Contenu**.

### Panneau Thématiques

| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|-------------------|----------|
| **En-tête section** | Libellé | « Autres thèmes » | Cohérent avec **A3.1** (`AudioGuideList`) |
| **Liste thèmes** | Guides alternatifs | `place.audioGuides` **excluant** le guide en cours | Titre, durée, résumé, bouton play |
| **Ligne thème — prêt** | Sélection | `status: ready` | Tap → bascule la lecture vers ce guide ; hero mis à jour |
| **Ligne thème — pending** | Indisponible | `status: pending` | Affiché « À générer » ; non cliquable |
| **État vide** | Un seul guide | « Aucun autre thème » + corps explicatif | Si le POI n’a qu’un guide audio |

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

### Paroles synchronisées

- **Source** : script de lecture produit par le pipeline éditorial / IA (brief §4.2) ; segments `{ startMs, endMs, text }` par phrase.
- **Synchronisation** : la phrase active est recalculée à chaque tick de position (`positionMs`) ; scroll automatique pour garder la phrase active visible (~35 % du viewport).
- **Seek** : tap sur une phrase → seek audio à `startMs` ; la phrase devient active au prochain tick.
- **Vitesse de lecture** : le surlignage suit la position réelle (déjà corrigée par le moteur audio).
- **Hors transcript** : message vide discret ; timeline et contrôles restent utilisables.
- **MVP** : données mock dans `constants/mockGuideTranscripts.ts` pour les guides `1-a` et `2-a` ; branchement API ultérieur.

### Onglets

- **État initial** : aucun onglet actif ; seuls timeline + contrôles sont affichés (pas de paroles).
- **Contenu** : toggle — affiche paroles + contrôles ; second tap referme les paroles (retour état initial).
- **Options** / **Discussion** / **Thématiques** : toggles exclusifs ; remplacent la zone centrale (paroles + contrôles masqués) ; second tap sur le même onglet = fermeture (retour état initial avec contrôles seuls).
- Un seul panneau secondaire ouvert à la fois.

### Thématiques — règles métier

- **Périmètre** : guides audio du **même POI** (`place.audioGuides`), hors guide actuellement en lecture.
- **Sélection** : tap sur un guide `ready` → `startPlayback(place, guide)` ; reprise depuis le début du nouveau guide.
- **Guide en cours** : exclu de la liste (pas de doublon).
- **Pending** : visible mais non sélectionnable.
- **Données** : mêmes métadonnées que **A3.1** (`title`, `summary`, `durationSec`, `status`).

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

### Contrat API cible — transcript (à implémenter backend)

| Méthode | Chemin | Auth | Description |
|--------|--------|------|-------------|
| GET | `/api/v1/audio-guides/:guideId/transcript` | Bearer ou public selon guide | Segments phrase par phrase |

Réponse proposée :

```json
{
  "guideId": "1-a",
  "language": "fr",
  "segments": [
    { "id": "1", "startMs": 0, "endMs": 12000, "text": "…" }
  ]
}
```

## États

| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|
| **Mini-player** | Minimize | Barre compacte | Expand, play/pause, dismiss |
| **Expanded — défaut** | Ouverture lecteur | Hero + timeline + contrôles ; aucun onglet actif | Lecture, ouvrir un onglet |
| **Expanded — Contenu** | Tap onglet Contenu | Hero + paroles + timeline + contrôles | Lecture, scroll paroles, seek phrase |
| **Contenu — paroles actives** | Lecture en cours + Contenu ouvert | Phrase surlignée + auto-scroll | Tap phrase → seek |
| **Contenu — sans transcript** | Contenu ouvert, pas de segments | Message vide + contrôles | Lecture normale |
| **Expanded — Options** | Tap onglet Options | Panneau réglages | Modifier options |
| **Expanded — Thématiques** | Tap onglet Thématiques | Liste autres guides du POI | Sélectionner un thème |
| **Thématiques — vide** | Un seul guide sur le POI | Message « Aucun autre thème » | — |
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
| Onglet | « Contenu » |
| Paroles — vide | « Le texte de ce guide n'est pas encore disponible. » |
| Paroles (a11y) | « Paroles du guide audio » |
| Phrase (a11y) | « Aller à : {texte de la phrase} » |
| Onglet | « Thématiques » |
| Section thèmes | « Autres thèmes » |
| Thèmes — vide (titre) | « Aucun autre thème » |
| Thèmes — vide (corps) | « Ce lieu ne propose qu'un seul guide audio pour le moment. » |
| Thème pending | « À générer » |
| Thème play (a11y) | « Écouter {titre} » |
| Thème pause (a11y) | « Mettre en pause — {titre} » |
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
| 422 sans sources | « Ce lieu n'a pas encore de sources pour répondre à vos questions. » |
| Assistant (mock) | Réponses contextuelles au guide et au lieu |

**Ton :** clair, curieux, jamais « IA » ou « modèle » dans l’UI ; Nook = guide personnalisé.

## Accessibilité

- Onglets : `accessibilityState.selected` ; labels localisés.
- Paroles : chaque phrase est un bouton avec label « Aller à : … » ; phrase active annoncée via `accessibilityState.selected`.
- Thèmes : chaque ligne est un bouton ; état `disabled` si pending ; label play/pause explicite.
- Composer : label associé ; annonce erreur inline.
- Messages : rôle texte ; distinction user / assistant via label accessibilité (« Vous », « Guide Nook »).
- Cibles tactiles envoi ≥ 44×44 pt ; phrases espacées pour tap confortable.
- `KeyboardAvoidingView` sur iOS pour le composer.

## Indicateurs et analytics

| Événement | Moment | Propriétés |
|-----------|--------|------------|
| `audio_player_expand` | Ouverture plein écran | `poi_id`, `guide_id` |
| `audio_player_tab` | Changement onglet | `tab` (`content` \| `options` \| `discussion` \| `themes`) |
| `audio_lyrics_seek` | Tap sur une phrase | `poi_id`, `guide_id`, `start_ms` |
| `audio_theme_select` | Tap sur un autre thème | `poi_id`, `from_guide_id`, `to_guide_id` |
| `guide_chat_open` | Panneau Discussion affiché | `poi_id`, `guide_id` |
| `guide_chat_send` | Envoi message | `poi_id`, `content_length` |
| `guide_chat_error` | Erreur API | `poi_id`, `code`, `status` |
| `guide_chat_auth_gate` | Tap connexion depuis gate | `poi_id`, `source` |

## Critères d’acceptation

1. **Étant donné** un guide en lecture sur **A3.2**, **quand** l’utilisateur minimise, **alors** le mini-player reste visible et la piste continue à la même position.
2. **Étant donné** le lecteur expanded à l’ouverture, **quand** aucun onglet n’est actif, **alors** seuls timeline et contrôles sont visibles (pas de paroles).
3. **Étant donné** le lecteur expanded, **quand** l’utilisateur tape **Contenu**, **alors** les paroles apparaissent au-dessus des contrôles et l’onglet Contenu est actif.
4. **Étant donné** l’onglet Contenu actif avec un transcript disponible, **quand** la lecture progresse, **alors** la phrase correspondant à `positionMs` est surlignée et reste visible (auto-scroll).
5. **Étant donné** l’onglet Contenu actif, **quand** l’utilisateur tape une phrase, **alors** la lecture reprend à `startMs` de cette phrase.
6. **Étant donné** l’onglet Contenu actif, **quand** l’utilisateur tape **Contenu** une seconde fois, **alors** les paroles disparaissent et seuls les contrôles restent visibles.
7. **Étant donné** un guide sans transcript et l’onglet Contenu ouvert, **quand** l’utilisateur consulte le panneau, **alors** un message discret s’affiche et les contrôles restent utilisables.
8. **Étant donné** un POI avec plusieurs guides audio, **quand** l’utilisateur ouvre **Thématiques**, **alors** la liste affiche les autres thèmes (hors guide en cours) avec titre, durée et résumé.
9. **Étant donné** le panneau Thématiques ouvert, **quand** l’utilisateur tape un thème `ready`, **alors** la lecture bascule vers ce guide et le hero affiche le nouveau titre.
10. **Étant donné** un POI avec un seul guide, **quand** l’utilisateur ouvre **Thématiques**, **alors** un message « Aucun autre thème » s’affiche.
11. **Étant donné** le lecteur expanded, **quand** l’utilisateur ouvre **Discussion**, **alors** le panneau chat remplace la zone centrale et l’onglet Discussion est actif.
12. **Étant donné** un utilisateur **connecté** et un panneau Discussion ouvert, **quand** il envoie une question non vide, **alors** le message utilisateur apparaît et une réponse assistant est affichée (API ou mock).
13. **Étant donné** un utilisateur **non connecté**, **quand** il ouvre Discussion, **alors** un message invite à se connecter et le CTA mène à **A6.1** sans appeler l’API chat.
14. **Étant donné** une erreur réseau au chargement, **quand** l’utilisateur tape « Réessayer », **alors** l’historique est rechargé.
15. **Étant donné** une réponse API **402**, **quand** l’utilisateur envoie un message, **alors** un message crédits s’affiche sans planter le lecteur audio.

## Open questions

- **Coût crédits par message** chat : fixe ou variable — à confirmer backend.
- **A7.1 « Dialogue guide »** (Évolution) : fusionner avec cet onglet ou écran dédié ?
- **Suggestions de questions** (chips) : P2 pour amorcer la conversation.
- **Transcript mot par mot** : P2 si le pipeline TTS fournit des timestamps fins.
- **Cache transcript** : offline / TTL — à trancher avec backend.
- **Reprise position** au changement de thème : reprendre la dernière position écoutée ou toujours depuis le début ?

---

*Implémentation MVP : `AudioPlayerSheet`, `AudioLyricsPanel`, `AudioThemesPanel`, `AudioDiscussionPanel`, `useGuideChat`, `lib/guideTranscript.ts`, mock `constants/mockGuideTranscripts.ts`.*
