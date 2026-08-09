import { ApiError } from '../../../types/api';
import { fetchAudioTranscript } from '../transcripts';

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

describe('fetchAudioTranscript', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retourne les segments typés', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        segments: [
          { id: 'seg-1', startMs: 0, endMs: 1500, text: 'Bonjour.' },
        ],
      }),
    ) as typeof fetch;

    const segments = await fetchAudioTranscript('poi-1', 'audio-1');

    expect(segments).toEqual([
      { id: 'seg-1', startMs: 0, endMs: 1500, text: 'Bonjour.' },
    ]);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/pois/poi-1/audios/audio-1/transcript',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('retourne [] si segments absents', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({}),
    ) as typeof fetch;

    await expect(fetchAudioTranscript('poi-1', 'audio-1')).resolves.toEqual([]);
  });

  it('propage une ApiError', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ message: 'Not found' }, 404),
    ) as typeof fetch;

    await expect(fetchAudioTranscript('poi-1', 'audio-1')).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
