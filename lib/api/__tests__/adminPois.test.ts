import { ApiError } from '../../../types/api';
import { setMemoryAccessToken } from '../client';
import { createPoiFromWikipedia } from '../adminPois';

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

const createdPoi = {
  id: 'poi-1',
  title: 'Tour Eiffel',
  description: 'Monument parisien',
  status: 'DRAFT',
  publishedAt: null,
  parentPoiId: null,
  lat: 48.8584,
  lng: 2.2945,
  wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
  categories: [],
  images: [],
  createdAt: '2026-08-09T10:00:00.000Z',
  updatedAt: '2026-08-09T10:00:00.000Z',
};

describe('createPoiFromWikipedia', () => {
  beforeEach(() => {
    setMemoryAccessToken('test-admin-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMemoryAccessToken(null);
  });

  it('POST le payload et parse la réponse', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(createdPoi, 201),
    ) as typeof fetch;

    const result = await createPoiFromWikipedia({
      wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
      status: 'DRAFT',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/pois/from-wikipedia',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
          status: 'DRAFT',
        }),
      }),
    );
    expect(result.id).toBe('poi-1');
    expect(result.wikipediaUrl).toContain('Tour_Eiffel');
  });

  it('propage ApiError 403', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Forbidden' }, 403),
    ) as typeof fetch;

    await expect(
      createPoiFromWikipedia({
        wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('propage ApiError 422', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Invalid wikipedia URL' }, 422),
    ) as typeof fetch;

    await expect(
      createPoiFromWikipedia({ wikipediaUrl: 'https://example.com/x' }),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('propage ApiError 401', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Unauthorized' }, 401),
    ) as typeof fetch;

    await expect(
      createPoiFromWikipedia({
        wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
