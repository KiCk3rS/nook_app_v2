/** Métadonnées UI connues avant réponse API (mise à jour optimiste). */
export interface PlaceFavoriteHint {
  title?: string;
  imageUrl?: string | null;
}

/** Hint optimiste pour favori itinéraire éditorial (UUID + méta affichables). */
export interface ItineraryFavoriteHint {
  title?: string;
  slug?: string;
  coverImageUrl?: string | null;
}

/** Lieu favori affiché dans la liste (mock ou snippet API). */
export interface FavoritePlaceView {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string | null;
}
