import {
  buildDiscoveryLoadMoreQuery,
  DISCOVERY_PAGE_SIZE,
  fetchDiscoveryLatest,
  fetchDiscoveryPopular,
  fetchDiscoveryTopRated,
} from '../discovery';

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

const sampleItem = {
  id: 'poi-1',
  title: 'Tour Eiffel',
  parentPoiId: null,
  lat: 48.8584,
  lng: 2.2945,
  categories: [{ slug: 'monument', label: 'Monument' }],
  publishedAt: '2026-07-01T10:00:00.000Z',
  popularity: {
    averageRating: 4.5,
    reviewCount: 12,
    playCountLast7Days: 320,
    playCountTotal: 1200,
  },
  coverImage: {
    id: 'img-1',
    url: 'https://cdn.example.com/cover.jpg',
    expiresAt: '2026-07-05T18:00:00.000Z',
    altText: 'Tour Eiffel',
  },
};

describe('fetchDiscoveryLatest', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle /discovery/latest avec pagination', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [sampleItem],
        total: 42,
        limit: 10,
        offset: 0,
      }),
    ) as typeof fetch;

    const response = await fetchDiscoveryLatest({ limit: 10, offset: 0 });

    expect(response.items).toHaveLength(1);
    expect(response.items[0]?.id).toBe('poi-1');
    expect(response.total).toBe(42);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/discovery/latest?limit=10&offset=0',
      expect.any(Object),
    );
  });
});

describe('fetchDiscoveryPopular', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle /discovery/popular', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 10, offset: 0 }),
    ) as typeof fetch;

    await fetchDiscoveryPopular({ limit: 10, offset: 20 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/discovery/popular?limit=10&offset=20',
      expect.any(Object),
    );
  });
});

describe('fetchDiscoveryTopRated', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle /discovery/top-rated', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ items: [], total: 0, limit: 10, offset: 0 }),
    ) as typeof fetch;

    await fetchDiscoveryTopRated();

    expect(global.fetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/v1/discovery/top-rated?limit=${DISCOVERY_PAGE_SIZE}&offset=0`,
      expect.any(Object),
    );
  });
});

describe('buildDiscoveryLoadMoreQuery', () => {
  it('retourne offset + limit quand il reste des items', () => {
    expect(
      buildDiscoveryLoadMoreQuery({ items: [], total: 30, limit: 10, offset: 0 }),
    ).toEqual({ limit: 10, offset: 10 });
  });

  it('retourne null quand tout est chargé', () => {
    expect(
      buildDiscoveryLoadMoreQuery({ items: [], total: 20, limit: 10, offset: 10 }),
    ).toBeNull();
  });
});
