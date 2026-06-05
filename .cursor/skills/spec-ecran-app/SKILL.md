---
name: spec-ecran-app
description: Produit des documents Markdown de spécification d’écran d’application (structure, états, navigation, accessibilité, critères d’acceptation). S’applique quand l’utilisateur demande une spec d’écran, une fiche écran, un cahier de détail UX/UI, ou la description précise d’un flux mobile ; aussi pour enrichir docs/ecrans.md ou des fichiers sous docs/.
---

# Spécification d’écran d’app (NOOK)

## Quand utiliser ce skill

- Création ou mise à jour d’une **fiche écran** / **spec fonctionnelle + UX** pour l’app utilisateur.
- Besoin d’**homogénéiser** plusieurs écrans (même structure de doc, mêmes états, mêmes critères d’acceptation).

## Entrées à exploiter avant d’écrire

1. `docs/ecrans.md` : ID, objectif, priorité, flux liés.
2. `docs/brief.md` : capacités attendues, contraintes produit (données, légal, perf).
3. Si l’utilisateur a fourni maquettes ou stack : **ne pas contredire** ; compléter le comportement et les cas limites.

## Étapes

1. **Fixer le périmètre** : un écran principal + modales / feuilles **dans le même fichier** si elles sont indissociables du flux.
2. **Remplir le gabarit** ci-dessous (toutes les sections ; mettre « N/A » justifié si non applicable).
3. **Passer la checklist** : lire [ux-checklist.md](ux-checklist.md) et intégrer les points manquants dans la spec (surtout états, accessibilité, erreurs).
4. **Critères d’acceptation** : formulation **Given / When / Then** ou équivalent testable, en français.

## Gabarit de sortie (copier-coller pour le document)

```markdown
# [ID] — [Nom court de l’écran]

## Méta
| Champ | Valeur |
|-------|--------|
| ID produit | |
| Priorité (P0–P2 / Évolution) | |
| Plateforme | Mobile (défaut) / … |
| Dépendances | Brief §… ; écrans liés : … |

## Résumé
[Une phrase utilisateur + une phrase produit]

## Utilisateur et contexte
- Persona ou situation d’usage :
- Contraintes (marche, debout, soleil, réseau faible) :

## Navigation
- Arrivée depuis :
- Sorties (actions / destinations) :
- Retour arrière (système + in-app) :

## Structure de l’interface
### Hiérarchie visuelle (1 = plus important)
1.
2.

### Zones / composants
| Zone ou composant | Rôle | Contenu / données | Notes UX |
|-------------------|------|--------------------|----------|

## Interactions et règles
- Gestes :
- Chargements / validations :
- Règles métier spécifiques :

## États
| État | Déclencheur | Affichage | Actions |
|------|-------------|-----------|---------|

## Contenus et microcopy
- Titres, messages d’erreur, vides (texte proposé ou « à rédiger éditorial ») :
- Ton : clair, rassurant, sans jargon technique vers l’utilisateur.

## Accessibilité
- Focus, annonces, alternatives :
- Cibles tactiles et espacements :

## Indicateurs et analytics (si applicable)
- Événements ou métriques à documenter (sans secrets) :

## Critères d’acceptation
1. …
2. …

## Open questions
- …
```

## Qualité attendue

- **Précision** : chaque bouton ou lien a une **destination** ou un **état** décrit.
- **Pas d’ambiguïté** sur qui est le CTA principal.
- **Traçabilité** : lier explicitement brief / inventaire écrans.

## Ressource associée

- Checklist UX/UI détaillée : [ux-checklist.md](ux-checklist.md)
