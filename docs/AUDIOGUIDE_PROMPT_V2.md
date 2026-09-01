# Génération de scripts audioguide — Système de prompt personnalisable (v2)

## Vue d'ensemble

La génération de scripts audioguide repose sur un **template de prompt externalisé** dans `docs/PROMPT.md`. Ce fichier définit les instructions envoyées au LLM (Claude) pour transformer du contenu source (ex. Wikipedia) en script optimisé pour la synthèse vocale (TTS).

Le service backend (`ai-script-generator.service.ts`) charge ce template **au démarrage** et l'enrichit automatiquement à chaque requête.

---

## Architecture du flux

```
Démarrage app → Chargement docs/PROMPT.md
     ↓
Requête POST /api/audio-guides/generate-script
     ↓
Extraction du contenu depuis l'URL source
     ↓
Remplacement des variables du template
     ↓
Ajout des instructions dynamiques (maxWords, audience, titre, règles TTS)
     ↓
Envoi au LLM → Script généré retourné
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `docs/PROMPT.md` | Template de prompt actif (modifiable sans toucher au code) |
| `src/poi/ai-script-generator.service.ts` | Service qui charge le template, remplace les variables et appelle le LLM |
| `docs/CUSTOM_PROMPT_GUIDE.md` | Guide complet de personnalisation |
| `docs/PROMPT_INTEGRATION.md` | Récapitulatif technique de l'intégration |

---

## Variables du template

| Variable | Remplacée par | Obligatoire |
|---|---|---|
| `{{LANGUAGE}}` | Langue cible (`French`, `English`, etc.) | Oui |
| `{{WIKIPEDIA_CONTENT}}` | Contenu extrait et nettoyé de l'URL | Oui |

**Règles :** orthographe exacte, tout en majuscules, pas d'espaces (`{{LANGUAGE}}` ✅, `{{ LANGUAGE }}` ❌).

---

## Paramètres ajoutés automatiquement (hors template)

Le service complète le prompt avec :

- **Limite de mots** — selon `maxWords` de la requête
- **Public cible** — selon `targetAudience` (général, enfants, expert…)
- **Titre du POI** — si `title` est fourni
- **Règles TTS** — nombres en toutes lettres, pas d'abréviations, texte pur sans formatage markdown

---

## Structure recommandée du prompt

1. **Introduction** — contexte et objectif
2. **Balise de contenu** — `<wikipedia_content>{{WIKIPEDIA_CONTENT}}</wikipedia_content>`
3. **Structure** — Introduction, Contexte historique, Points clés, Anecdotes, Conclusion
4. **Style d'écriture** — ton narratif, langage accessible, storytelling
5. **Éléments audio** — transitions naturelles, invitations à observer, phrases courtes
6. **Directives de contenu** — exactitude factuelle, engagement, valeur pour le visiteur

**Contrainte TTS importante :** pas de caractères spéciaux (`#`, `*`, `-`), pas de titres de chapitres ni de formatage — texte pur prêt pour la lecture vocale.

---

## Personnalisation possible

### Par ton

- **Formel** — vocabulaire académique, précision historique
- **Décontracté** — ton conversationnel, comparaisons modernes
- **Narratif** — arc narratif, descriptions vivantes
- **Enfants** — vocabulaire simple, questions interactives, fun facts

### Par type de POI

- **Monuments** — architecture, histoire, détails de construction
- **Musées** — collections, œuvres notables, infos pratiques

### Versionning

Créer des variantes pour tester :

```
docs/
  ├── PROMPT.md              # Version active
  ├── PROMPT_v1_formal.md
  ├── PROMPT_v2_casual.md
  └── PROMPT_v3_narrative.md
```

Basculer = copier la variante souhaitée vers `PROMPT.md` + redémarrer l'app.

---

## Workflow de modification

1. Éditer `docs/PROMPT.md` (conserver `{{LANGUAGE}}` et `{{WIKIPEDIA_CONTENT}}`)
2. Sauvegarder
3. **Redémarrer l'application** (le template est chargé au démarrage uniquement)
4. Tester via l'API :

```bash
POST /api/audio-guides/generate-script
{
  "url": "https://fr.wikipedia.org/wiki/Tour_Eiffel",
  "language": "fr",
  "maxWords": 250
}
```

5. Évaluer et itérer

---

## Critères de qualité du script généré

| Critère | Bon ✅ | À améliorer ⚠️ |
|---|---|---|
| Structure | Sections claires | Désorganisé |
| Longueur | ±10% de `maxWords` | Dépasse de >20% |
| Ton | Adapté au public | Trop formel/informel |
| Audio | Phrases courtes, fluides | Phrases complexes |
| Contenu | Informatif et engageant | Ennuyeux ou incomplet |

---

## Dépannage

| Problème | Cause | Solution |
|---|---|---|
| Erreur de chargement du template | Fichier absent ou permissions | Vérifier `docs/PROMPT.md` — fallback automatique si absent |
| `{{LANGUAGE}}` dans le script | Faute dans la variable | Vérifier orthographe et casse |
| Le prompt ne change rien | App non redémarrée | Redémarrer après chaque modification |
| Script ne respecte pas les consignes | Prompt trop vague ou contradictoire | Être plus spécifique, hiérarchiser avec **OBLIGATOIRE**, simplifier |

---

## Bonnes pratiques

### À faire

- Être spécifique et structuré (titres, listes)
- Donner des exemples dans le prompt
- Tester et itérer après chaque modification
- Versionner avec Git (`git commit` sur `docs/PROMPT.md`)
- Garder des backups des variantes

### À éviter

- Prompts > 1000 mots (dilue l'attention du LLM)
- Instructions contradictoires
- Supprimer les variables obligatoires
- Oublier le contexte audio/TTS
- Modifier sans redémarrer l'app

---

## Statut de l'intégration (v2)

- ✅ Prompt chargé depuis `docs/PROMPT.md` au démarrage
- ✅ Variables `{{LANGUAGE}}` et `{{WIKIPEDIA_CONTENT}}` fonctionnelles
- ✅ Fallback automatique si fichier manquant
- ✅ Instructions dynamiques ajoutées par requête
- ✅ Support multi-langue et multi-public cible

---

## Documentation complémentaire

| Document | Description |
|---|---|
| [PROMPT.md](PROMPT.md) | Template de prompt actif |
| [CUSTOM_PROMPT_GUIDE.md](CUSTOM_PROMPT_GUIDE.md) | Guide complet de personnalisation |
| [PROMPT_INTEGRATION.md](PROMPT_INTEGRATION.md) | Récapitulatif technique de l'intégration |
| [AI_SCRIPT_GENERATION.md](AI_SCRIPT_GENERATION.md) | Documentation API complète |

---

**Dernière mise à jour :** Septembre 2026  
**Version :** 2.0
