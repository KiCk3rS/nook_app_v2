/** Microcopy onglet Favoris — MVP. */

export const FAVORITES_COPY = {
  title: 'Favoris',
  emptyTitle: 'Aucun favori pour le moment',
  emptyBody:
    'Enregistrez les lieux et parcours que vous voulez retrouver rapidement — idéal pour préparer une visite ou reprendre plus tard.',
  emptyHowTitle: 'Comment ça marche',
  emptyTipMap: 'Explorez la carte ou un parcours thématique',
  emptyTipHeart: 'Touchez le cœur sur une fiche lieu ou un itinéraire',
  emptyTipHere: 'Retrouvez tout ici, prêt à repartir',
  emptyCtaMap: 'Explorer la carte',
  emptyCtaCity: (city: string) => `Découvrir ${city}`,
  emptySuggestionsTitle: 'Idées à enregistrer',
  emptyAddFavorite: 'Ajouter aux favoris',
  itinerariesSection: 'Parcours',
  placesSection: 'Lieux',
  removePlace: 'Retirer des favoris',
  removeItinerary: 'Retirer des favoris',
  removedPlace: 'Lieu retiré des favoris',
  removedItinerary: 'Parcours retiré des favoris',
  undo: 'Annuler',
  openPlace: (name: string) => `Ouvrir ${name}`,
  openItinerary: (title: string) => `Ouvrir ${title}`,
} as const;

/** Suggestions éditoriales pour l’état vide — MVP Paris. */
export const FAVORITES_EMPTY_SUGGESTIONS = {
  citySlug: 'paris',
  placeIds: ['1', '2'],
  itineraryIds: ['itin-paris-highlights'],
} as const;
