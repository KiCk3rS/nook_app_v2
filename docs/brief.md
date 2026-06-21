# Brief produit — NOOK

Document **volontairement agnostique** : il décrit le sens du produit, les capacités attendues et les règles de fond. Il **ne prescrit** ni langage de programmation, ni framework, ni fournisseur technique précis. Les choix d’implémentation vivent ailleurs (code, documentation d’architecture, contrat d’interface).

---

## 1. Vision produit

NOOK est une **application de découverte** centrée sur des **points d’intérêt** (lieux, monuments, sites naturels, etc.), enrichis par des **guides audio** (narration à écouter sur place ou à distance).

L’ambition est une expérience **immersive, simple et personnalisée** pour explorer un territoire, en combinant **carte**, **recherche**, **recommandations** et **narration audio**.

---

## 2. Objectifs principaux

- Rendre facile la découverte de lieux **à proximité** ou **dans une zone** choisie par l’utilisateur.
- Proposer des contenus audio **contextualisés**, **clairs** et **engageants**.
- Permettre de **composer des parcours** cohérents reliant plusieurs lieux.
- Offrir une expérience **fluide** et **pensée pour le mobile** (usage en déplacement, interruptions, reprise).

---

## 3. Fonctionnalités côté utilisateur final

### 3.1 Carte et exploration spatiale

- Afficher les lieux pertinents sur une **carte interactive**.
- Utiliser la **position de l’utilisateur** lorsqu’elle est disponible et autorisée.
- Adapter la densité d’affichage des marqueurs au **niveau de zoom** (regroupement visuel lorsque pertinent).
- Permettre une **navigation** : aperçu rapide puis **fiche détaillée** du lieu.

### 3.2 Recherche et filtres

- **Recherche textuelle** sur les lieux (titre, description, mots-clés selon règles métier).
- **Filtres** combinables, par exemple :
  - distance ou zone ;
  - catégorie (culture, nature, gastronomie, etc.) ;
  - popularité (indices dérivés des écoutes ou des notes, selon produit) ;
  - durée du contenu audio ou du parcours.
- Présenter les résultats de façon **cohérente** entre la carte et une **liste** (même jeu de résultats, même ordre ou règle de tri explicite).

### 3.3 Fiche lieu (point d’intérêt)

- Informations descriptives : titre, texte, médias visuels.
- **Guide audio** associé, avec lecture dans l’application.
- Indications utiles en contexte : durée d’écoute, distance éventuelle, signaux de qualité ou de popularité selon le produit.
- Action pour **intégrer le lieu à un parcours** personnel.

### 3.4 Découverte (type « fil » ou « vitrine »)

- Sections dynamiques, par exemple :
  - derniers contenus ou lieux mis en avant ;
  - contenus les plus écoutés ;
  - contenus les mieux notés.
- Présentation en **défilement vertical** type flux.
- **Recommandations personnalisées** : évolution possible du produit, non obligatoire au premier périmètre.

### 3.5 Parcours (itinéraires)

- Consulter des **itinéraires éditoriaux** curatés par NOOK (thèmes, durée, étapes).
- Éventuellement proposer des **modèles** ou suggestions (ex. thème, durée approximative).
- Visualiser le parcours sur la **carte** avec un **enchaînement d’étapes**.
- **Suivre** un itinéraire sur place (mode guidage) avec accès aux guides audio.
- **Consulter** les parcours enregistrés sur le compte (sans création in-app au premier périmètre).

### 3.6 Compte et espace personnel

- **Profil** : informations que l’utilisateur choisit de renseigner ou d’afficher.
- **Historique d’écoute** : trace des contenus audio consultés (niveau de détail et durée de rétention à trancher produit / conformité).
- **Favoris** : lieux marqués par l’utilisateur.
- **Parcours enregistrés** : liste des parcours accessibles depuis le compte (consultation et reprise).
- **Paramètres** : langue, préférences d’usage, notifications si applicable.

### 3.7 Dialogue avec un « guide » autour d’un lieu (évolution produit)

- Permettre à l’utilisateur authentifié d’**poser des questions** contextualisées sur un lieu, avec des réponses fondées sur le **contenu disponible** (ex. scripts ou sources associées aux guides audio publiés).
- Gestion éventuelle d’**usage limité** (crédits, quotas) selon le modèle économique.

---

## 4. Fonctionnalités côté administration et production de contenu

### 4.1 Gestion éditoriale des lieux et des médias

- Création, modification et retrait des **fiches lieu**, statuts de publication (brouillon / publié, etc.).
- Gestion des **images** et des **métadonnées** associées.
- Gestion d’une **taxonomie** (catégories) pour organiser les lieux et alimenter les filtres.

### 4.2 Génération assistée de guides audio (pipeline métier)

Objectif : à partir d’une **source documentaire encyclopédique ouverte** (ex. article Wikipedia), produire automatiquement un **script oral** puis un **fichier audio** lié au lieu.

Principes :

1. **Entrée contrôlée** : une source identifiée de façon stable (URL ou équivalent), avec règles de validation pour éviter les abus.
2. **Extraction** du texte de référence de manière **traçable** (titre canonique, identifiants, lien vers la source).
3. **Transformation** du contenu en **script de lecture** (durée cible, langue, ton : paramètres métier), sans invention de faits non présents dans la source ; le comportement exact est défini par les prompts et garde-fous du produit.
4. **Vocalisation** via un **service externe de synthèse vocale** (choix de voix, qualité, coûts à dimensionner).
5. **Enregistrement** du résultat comme **ressource audio** rattachée au lieu, avec **mentions de licence et crédits** (ex. obligations liées au contenu sous licence ouverte).
6. **Suivi** du traitement par **états** successifs (en attente, en cours, terminé, erreur) pour permettre un suivi opérationnel et, si besoin, une **reprise** ou une **nouvelle tentative** après correction.

Les étapes longues ou fragiles doivent pouvoir s’exécuter **hors interaction synchrone** avec l’administrateur (traitement différé, file d’attente), pour éviter les timeouts et permettre les retries.

---

## 5. Principes transverses (non techniques)

### 5.1 Confiance et sécurité

- Les échanges avec le système doivent être **protégés** en production (canal confidentiel et intègre).
- Les **secrets** (clés d’API, mots de passe) ne font pas partie du dépôt de code public.
- L’**authentification** distingue clairement l’utilisateur standard et les **rôles privilégiés** (ex. administration).
- Les **accès aux fichiers médias** ne doivent pas reposer uniquement sur la connaissance d’un identifiant : **liens à durée de vie limitée** ou mécanisme équivalent lorsque le contenu n’est pas public.
- **Limiter le débit** des actions sensibles (connexion, création de compte, génération de contenu) pour réduire les abus.

### 5.2 Données personnelles et conformité

- Collecter et conserver les données personnelles dans le **strict nécessaire** du produit.
- Informer l’utilisateur sur l’usage des données ; respecter le droit applicable (consentement, effacement, portabilité selon juridiction).

### 5.3 Données géographiques

- Représenter les lieux sur le globe avec un **référentiel de coordonnées** commun (latitude / longitude en degrés décimaux, référence mondiale usuelle).
- Les recherches « à proximité » ou « dans une fenêtre carte » doivent être **déterministes** et **documentées** (règles de tri, pagination stable).

### 5.4 Médias audio

- Fournir des **métadonnées** (durée, langue, ordre d’affichage) distinctes du fichier binaire.
- Permettre la **reprise de lecture** (position dans le fichier) : le stockage ou la diffusion doit supporter les lectures partielles lorsque c’est pertinent.

### 5.5 Qualité et observabilité

- Les erreurs visibles par le client doivent être **compréhensibles** et **cohérentes** (message, code métier optionnel, détails de validation si utile).
- Les opérations longues doivent être **traçables** (identifiant de traitement, états, durées) pour le support et l’amélioration continue, sans journaliser de données sensibles inutilement.

---

## 6. Périmètres logiques du système (pour aligner équipes et agents)

Découpage **fonctionnel** — un même périmètre peut correspondre à un ou plusieurs composants logiciels selon les choix d’architecture.

| Périmètre | Rôle pour le produit |
|-----------|----------------------|
| **Identité et session** | Inscription, connexion, renouvellement de session, déconnexion ; profil et préférences. |
| **Catalogue lieux** | Publication, recherche, filtres, fiche détail, hiérarchie ou sous-lieux si métier. |
| **Taxonomie** | Catégories stables pour filtres et classement. |
| **Audio** | Métadonnées des pistes ; accès contrôlé au fichier de lecture. |
| **Découverte** | Agrégats ou listes pour les écrans « vitrine » (nouveautés, popularité, notes). |
| **Parcours** | Consultation et suppression des parcours utilisateur ; itinéraires éditoriaux et guidage. |
| **Engagement** | Favoris, historique d’écoute, signaux légers d’écoute pour affiner popularité si prévu. |
| **Administration contenu** | Opérations réservées aux rôles éditoriaux sur lieux, médias et catégories. |
| **Production IA audio** | Orchestration du pipeline source → script → voix → enregistrement ; suivi des jobs. |
| **Dialogue guide (lieu)** | Fil de conversation contextualisé par lieu, avec règles d’usage et de coût. |
| **Santé du service** | Signal minimal de disponibilité pour le déploiement et la supervision. |

---

## 7. Ce que ce brief ne contient pas

- Aucune **spécification d’interface** (chemins, verbes HTTP, schémas JSON) : voir la documentation de contrat et les artefacts générés à partir du code ou de l’outil de documentation d’API.
- Aucun **schéma de données** détaillé : voir le modèle de données du projet.
- Aucune **exigence de stack** front ou back : ce brief sert de **référence produit partagée** pour humains et agents IA ; les décisions techniques restent documentées dans les livrables adaptés (architecture, API client, etc.).

---

*NOOK — découverte de territoires par le lieu et l’audio.*
