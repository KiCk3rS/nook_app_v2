import { getCategoryLabel, getPlaceById, type MockPlace } from '../../constants/mockPlaces';
import type { FavoriteItem } from '../../types/api';
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

export function favoriteItemToPlaceView(item: FavoriteItem): FavoritePlaceView {
  const mock = getPlaceById(item.poiId);
  if (mock) {
    return mockPlaceToFavoritePlaceView(mock);
  }

  return {
    id: item.poiId,
    name: item.poi.title,
    subtitle: formatPoiStatus(item.poi.status),
    imageUrl: null,
  };
}

export function resolveFavoritePlaceViews(
  placeIds: readonly string[],
  apiItems: ReadonlyMap<string, FavoriteItem>,
): FavoritePlaceView[] {
  return placeIds.map((id) => {
    const apiItem = apiItems.get(id);
    if (apiItem) return favoriteItemToPlaceView(apiItem);
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
