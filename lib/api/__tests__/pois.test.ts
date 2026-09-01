import { ApiError } from '../../../types/api';
import {
  fetchPoiById,
  fetchPoiChildren,
  fetchPoiHub,
  fetchPois,
  hasValidPoisListFilter,
} from '../pois';

jest.mock('../../config', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  isApiConfigured: jest.fn(() => true),
}));

const originalFetch = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('hasValidPoisListFilter', () => {
  it('rejette une requête sans filtre', () => {
    expect(hasValidPoisListFilter({})).toBe(false);
    expect(hasValidPoisListFilter({ lat: 48.8 })).toBe(false);
  });

  it('accepte q, bbox ou lat+lng+radius', () => {
    expect(hasValidPoisListFilter({ q: 'louvre' })).toBe(true);
    expect(hasValidPoisListFilter({ bbox: '2.2,48.8,2.4,48.9' })).toBe(true);
    expect(
      hasValidPoisListFilter({ lat: 48.8, lng: 2.3, radiusMeters: 1000 }),
    ).toBe(true);
  });
});

describe('fetchPois', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('lève ApiError 422 sans filtre (garde locale)', () => {
    expect(() => fetchPois({ limit: 20 })).toThrow(ApiError);
  });

  it('construit l’URL bbox', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 20, offset: 0 }),
    ) as typeof fetch;

    await fetchPois({
      bbox: '2.22,48.80,2.42,48.90',
      limit: 20,
      offset: 0,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/pois?bbox=2.22%2C48.80%2C2.42%2C48.90&limit=20&offset=0',
      expect.any(Object),
    );
  });

  it('construit l’URL lat+lng+radius', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 10, offset: 0 }),
    ) as typeof fetch;

    await fetchPois({
      lat: 48.8566,
      lng: 2.3522,
      radiusMeters: 1500,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('lat=48.8566'),
      expect.any(Object),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('radiusMeters=1500'),
      expect.any(Object),
    );
  });

  it('construit l’URL recherche q', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [{ id: 'p1', title: 'Louvre', lat: 1, lng: 2, categories: [] }],
        total: 1,
        limit: 50,
        offset: 0,
      }),
    ) as typeof fetch;

    const result = await fetchPois({ q: 'paris', sort: 'relevance', limit: 50 });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=paris'),
      expect.any(Object),
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('propage ApiError serveur', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ statusCode: 422, message: 'Filtre manquant' }, 422),
    ) as typeof fetch;

    await expect(fetchPois({ q: 'x' })).rejects.toBeInstanceOf(ApiError);
  });
});

describe('fetchPoiById', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('ajoute includeAudios=true par défaut', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ id: 'abc', title: 'Test', categories: [], images: [] }),
    ) as typeof fetch;

    await fetchPoiById('abc');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/pois/abc?includeAudios=true'),
      expect.any(Object),
    );
  });
});

describe('fetchPoiChildren', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle /pois/:id/children avec pagination', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 20, offset: 0 }),
    ) as typeof fetch;

    await fetchPoiChildren('parent-id', { limit: 20, offset: 0 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/pois/parent-id/children?limit=20&offset=0',
      expect.any(Object),
    );
  });
});

describe('fetchPoiHub', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle /pois/:id/hub', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'louvre-id',
        name: 'Musée du Louvre',
        subtitle: '4 incontournables',
        citySlug: 'paris',
        cityName: 'Paris',
        coverImage: null,
        map: { center: null, bbox: null, latitudeDelta: 0.06, longitudeDelta: 0.06 },
        stats: { publishedPoiCount: 0, editorialItineraryCount: 0 },
        itineraryCategories: [],
        featuredPremiumItinerary: null,
        mustSeePois: [],
        recommendedPois: [],
        touristPasses: [],
        affiliateExperiences: [],
      }),
    ) as typeof fetch;

    const hub = await fetchPoiHub('louvre-id');
    expect(hub.name).toBe('Musée du Louvre');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/pois/louvre-id/hub',
      expect.any(Object),
    );
  });
});
