import { getMockListenHistory } from './mockListenHistory';

export const MOCK_PROFILE_INSIGHTS = {
  listenCount: 24,
  citiesCount: 2,
  memberSinceLabel: 'Explorateur depuis mars 2025',
};

export function getMockRecentListenPlaces() {
  return getMockListenHistory().slice(0, 3).map((item) => ({
    placeId: item.placeId,
    name: item.placeName,
    imageUrl: item.imageUrl,
    durationLabel: item.durationLabel ?? undefined,
    listenedAtLabel: item.listenedAtLabel,
  }));
}
