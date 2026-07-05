import {
  addFavorite,
  fetchFavorites,
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

  it('parse la réponse paginée', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: 'fav-1',
            poiId: 'poi-1',
            createdAt: '2026-07-05T10:00:00.000Z',
            poi: { title: 'Tour Eiffel', status: 'PUBLISHED' },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    ) as typeof fetch;

    const result = await fetchFavorites({ limit: 20, offset: 0 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.poi.title).toBe('Tour Eiffel');
    expect(result.total).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/favorites?limit=20&offset=0',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('addFavorite', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('POST /me/favorites avec poiId', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          id: 'fav-1',
          poiId: 'poi-abc',
          createdAt: '2026-07-05T10:00:00.000Z',
          poi: { title: 'Lieu', status: 'PUBLISHED' },
        },
        201,
      ),
    ) as typeof fetch;

    await addFavorite('poi-abc');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/favorites',
      expect.objectContaining({ method: 'POST' }),
    );
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ poiId: 'poi-abc' });
  });
});

describe('removeFavorite', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('DELETE /me/favorites/:poiId', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(null, 204),
    ) as typeof fetch;

    await removeFavorite('poi-xyz');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/favorites/poi-xyz',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
