import {
  fetchCities,
  fetchPopularCities,
  fetchPromotedCities,
  searchCities,
} from '../cities';
import { jsonResponse } from './helpers';

jest.mock('../../config', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  isApiConfigured: jest.fn(() => true),
}));

const originalFetch = global.fetch;

const sampleCity = {
  id: 'city-paris',
  slug: 'paris',
  name: 'Paris',
  subtitle: '9 guides audio · 5 parcours',
  coverImage: {
    id: 'img-1',
    url: 'https://cdn.example.com/paris.jpg',
    expiresAt: '2026-08-10T00:00:00.000Z',
    altText: 'Paris',
  },
  stats: {
    publishedPoiCount: 9,
    editorialItineraryCount: 5,
    districtHubCount: 0,
  },
  isPromoted: true,
};

describe('fetchCities', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle GET /cities avec query', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [sampleCity],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    ) as typeof fetch;

    const result = await fetchCities({ q: 'par', limit: 10, offset: 0 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/cities?q=par&limit=10&offset=0',
      expect.any(Object),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.slug).toBe('paris');
  });
});

describe('fetchPromotedCities / fetchPopularCities / searchCities', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetchPromotedCities passe promoted=true', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [sampleCity],
        total: 1,
        limit: 5,
        offset: 0,
      }),
    ) as typeof fetch;

    const items = await fetchPromotedCities(5);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/cities?promoted=true&limit=5&offset=0',
      expect.any(Object),
    );
    expect(items).toHaveLength(1);
  });

  it('fetchPopularCities passe popular=true', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [sampleCity],
        total: 1,
        limit: 10,
        offset: 0,
      }),
    ) as typeof fetch;

    const items = await fetchPopularCities(10);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/cities?popular=true&limit=10&offset=0',
      expect.any(Object),
    );
    expect(items[0]?.name).toBe('Paris');
  });

  it('searchCities ignore q vide', async () => {
    global.fetch = jest.fn() as typeof fetch;
    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('searchCities appelle q', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [sampleCity],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    ) as typeof fetch;

    const items = await searchCities('paris');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/cities?q=paris&limit=20&offset=0',
      expect.any(Object),
    );
    expect(items[0]?.id).toBe('city-paris');
  });
});
