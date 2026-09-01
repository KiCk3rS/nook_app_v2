import { ApiError } from '../../../types/api';
import { setMemoryAccessToken } from '../client';
import { searchWikipedia, searchWikipediaNearby } from '../adminWikipedia';

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

describe('searchWikipedia', () => {
  beforeEach(() => {
    setMemoryAccessToken('test-admin-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMemoryAccessToken(null);
  });

  it('construit la query string q/lang/limit', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ items: [] }),
    ) as typeof fetch;

    await searchWikipedia({ q: 'eiffel', lang: 'fr', limit: 10 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/wikipedia/search?q=eiffel&lang=fr&limit=10',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
        }),
      }),
    );
  });

  it('parse les items', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [
          {
            title: 'Tour Eiffel',
            wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
            description: 'Monument',
            thumbnailUrl: null,
          },
        ],
      }),
    ) as typeof fetch;

    const result = await searchWikipedia({ q: 'eiffel' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe('Tour Eiffel');
    expect(result.items[0]?.wikipediaUrl).toContain('Tour_Eiffel');
  });

  it('propage ApiError 403', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Forbidden' }, 403),
    ) as typeof fetch;

    await expect(searchWikipedia({ q: 'eiffel' })).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 403,
    } satisfies Partial<ApiError>);
  });

  it('propage ApiError 422', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Validation failed' }, 422),
    ) as typeof fetch;

    await expect(searchWikipedia({ q: 'e' })).rejects.toBeInstanceOf(ApiError);
  });

  it('propage ApiError 401', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Unauthorized' }, 401),
    ) as typeof fetch;

    await expect(searchWikipedia({ q: 'eiffel' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe('searchWikipediaNearby', () => {
  beforeEach(() => {
    setMemoryAccessToken('test-admin-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMemoryAccessToken(null);
  });

  it('construit la query string lat/lng/radiusMeters', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        anchor: {
          lat: 48.8584,
          lng: 2.2945,
          label: null,
          radiusMeters: 300,
        },
        items: [],
        existingNearbyPois: [],
      }),
    ) as typeof fetch;

    await searchWikipediaNearby({
      lat: 48.8584,
      lng: 2.2945,
      radiusMeters: 300,
      lang: 'fr',
      limit: 10,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/wikipedia/nearby?lat=48.8584&lng=2.2945&radiusMeters=300&lang=fr&limit=10',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
        }),
      }),
    );
  });
});
