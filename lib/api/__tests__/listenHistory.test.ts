import {
  fetchListenHistory,
  postListenProgress,
} from '../listenHistory';

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

describe('fetchListenHistory', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('construit la pagination', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [],
        total: 0,
        limit: 20,
        offset: 10,
      }),
    ) as typeof fetch;

    await fetchListenHistory({ limit: 20, offset: 10 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/listen-history?limit=20&offset=10',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('postListenProgress', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('envoie audioId, poiId et progressSeconds', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'hist-1',
        audioId: 'audio-1',
        poiId: 'poi-1',
        listenedAt: '2026-07-05T10:00:00.000Z',
        progressSeconds: 45,
        audio: { id: 'audio-1', title: 'Guide' },
        poi: { title: 'Lieu', status: 'PUBLISHED' },
      }, 201),
    ) as typeof fetch;

    await postListenProgress({
      audioId: 'audio-1',
      poiId: 'poi-1',
      progressSeconds: 45,
    });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      audioId: 'audio-1',
      poiId: 'poi-1',
      progressSeconds: 45,
    });
  });
});
