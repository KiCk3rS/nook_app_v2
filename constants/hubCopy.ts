/** Microcopy hub ville A4.3 — MVP. */

export const HUB_COPY = {
  mapCta: 'Voir sur la carte',
  categoriesSection: 'Explorer par thème',
  premiumSection: 'Coup de cœur premium',
  premiumBadge: 'Premium',
  mustSeeSection: 'Incontournables',
  recommendedSection: 'Recommandé pour vous',
  popularFallback: (city: string) => `Populaire à ${city}`,
  touristPassesSection: 'Pass touristiques',
  touristPassFooter: (partner: string) => `Achat sur ${partner}`,
  experiencesSection: 'Expériences et activités',
  partnerBadge: 'Partenaire',
  experienceFooter: (partner: string) => `Réservation sur ${partner}`,
  externalTitle: 'Quitter NOOK',
  externalBody: (partner: string) =>
    `Vous allez être redirigé vers ${partner} pour poursuivre.`,
  externalContinue: 'Continuer',
  externalCancel: 'Annuler',
  cityNotFoundTitle: 'Destination introuvable',
  cityNotFoundBody: 'Cette destination n’existe pas ou n’est plus disponible.',
  emptyCategory: 'De nouveaux parcours arrivent bientôt.',
  back: 'Retour',
  shareMessage: (city: string) => `Découvrez ${city} sur NOOK`,
} as const;

export const PAYWALL_COPY = {
  title: 'Débloquer ce parcours',
  subscriptionTitle: 'Accès premium NOOK',
  benefit1: 'Guides audio à chaque étape',
  benefit2: 'Parcours curatés par nos experts',
  benefit3: 'Tous les parcours premium inclus',
  buyCta: (price: string) => `Acheter — ${price}`,
  subscribeCta: (price: string) => `S’abonner — ${price}/mois`,
  restore: 'Restaurer mes achats',
  success: 'Parcours débloqué',
  close: 'Fermer',
  unitLabel: 'Accès permanent à ce parcours',
  subscriptionLabel: 'Tous les parcours premium',
  bestValue: 'Meilleure valeur',
} as const;

export const ITINERARY_COPY = {
  stepsSection: 'Étapes',
  startCta: 'Démarrer le parcours',
  unlockCta: 'Débloquer ce parcours',
  saveCta: 'Enregistrer dans mes parcours',
  saveSuccess: 'Parcours ajouté à votre liste',
  mapCta: 'Voir sur la carte',
  lockedStep: 'Étape verrouillée',
  notFoundTitle: 'Parcours introuvable',
  notFoundBody: 'Ce parcours n’existe pas ou n’est plus disponible.',
  stepMeta: (duration: string, steps: number) => `${duration} · ${steps} étapes`,
} as const;
