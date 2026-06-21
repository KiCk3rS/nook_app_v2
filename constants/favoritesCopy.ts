/** Microcopy onglet Favoris — MVP. */

export const FAVORITES_COPY = {
  title: 'Favoris',
  emptyTitle: 'Aucun favori pour le moment',
  emptyBody:
    'Ajoutez des lieux ou des parcours en touchant le cœur sur une fiche ou un itinéraire.',
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
