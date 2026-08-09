import { PLACE_IMAGE_PLACEHOLDER } from '../../../constants/placeImages';
import {
  editorialCoverImageUrl,
  editorialItineraryNavKey,
  editorialStepCount,
  mapEditorialItineraryCategoryCounts,
  mapEditorialItineraryDetail,
  mapEditorialItineraryHubSummary,
  mapEditorialItineraryListItem,
} from '../editorialItineraries';

describe('editorialItinerary helpers', () => {
  it('prefer slug pour la clé de navigation', () => {
    expect(
      editorialItineraryNavKey({ id: 'uuid-1', slug: 'itin-paris-premium' }),
    ).toBe('itin-paris-premium');
    expect(editorialItineraryNavKey({ id: 'uuid-1', slug: '' })).toBe('uuid-1');
  });

  it('couverture : placeholder si null/vide', () => {
    expect(editorialCoverImageUrl(null)).toBe(PLACE_IMAGE_PLACEHOLDER);
    expect(editorialCoverImageUrl('  ')).toBe(PLACE_IMAGE_PLACEHOLDER);
    expect(editorialCoverImageUrl('https://cdn.example.com/a.jpg')).toBe(
      'https://cdn.example.com/a.jpg',
    );
  });

  it('stepCount privilégie le champ API', () => {
    expect(
      editorialStepCount({ stepCount: 5, stepPoiIds: ['a', 'b'] }),
    ).toBe(5);
    expect(editorialStepCount({ stepCount: 0, stepPoiIds: ['a'] })).toBe(0);
  });
});

describe('mapEditorialItineraryCategoryCounts', () => {
  it('construit un Record slug → count', () => {
    expect(
      mapEditorialItineraryCategoryCounts([
        { slug: 'highlights', itineraryCount: 2 },
        { slug: 'secrets', itineraryCount: 1 },
      ]),
    ).toEqual({ highlights: 2, secrets: 1 });
  });

  it('ignore entrées invalides', () => {
    expect(mapEditorialItineraryCategoryCounts([{ slug: '', itineraryCount: 3 }])).toEqual(
      {},
    );
    expect(mapEditorialItineraryCategoryCounts(null)).toEqual({});
  });
});

describe('mapEditorialItineraryHubSummary', () => {
  it('mappe un résumé hub en EditorialItinerary', () => {
    const mapped = mapEditorialItineraryHubSummary(
      {
        id: 'uuid-p',
        slug: 'itin-paris-premium',
        title: 'Paris by Night',
        coverImageUrl: null,
        durationMinutes: 210,
        distanceMeters: 5500,
        difficulty: 'MEDIUM',
        isPremium: true,
        priceLabel: '4,99 €',
        categorySlug: 'evening',
      },
      'paris',
    );
    expect(mapped).toMatchObject({
      id: 'uuid-p',
      slug: 'itin-paris-premium',
      citySlug: 'paris',
      isPremium: true,
      priceLabel: '4,99 €',
      coverImageUrl: null,
      stepPoiIds: [],
    });
  });

  it('retourne null si résumé absent', () => {
    expect(mapEditorialItineraryHubSummary(null, 'paris')).toBeNull();
  });
});

describe('mapEditorialItineraryListItem / detail', () => {
  const listRaw = {
    id: 'uuid-1',
    slug: 'itin-paris-highlights',
    citySlug: 'paris',
    districtSlug: null,
    categorySlug: 'highlights',
    title: 'Incontournables',
    description: 'Desc',
    coverImageUrl: 'https://cdn.example.com/x.jpg',
    durationMinutes: 180,
    distanceMeters: 5200,
    difficulty: 'EASY',
    stepCount: 2,
    stepPoiIds: ['a', 'b'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  };

  it('mappe un item liste', () => {
    expect(mapEditorialItineraryListItem(listRaw)).toMatchObject({
      slug: 'itin-paris-highlights',
      stepCount: 2,
      stepPoiIds: ['a', 'b'],
    });
  });

  it('dérive stepPoiIds depuis steps au détail', () => {
    const detail = mapEditorialItineraryDetail({
      ...listRaw,
      steps: [
        { order: 1, poiId: 'b', title: 'B', lat: 1, lng: 2 },
        { order: 0, poiId: 'a', title: 'A', lat: null, lng: null },
      ],
    });
    expect(detail?.steps.map((s) => s.poiId)).toEqual(['a', 'b']);
    expect(detail?.stepPoiIds).toEqual(['a', 'b']);
    expect(detail?.stepCount).toBe(2);
  });
});
