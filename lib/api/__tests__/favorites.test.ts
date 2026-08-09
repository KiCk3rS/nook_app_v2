import {
  addEditorialItineraryFavorite,
  addFavorite,
  fetchFavorites,
  partitionFavoriteItems,
  removeFavorite,
} from '../favorites';

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

describe('fetchFavorites', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parse la réponse paginée discriminée (envelope target)', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [
          {
            targetType: 'poi',
            id: 'poi-1',
            createdAt: '2026-07-05T10:00:00.000Z',
            target: { id: 'poi-1', title: 'Tour Eiffel', status: 'PUBLISHED' },
          },
          {
            targetType: 'editorial_itinerary',
            id: 'ei-1',
            createdAt: '2026-07-05T09:00:00.000Z',
            target: {
              id: 'ei-1',
              slug: 'balade',
              title: 'Balade',
              coverImageUrl: null,
            },
          },
        ],
        total: 2,
        limit: 20,
        offset: 0,
      }),
    ) as typeof fetch;

    const result = await fetchFavorites({ limit: 20, offset: 0 });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      targetType: 'poi',
      id: 'poi-1',
      target: { title: 'Tour Eiffel' },
    });
    expect(result.items[1]).toMatchObject({
      targetType: 'editorial_itinerary',
      id: 'ei-1',
      target: { slug: 'balade' },
    });
    expect(result.total).toBe(2);
  });
});

describe('addFavorite', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('POST /me/favorites avec targetType/targetId', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          targetType: 'poi',
          id: 'poi-abc',
          createdAt: '2026-07-05T10:00:00.000Z',
          target: { id: 'poi-abc', title: 'Lieu', status: 'PUBLISHED' },
        },
        201,
      ),
    ) as typeof fetch;

    await addFavorite('poi-abc');

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      targetType: 'poi',
      targetId: 'poi-abc',
    });
  });
});

describe('addEditorialItineraryFavorite', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('POST /me/favorites editorial_itinerary', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          targetType: 'editorial_itinerary',
          id: 'ei-abc',
          createdAt: '2026-07-05T10:00:00.000Z',
          target: {
            id: 'ei-abc',
            slug: 'balade',
            title: 'Balade',
            coverImageUrl: null,
          },
        },
        201,
      ),
    ) as typeof fetch;

    await addEditorialItineraryFavorite('ei-abc');

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({
      targetType: 'editorial_itinerary',
      targetId: 'ei-abc',
    });
  });
});

describe('removeFavorite', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('DELETE /me/favorites/:targetType/:targetId', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(null, 204)) as typeof fetch;

    await removeFavorite('poi', 'poi-xyz');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/favorites/poi/poi-xyz',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

describe('partitionFavoriteItems', () => {
  it('sépare POI et éditoriaux (items complets)', () => {
    const { places, editorials } = partitionFavoriteItems([
      {
        targetType: 'poi',
        id: 'p1',
        createdAt: '2026-07-05T10:00:00.000Z',
        target: { id: 'p1', title: 'A', status: 'PUBLISHED' },
      },
      {
        targetType: 'editorial_itinerary',
        id: 'ei1',
        createdAt: '2026-07-05T09:00:00.000Z',
        target: {
          id: 'ei1',
          slug: 'balade',
          title: 'Balade',
          coverImageUrl: null,
        },
      },
    ]);

    expect(places.map((p) => p.id)).toEqual(['p1']);
    expect(editorials.map((e) => e.id)).toEqual(['ei1']);
    expect(editorials[0]?.target.slug).toBe('balade');
  });
});
