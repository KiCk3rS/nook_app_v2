import {
  clearEditorialItineraryCache,
  fetchEditorialItineraries,
  fetchEditorialItinerary,
  resolveEditorialItinerary,
} from '../editorialItineraries';
import { jsonResponse } from './helpers';

jest.mock('../../config', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  isApiConfigured: jest.fn(() => true),
}));

import { isApiConfigured } from '../../config';

const mockedIsApiConfigured = isApiConfigured as jest.MockedFunction<
  typeof isApiConfigured
>;

const originalFetch = global.fetch;

const listItem = {
  id: 'uuid-itin-1',
  slug: 'itin-paris-highlights',
  citySlug: 'paris',
  districtSlug: null,
  categorySlug: 'highlights',
  title: 'Les incontournables de Paris',
  description: 'Parcours fluide.',
  coverImageUrl: 'https://cdn.example.com/itin.jpg',
  durationMinutes: 180,
  distanceMeters: 5200,
  difficulty: 'EASY',
  stepCount: 3,
  stepPoiIds: ['poi-a', 'poi-b', 'poi-c'],
  isPremium: false,
  priceLabel: null,
  editorialOrder: 1,
};

const detailBody = {
  ...listItem,
  steps: [
    { order: 0, poiId: 'poi-a', title: 'Notre-Dame', lat: 48.853, lng: 2.35 },
    { order: 1, poiId: 'poi-b', title: 'Louvre', lat: 48.861, lng: 2.337 },
    { order: 2, poiId: 'poi-c', title: 'Tour Eiffel', lat: 48.858, lng: 2.294 },
  ],
};

describe('fetchEditorialItineraries', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    clearEditorialItineraryCache();
  });

  it('appelle GET /editorial-itineraries avec citySlug et filtres', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [listItem],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    ) as typeof fetch;

    const page = await fetchEditorialItineraries({
      citySlug: 'paris',
      categorySlug: 'highlights',
      limit: 10,
      offset: 0,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/editorial-itineraries?citySlug=paris&categorySlug=highlights&limit=10&offset=0',
      expect.any(Object),
    );
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.slug).toBe('itin-paris-highlights');
    expect(page.items[0]?.stepCount).toBe(3);
  });

  it('passe districtSlug pour scope quartier', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 20, offset: 0 }),
    ) as typeof fetch;

    await fetchEditorialItineraries({
      citySlug: 'paris',
      districtSlug: 'le-marais',
      categorySlug: 'secrets',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/editorial-itineraries?citySlug=paris&categorySlug=secrets&districtSlug=le-marais&limit=20&offset=0',
      expect.any(Object),
    );
  });
});

describe('fetchEditorialItinerary', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    clearEditorialItineraryCache();
  });

  it('appelle GET /editorial-itineraries/:idOrSlug et mappe steps', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(detailBody),
    ) as typeof fetch;

    const detail = await fetchEditorialItinerary('itin-paris-highlights');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/editorial-itineraries/itin-paris-highlights',
      expect.any(Object),
    );
    expect(detail.steps).toHaveLength(3);
    expect(detail.stepPoiIds).toEqual(['poi-a', 'poi-b', 'poi-c']);
    expect(detail.steps[0]?.title).toBe('Notre-Dame');
  });

  it('réutilise le cache mémoire', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(detailBody),
    ) as typeof fetch;

    await fetchEditorialItinerary('itin-paris-highlights');
    await fetchEditorialItinerary('itin-paris-highlights');
    await fetchEditorialItinerary('uuid-itin-1');

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('resolveEditorialItinerary', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    clearEditorialItineraryCache();
    mockedIsApiConfigured.mockReturnValue(true);
  });

  it('utilise le mock si useMock', async () => {
    global.fetch = jest.fn() as typeof fetch;
    const item = await resolveEditorialItinerary('itin-paris-highlights', {
      useMock: true,
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(item?.title).toContain('incontournables');
  });

  it('fetch API si configurée', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(detailBody),
    ) as typeof fetch;

    const item = await resolveEditorialItinerary('itin-paris-highlights');
    expect(item?.slug).toBe('itin-paris-highlights');
    expect(global.fetch).toHaveBeenCalled();
  });
});
