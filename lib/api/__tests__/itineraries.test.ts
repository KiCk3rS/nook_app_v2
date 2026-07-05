import {
  createItinerary,
  deleteItinerary,
  fetchItineraries,
  fetchItineraryById,
  ITINERARIES_PAGE_SIZE,
  patchItinerary,
} from '../itineraries';

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

function emptyResponse(status = 204): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    text: async () => '',
  } as Response;
}

const detailBody = {
  id: 'it-1',
  title: 'Balade',
  estimatedDurationMinutes: 90,
  distanceMeters: 3000,
  difficulty: 'MEDIUM',
  steps: [
    { order: 0, poiId: 'poi-a', title: 'Tour Eiffel', lat: 48.858, lng: 2.294 },
    { order: 1, poiId: 'poi-b', title: 'Louvre', lat: 48.861, lng: 2.337 },
  ],
  createdAt: '2026-07-05T10:00:00.000Z',
  updatedAt: '2026-07-05T10:00:00.000Z',
};

describe('fetchItineraries', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('extrait items depuis la réponse paginée', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [{ id: 'it-1', title: 'Balade', stepCount: 2, difficulty: 'MEDIUM' }],
        total: 1,
        limit: 20,
        offset: 0,
      }),
    ) as typeof fetch;

    const page = await fetchItineraries();

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/v1/itineraries?limit=${ITINERARIES_PAGE_SIZE}&offset=0`,
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('fetchItineraryById', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('mappe steps[] ordonnés et poiIds dérivés', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(detailBody)) as typeof fetch;

    const detail = await fetchItineraryById('it-1');

    expect(detail.poiIds).toEqual(['poi-a', 'poi-b']);
    expect(detail.steps[0]).toMatchObject({
      order: 0,
      poiId: 'poi-a',
      lat: 48.858,
      lng: 2.294,
    });
  });
});

describe('createItinerary', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('sérialise poiIds et difficulty', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(detailBody, 201)) as typeof fetch;

    await createItinerary({
      title: 'Balade',
      poiIds: ['poi-a', 'poi-b'],
      difficulty: 'MEDIUM',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/itineraries',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          title: 'Balade',
          poiIds: ['poi-a', 'poi-b'],
          difficulty: 'MEDIUM',
        }),
      }),
    );
  });
});

describe('patchItinerary', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('envoie PATCH partiel', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(detailBody)) as typeof fetch;

    await patchItinerary('it-1', { title: 'Nouveau titre' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/itineraries/it-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: 'Nouveau titre' }),
      }),
    );
  });
});

describe('deleteItinerary', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('gère une réponse 204 vide', async () => {
    global.fetch = jest.fn().mockResolvedValue(emptyResponse(204)) as typeof fetch;

    await expect(deleteItinerary('it-1')).resolves.toBeUndefined();
  });
});
