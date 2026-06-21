import { getPlaceById } from './mockPlaces';

export const MOCK_PROFILE_INSIGHTS = {
  listenCount: 24,
  citiesCount: 2,
  memberSinceLabel: 'Explorateur depuis mars 2025',
};

export interface MockRecentListen {
  placeId: string;
  listenedAtLabel: string;
}

export const MOCK_RECENT_LISTENS: MockRecentListen[] = [
  { placeId: '1', listenedAtLabel: 'Hier' },
  { placeId: '2', listenedAtLabel: 'Il y a 3 jours' },
  { placeId: '4', listenedAtLabel: 'La semaine dernière' },
];

export function getMockRecentListenPlaces() {
  return MOCK_RECENT_LISTENS.map((item) => {
    const place = getPlaceById(item.placeId);
    if (!place) return null;
    const guide = place.audioGuides.find((g) => g.status === 'ready');
    return {
      placeId: place.id,
      name: place.name,
      imageUrl: place.imageUrl,
      durationLabel: guide?.durationSec
        ? `${Math.round(guide.durationSec / 60)} min`
        : undefined,
      listenedAtLabel: item.listenedAtLabel,
    };
  }).filter((item): item is NonNullable<typeof item> => item != null);
}
