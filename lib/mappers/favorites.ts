import { getPlaceById, getCategoryLabel, type MockPlace } from '../../constants/mockPlaces';
import { getItineraryById } from '../../constants/mockItineraries';
import type {
  EditorialItinerary,
  FavoriteEditorialItineraryItem,
  FavoritePoiItem,
} from '../../types/api';
import type { FavoriteItinerariesState } from '../favorites/itineraryStore';
import type { FavoritePlacesState } from '../favorites/placeStore';
import type { FavoritePlaceView } from '../../types/favorites';

function formatPoiStatus(status: string): string {
  if (status === 'PUBLISHED') return '';
  return status;
}

export function mockPlaceToFavoritePlaceView(place: MockPlace): FavoritePlaceView {
  return {
    id: place.id,
    name: place.name,
    subtitle: getCategoryLabel(place.categoryId),
    imageUrl: place.imageUrl,
  };
}

/** Vue favori depuis le snippet API uniquement (pas d’enrichissement mock silencieux). */
export function favoriteItemToPlaceView(item: FavoritePoiItem): FavoritePlaceView {
  const name = item.target.title?.trim() || item.id;

  return {
    id: item.id,
    name,
    subtitle: formatPoiStatus(item.target.status),
    imageUrl: null,
  };
}

export function resolveFavoritePlaceViews(state: FavoritePlacesState): FavoritePlaceView[] {
  return state.order.map((id) => {
    const apiItem = state.items.get(id);
    if (apiItem) return favoriteItemToPlaceView(apiItem);
    // Fallback mock uniquement pour IDs locaux sans item API (démo / offline).
    const mock = getPlaceById(id);
    if (mock) return mockPlaceToFavoritePlaceView(mock);
    return {
      id,
      name: id,
      subtitle: '',
      imageUrl: null,
    };
  });
}

/** Itinéraire léger pour l’UI favoris à partir de l’envelope serveur. */
export function favoriteEditorialToItinerary(
  item: FavoriteEditorialItineraryItem,
): EditorialItinerary {
  const mock = getItineraryById(item.id) ?? getItineraryById(item.target.slug);
  if (mock) {
    return {
      ...mock,
      id: item.id,
      slug: item.target.slug || mock.slug,
      title: item.target.title || mock.title,
      coverImageUrl:
        item.target.coverImageUrl !== undefined
          ? item.target.coverImageUrl
          : mock.coverImageUrl,
    };
  }

  return {
    id: item.id,
    slug: item.target.slug || item.id,
    citySlug: '',
    districtSlug: null,
    categorySlug: '',
    title: item.target.title || item.id,
    description: '',
    coverImageUrl: item.target.coverImageUrl,
    durationMinutes: 0,
    distanceMeters: 0,
    difficulty: 'EASY',
    stepCount: 0,
    stepPoiIds: [],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 0,
  };
}

export function resolveFavoriteItineraries(
  state: FavoriteItinerariesState,
): EditorialItinerary[] {
  return state.order
    .map((id) => {
      const apiItem = state.items.get(id);
      if (apiItem) return favoriteEditorialToItinerary(apiItem);
      return getItineraryById(id) ?? null;
    })
    .filter((item): item is EditorialItinerary => item != null);
}
