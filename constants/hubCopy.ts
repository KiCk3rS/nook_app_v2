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
  districtNotFoundTitle: 'Quartier introuvable',
  districtNotFoundBody: 'Ce quartier n’existe pas ou n’est plus disponible.',
  parentCityLink: (city: string) => `Quartier à ${city}`,
  districtPopularFallback: (district: string) => `Populaire dans ${district}`,
  emptyCategory: 'De nouveaux parcours arrivent bientôt.',
  back: 'Retour',
  shareMessage: (name: string) => `Découvrez ${name} sur NOOK`,
  districtShareMessage: (district: string, city: string) =>
    `Découvrez ${district} à ${city} sur NOOK`,
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
  mapCta: 'Voir sur la carte',
  mapModeKicker: 'Parcours sur la carte',
  mapModeOpenDetail: 'Voir le détail du parcours',
  mapModeClose: 'Quitter la vue parcours',
  mapModeStep: (current: number, total: number, name: string) =>
    `Étape ${current} sur ${total} — ${name}`,
  lockedStep: 'Étape verrouillée',
  notFoundTitle: 'Parcours introuvable',
  notFoundBody: 'Ce parcours n’existe pas ou n’est plus disponible.',
  stepMeta: (duration: string, steps: number) => `${duration} · ${steps} étapes`,
} as const;
