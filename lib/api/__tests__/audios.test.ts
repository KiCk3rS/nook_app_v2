import { ApiError } from '../../../types/api';
import {
  fetchAudiosForPoi,
  fetchPlaybackUrl,
  postPlayEvent,
} from '../audios';

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

describe('fetchAudiosForPoi', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parse { audios: [...] }', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        audios: [
          {
            id: 'audio-1',
            title: 'Guide',
            language: 'fr',
            durationSeconds: 120,
            sortOrder: 0,
            sourceType: 'WIKIPEDIA',
            attribution: 'NOOK',
            mimeType: 'audio/mpeg',
            audienceCategories: [],
          },
        ],
      }),
    ) as typeof fetch;

    const audios = await fetchAudiosForPoi('poi-1');

    expect(audios).toHaveLength(1);
    expect(audios[0]?.id).toBe('audio-1');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/pois/poi-1/audios',
      expect.any(Object),
    );
  });
});

describe('fetchPlaybackUrl', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parse { playbackUrl, expiresAt }', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        playbackUrl: 'https://cdn.example.com/guide.mp3?sig=abc',
        expiresAt: '2026-07-05T12:00:00.000Z',
      }),
    ) as typeof fetch;

    const playback = await fetchPlaybackUrl('poi-1', 'audio-1');

    expect(playback.playbackUrl).toContain('guide.mp3');
    expect(playback.expiresAt).toBe('2026-07-05T12:00:00.000Z');
  });

  it('propage une ApiError 503', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Media unavailable' }, 503),
    ) as typeof fetch;

    await expect(fetchPlaybackUrl('poi-1', 'audio-1')).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

describe('postPlayEvent', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('envoie un corps minimal avec listenPercent', async () => {
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(null, 204)) as typeof fetch;

    await postPlayEvent('poi-1', {
      audioId: 'audio-1',
      listenPercent: 82,
      clientEventId: 'evt-1',
    });

    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      audioId: 'audio-1',
      listenPercent: 82,
      clientEventId: 'evt-1',
    });
  });
});
