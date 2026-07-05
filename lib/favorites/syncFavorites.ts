export {
  bootstrapFavoritePlaces,
  shouldUseServerFavorites,
  type FavoriteBootstrapResult,
} from './bootstrapFavorites';

export {
  createOptimisticPlaceItem,
  emptyPlaceState,
  isPlaceInState,
  placeStateFromItems,
  placeStateFromLocalIds,
  setPlaceFavoriteInState,
  type FavoritePlacesState,
} from './placeStore';

export {
  shouldApplyToggleResult,
  syncPlaceFavoriteWithServer,
  type PlaceFavoriteSyncApi,
  type PlaceFavoriteSyncResult,
} from './syncPlaceFavorite';
