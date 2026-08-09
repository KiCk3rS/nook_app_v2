import {
  buildItinerariesLoadMoreQuery,
  mapItineraryDetailResponse,
  resolveCoverImageUrl,
  stepsToCoordinates,
} from '../itineraries';

describe('mapItineraryDetailResponse', () => {
  it('trie steps par order et dérive poiIds', () => {
    const detail = mapItineraryDetailResponse({
      id: 'it-1',
      title: 'Balade',
      estimatedDurationMinutes: 60,
      distanceMeters: 2000,
      difficulty: 'MEDIUM',
      steps: [
        { order: 2, poiId: 'poi-c', title: 'C', lat: 48.86, lng: 2.35 },
        { order: 0, poiId: 'poi-a', title: 'A', lat: 48.85, lng: 2.34 },
        { order: 1, poiId: 'poi-b', title: 'B', lat: null, lng: null },
      ],
      createdAt: '2026-07-05T10:00:00.000Z',
      updatedAt: '2026-07-05T10:00:00.000Z',
    });

    expect(detail.stepCount).toBe(3);
    expect(detail.poiIds).toEqual(['poi-a', 'poi-b', 'poi-c']);
    expect(detail.steps.map((s) => s.order)).toEqual([0, 1, 2]);
  });
});

describe('resolveCoverImageUrl', () => {
  it('retourne coverImageUrl trimée si présente', () => {
    expect(
      resolveCoverImageUrl({ coverImageUrl: '  https://cdn.example.com/c.jpg  ' }),
    ).toBe('https://cdn.example.com/c.jpg');
  });

  it('retourne undefined sans cover (placeholder UI, pas mock)', () => {
    expect(resolveCoverImageUrl({})).toBeUndefined();
    expect(resolveCoverImageUrl({ coverImageUrl: null })).toBeUndefined();
    expect(resolveCoverImageUrl({ coverImageUrl: '   ' })).toBeUndefined();
  });
});

describe('buildItinerariesLoadMoreQuery', () => {
  it('retourne la page suivante ou null si tout est chargé', () => {
    expect(
      buildItinerariesLoadMoreQuery({ offset: 0, limit: 20, total: 25 }),
    ).toEqual({ limit: 20, offset: 20 });
    expect(
      buildItinerariesLoadMoreQuery({ offset: 20, limit: 20, total: 25 }),
    ).toBeNull();
    expect(
      buildItinerariesLoadMoreQuery({ offset: 20, limit: 20, total: 20 }),
    ).toBeNull();
  });
});

describe('stepsToCoordinates', () => {
  it('respecte l’ordre et ignore les étapes sans coords', () => {
    const coords = stepsToCoordinates([
      { order: 1, poiId: 'b', title: 'B', lat: 48.86, lng: 2.35 },
      { order: 0, poiId: 'a', title: 'A', lat: 48.85, lng: 2.34 },
      { order: 2, poiId: 'c', title: 'C', lat: null, lng: null },
    ]);

    expect(coords).toEqual([
      { latitude: 48.85, longitude: 2.34 },
      { latitude: 48.86, longitude: 2.35 },
    ]);
  });
});
