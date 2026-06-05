# Checklist UX / UI — fiche écran

Cocher mentalement chaque axe ; intégrer les écarts dans la spec (tableaux « États » ou section dédiée).

## Fondamentaux

- [ ] **Tâche principale** identifiable en moins de 3 secondes sur la maquette ou la description.
- [ ] **Progression** claire : l’utilisateur sait où il est dans le flux (titre, étape, carte contextuelle).
- [ ] **Erreurs prévisibles** : saisie, réseau, permission, contenu vide — message + action corrective.

## Touch et mobile

- [ ] **Zones tactiles** ≥ 44×44 pt (ou équivalent documenté) pour actions fréquentes.
- [ ] **Pouce** : actions critiques dans la moitié inférieure de l’écran si usage une main (ou justifier le contraire).
- [ ] **Scroll** : barres d’outils persistantes ne masquent pas le CTA principal sans offset documenté.

## Navigation

- [ ] **Retour** : comportement du geste OS et du bouton in-app alignés (pas de double pile confuse).
- [ ] **Liens profonds** : si l’écran peut être ouvert directement, états par défaut et données manquantes décrits.

## Contenu et langage

- [ ] **Vide** : état zéro avec invitation à l’action (pas seulement « Aucun résultat »).
- [ ] **Chargement** : skeleton ou indicateur proportionné à la durée attendue ; pas de flash trompeur.
- [ ] **Libellés** : verbes d’action sur les boutons ; pas de double négation.

## Accessibilité (cible minimale)

- [ ] **Contraste** texte / fond suffisant pour le corps de texte et les CTA.
- [ ] **Icônes seules** : `aria-label` / libellé équivalent décrit dans la spec.
- [ ] **Ordre de tabulation** logique si clavier ou accessibilité clavier externe.
- [ ] **Animations** : réduction de mouvement prise en compte si animations intrusives.

## Données et confiance

- [ ] **Données sensibles** : ce qui est affiché en public vs masqué (sans exposer de secrets dans le doc).
- [ ] **Synchronisation** : si liste + carte ou multi-vues, règle de vérité et délai de sync indiqués.

## Performance perçue

- [ ] **Premier contenu utile** : ce qui doit apparaître en premier (carte, texte, image).
- [ ] **Dégradation** : hors ligne ou API partielle — que voit-on encore ?

## Légal / produit (NOOK)

- [ ] Cohérence avec **brief** (carte, audio, parcours, compte) quand l’écran touche ces domaines.
- [ ] **Notifications / géoloc** : bénéfice utilisateur explicite si demande de permission sur cet écran.
