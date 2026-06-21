# Inventaire des écrans NOOK

Document **dérivé** du [brief produit](./brief.md). Il sert de **source unique** pour la conception et la création des écrans de l’application. Les libellés et regroupements peuvent être ajustés lors du design (modales, onglets, navigation partagée).

**Légende des priorités (suggestion produit)**  
- **P0** : nécessaire au cœur de la promesse (carte, lieu, audio, découverte de base).  
- **P1** : fortement attendu pour l’usage complet (recherche, parcours, compte minimal).  
- **P2** : engagement et personnalisation avancée.  
- **Évolution** : prévu dans le brief comme évolution, non bloquant pour un premier périmètre.  
- **Admin** : réservé aux rôles privilégiés (cf. brief §4–5).

---

## Partie A — Application utilisateur final

### A1. Carte-accueil, première ouverture et exploration spatiale

Écran **racine** de l’app : la **carte interactive** sert d’**accueil** ; les accès vers découverte, recherche et compte s’y greffent (navigation, barre, bottom nav, etc.).

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A1.1 | **Carte-accueil (écran racine)** | Carte avec lieux, zoom, regroupement des marqueurs si pertinent, position si autorisée ; point d’entrée unique vers fil, recherche, compte — **fusion** de l’ancien « hub » et de la carte principale. | §2, §3, §3.1 | P0 |
| A1.2 | **Demande d’autorisations** (géolocalisation, notifications si applicable) | Expliquer pourquoi la position est utile ; lien avec exploration à proximité. | §3.1, §3.6 | P0 |
| A1.3 | **État erreur / indisponibilité** sur la racine (hors ligne, service indisponible) | Messages compréhensibles, actions de secours (réessayer, mode dégradé si prévu). | §5.1, §5.5 | P1 |
| A1.4 | **Aperçu rapide d’un lieu** (feuille / carte / bulle depuis la carte) | Résumé avant la fiche complète ; accès « en un geste » vers le détail. | §3.1 | P0 |

### A2. Recherche et filtres

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A2.1 | **Recherche textuelle** | Saisie et lancement de recherche sur titres, descriptions, mots-clés (règles métier). | §3.2 | P1 |
| A2.2 | **Panneau filtres** (modal ou page dédiée) | Filtres combinables : distance / zone, catégorie, popularité, durée audio ou parcours. | §3.2 | P1 |
| A2.3 | **Liste des résultats** | Liste alignée avec la carte (même jeu de résultats, tri explicite). | §3.2 | P1 |
| A2.4 | **Carte filtrée / résultats sur carte** | Vue carte synchronisée avec la liste (même ordre ou règle de tri documentée). | §3.2 | P1 |

### A3. Fiche lieu et audio

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A3.1 | **Fiche lieu (détail point d’intérêt)** | Texte, médias visuels, métadonnées utiles (durée, distance, signaux qualité/popularité). | §3.3 | P0 |
| A3.2 | **Lecteur audio intégré** (sur la fiche ou barre globale) | Lecture du guide dans l’app ; reprise de position ; métadonnées durée / langue. | §3.3, §5.4 | P0 |
| A3.3 | **Ajout au parcours** (flux depuis la fiche) | Choisir un parcours existant ou en créer un ; confirmer l’intégration du lieu. | §3.3, §3.5 | P1 |

### A4. Découverte (fil / vitrine)

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A4.1 | **Fil de découverte** (défilement vertical) | Sections dynamiques : mis en avant, plus écoutés, mieux notés, etc. | §3.4 | P0 |
| A4.2 | **Section recommandations personnalisées** (si produit activé) | Bloc ou onglet dédié aux recommandations ; peut être fusionné avec A4.1. | §3.4 | Évolution |
| A4.3 | **Hub ville** (vitrine territoriale) | Porte d’entrée éditoriale d’une ville : catégories d’itinéraires, premium, incontournables, affiliation. | §3.4, §3.5 | P1 |
| A4.4 | **Hub pays** (vitrine territoriale) | Même gabarit qu’A4.3 à l’échelle nation : villes à explorer, itinéraires transverses. | §3.4, §3.5 | P2 |
| A4.5 | **Hub quartier** (vitrine territoriale locale) | Extension A4.3 pour quartiers à contenu éditorial dense (itinéraires dédiés, POI curatés, expériences) ; défaut = fiche lieu **A3.1**. | §3.4, §3.5 | P1 |

### A5. Parcours

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A5.1 | **Liste des parcours enregistrés** | Parcours créés ou sauvegardés ; accès rapide. | §3.5, §3.6 | P1 |
| A5.2 | **Création / édition de parcours** | Composer l’ordre des étapes ; nom du parcours ; ajout / suppression de lieux. | §3.5 | P1 |
| A5.3 | **Suggestions ou modèles de parcours** (si produit prévoit des gabarits) | Thème, durée approximative ; insertion dans un parcours utilisateur. | §3.5 | P2 |
| A5.4 | **Visualisation parcours sur carte** | Tracé ou enchaînement des étapes sur la carte ; lecture des étapes. | §3.5 | P1 |
| A5.5 | **Détail d’un parcours** (lecture « mode guidage ») | Suivre le parcours étape par étape avec accès aux fiches lieux et audio. | §3.5 | P1 |
| A5.6 | **Détail itinéraire éditorial** | Parcours curaté NOOK (≠ parcours utilisateur) ; étapes, carte, audio ; accès premium. | §3.5 | P1 |
| A5.7 | **Liste itinéraires par catégorie** | Vue filtrée depuis le hub (« Les points forts », « Les secrets », etc.). | §3.5 | P1 |

### A6. Compte et espace personnel

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A6.1 | **Connexion** | Authentification utilisateur standard. | §5.1, §6 | P1 |
| A6.2 | **Inscription / création de compte** | Création de compte avec limites de débit / sécurité côté produit. | §5.1, §6 | P1 |
| A6.3 | **Réinitialisation mot de passe** (si applicable) | Parcours classique de récupération. | §5.1 | P1 |
| A6.4 | **Profil** | Informations affichées / modifiables selon choix utilisateur. | §3.6 | P1 |
| A6.5 | **Favoris** | Liste des lieux marqués. | §3.6 | P2 |
| A6.6 | **Historique d’écoute** | Trace des contenus audio consultés (niveau de détail selon produit / conformité). | §3.6, §5.2 | P2 |
| A6.7 | **Paramètres** | Langue, préférences d’usage, notifications si applicable ; liens confidentialité / données. | §3.6, §5.2 | P1 |
| A6.8 | **Déconnexion** (action depuis profil ou paramètres) | Fin de session claire. | §6 | P1 |

### A7. Dialogue « guide » autour d’un lieu (évolution)

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A7.1 | **Conversation contextualisée sur un lieu** | Poser des questions ; réponses fondées sur le contenu publié ; affichage quota / crédits si modèle économique prévu. | §3.7 | Évolution |

### A8. Légal et confiance (transversal)

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| A8.1 | **Informations légales / confidentialité** | Transparence sur l’usage des données (peut être webview ou pages natives). | §5.2 | P1 |
| A8.2 | **Conditions d’utilisation** (si requis) | Acceptation ou consultation. | §5.2 | P1 |
| A8.3 | **Paywall premium** (déblocage contenu) | Feuille achat à l’unité ou abonnement pour itinéraires premium. | §5.2 | P1 |

---

## Partie B — Administration et production de contenu

Ces écrans répondent à la problématique **éditoriale et opérationnelle** du produit (contenu publié, pipeline audio). Ils sont distincts de l’app grand public ; l’UI peut être web ou intégrée selon l’architecture.

| ID | Écran | Objectif | Réf. brief | Priorité |
|----|--------|----------|------------|----------|
| B1 | **Connexion administration** | Authentification rôle privilégié, distincte ou renforcée par rapport au compte standard. | §5.1, §4 | Admin |
| B2 | **Tableau de bord / liste des lieux** | Vue des fiches ; statuts (brouillon / publié) ; accès création / édition. | §4.1 | Admin |
| B3 | **Édition fiche lieu** | Création, modification, retrait ; champs descriptifs et publication. | §4.1 | Admin |
| B4 | **Gestion des médias du lieu** | Images et métadonnées associées à une fiche. | §4.1 | Admin |
| B5 | **Gestion de la taxonomie (catégories)** | Organiser les lieux et alimenter les filtres côté app. | §4.1 | Admin |
| B6 | **Lancement génération guide audio** | Saisie source stable (URL ou équivalent), validation, paramètres script (durée, langue, ton). | §4.2 | Admin |
| B7 | **Suivi des jobs de génération** | États (en attente, en cours, terminé, erreur) ; identifiant de traitement ; reprise / nouvelle tentative. | §4.2, §5.5 | Admin |
| B8 | **Détail d’un job / journal de traitement** | Traçabilité opérationnelle sans exposer de secrets ; messages d’erreur compréhensibles. | §4.2, §5.5 | Admin |

---

## Synthèse des flux principaux (pour le design)

1. **Découverte spatiale** : A1.1 → A1.4 → A3.1 → A3.2 ; option A3.3 vers A5.x.  
2. **Découverte éditoriale** : A4.1 → A3.1 → A3.2.  
3. **Découverte territoriale** : A2.1 / A4.1 → **A4.3** → A5.7 / **A5.6** → A3.1 / A1.1 ; **A4.4** → A4.3 (pays → ville, P2) ; **A4.3** → **A4.5** (ville → quartier hub, si contenu éditorial).  
4. **Recherche ciblée** : A2.1 ± A2.2 → A2.3 ou A2.4 → A3.1 ou **A4.3** (ville).  
5. **Parcours** : A5.1 / A5.2 / A5.4 / A5.5 en boucle avec A1.1 et A3.  
6. **Monétisation premium** : A4.3 / A5.6 / A5.7 → **A8.3** → contenu débloqué sur A5.6.  
7. **Rétention** : A6.5, A6.6, A5.1 depuis A6.4 ou A1.1.  
8. **Production** (équipe) : B2 → B3 / B4 / B5 ; B6 → B7 → B8.

---

## Notes pour les designers et développeurs

- **A1.1** concentre l’ancien « accueil / hub » et la **carte principale** : une seule vue racine, mobile first.  
- **A1.2** : feuille permissions depuis le contrôle géoloc sur la carte (pas d’onboarding bloquant) — spec [`ecran-A1.2-permissions.md`](./ecran-A1.2-permissions.md).  
- **A3.1** : fiche lieu plein écran depuis l’aperçu carte (**A1.4**) — spec [`ecran-A3.1-fiche-lieu.md`](./ecran-A3.1-fiche-lieu.md).
- **A2.1** : recherche textuelle en feuille depuis la barre carte (**A1.1**) — découverte (promu, populaires) + résultats — spec [`ecran-A2.1-recherche-textuelle.md`](./ecran-A2.1-recherche-textuelle.md). Les cartes « destination » représentant une **ville** mènent vers **A4.3** ; les **POI** unitaires restent **A3.1**.  
- **A4.3** : hub ville — vitrine territoriale (itinéraires, premium, affiliation) — spec [`ecran-A4.3-hub-ville.md`](./ecran-A4.3-hub-ville.md). Couche entre recherche/fil et fiche lieu.  
- **A4.4** : hub pays (P2) — réutilise le pattern **A4.3** — spec [`ecran-A4.4-hub-pays.md`](./ecran-A4.4-hub-pays.md).
- **A4.5** : hub quartier — critères contenu (itinéraires dédiés + POI curatés) ; défaut quartier = **A3.1** — spec [`ecran-A4.5-hub-quartier.md`](./ecran-A4.5-hub-quartier.md). MVP : Le Marais (`/city/paris/district/le-marais`).  
- **A5.5** : mode guidage pas-à-pas — spec [`ecran-A5.5-mode-guidage.md`](./ecran-A5.5-mode-guidage.md). Partagé parcours utilisateur et itinéraires éditoriaux ; entrée depuis **A5.6** ou **A5.1**.
- **A5.6** : détail itinéraire éditorial — spec [`ecran-A5.6-detail-itineraire-editorial.md`](./ecran-A5.6-detail-itineraire-editorial.md). Distinct des parcours utilisateur **A5.5**.  
- **A5.7** : liste itinéraires par catégorie depuis le hub — spec [`ecran-A5.7-liste-itineraires-categorie.md`](./ecran-A5.7-liste-itineraires-categorie.md).  
- **A8.3** : paywall premium — spec [`ecran-A8.3-paywall-premium.md`](./ecran-A8.3-paywall-premium.md).  
- Plusieurs IDs peuvent être **fusionnés** en une seule vue (ex. recherche + filtres + carte en onglets ou split).  
- Le **lecteur audio** peut être un composant persistant (mini-player) plutôt qu’un « écran » à part entière ; l’important est de couvrir **reprise de lecture** et **contexte lieu**.  
- L’alignement **liste / carte** (§3.2) impose des règles UX et techniques communes, quel que soit le nombre de vues physiques.  
- Les écrans **Évolution** (A4.2, A7.1) peuvent rester hors maquette initiale mais le brief les anticipe : prévoir l’espace informationnel (navigation, droits).

---

*Document généré à partir du brief NOOK — à maintenir lors des évolutions produit.*
