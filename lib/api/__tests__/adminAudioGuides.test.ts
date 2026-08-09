import { AudioGuideGenerationError } from '../../../types/audioGuideCreation';
import { setMemoryAccessToken } from '../client';
import {
  generateAdminAudioGuide,
  generateAdminAudioGuideAndAwaitJob,
  getAdminAudioGuideJob,
  inferLanguageFromWikipediaUrl,
  mapAdminAudioGuideJobStatus,
  retryAdminAudioGuideJob,
} from '../adminAudioGuides';

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

describe('mapAdminAudioGuideJobStatus', () => {
  it('mappe COMPLETED → ready et FAILED → error', () => {
    expect(mapAdminAudioGuideJobStatus('COMPLETED')).toBe('ready');
    expect(mapAdminAudioGuideJobStatus('FAILED')).toBe('error');
  });

  it('mappe les étapes intermédiaires → pending', () => {
    expect(mapAdminAudioGuideJobStatus('PENDING')).toBe('pending');
    expect(mapAdminAudioGuideJobStatus('SCRIPTING')).toBe('pending');
    expect(mapAdminAudioGuideJobStatus('SYNTHESIZING')).toBe('pending');
  });
});

describe('inferLanguageFromWikipediaUrl', () => {
  it('extrait la langue du host Wikipedia', () => {
    expect(
      inferLanguageFromWikipediaUrl('https://fr.wikipedia.org/wiki/Tour_Eiffel'),
    ).toBe('fr');
    expect(
      inferLanguageFromWikipediaUrl('https://en.wikipedia.org/wiki/Eiffel_Tower'),
    ).toBe('en');
  });

  it('retourne undefined pour une URL invalide', () => {
    expect(inferLanguageFromWikipediaUrl('not-a-url')).toBeUndefined();
  });
});

describe('generateAdminAudioGuide', () => {
  beforeEach(() => {
    setMemoryAccessToken('test-admin-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMemoryAccessToken(null);
  });

  it('POST /admin/pois/:poiId/audio-guides/generate avec body et accepte 202', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ jobId: 'job-admin-1' }, 202),
    ) as typeof fetch;

    const response = await generateAdminAudioGuide('poi-1', {
      wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
      language: 'fr',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/pois/poi-1/audio-guides/generate',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer /),
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
          language: 'fr',
        }),
      }),
    );
    expect(response.jobId).toBe('job-admin-1');
  });

  it('ne passe pas par /me/credits', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ jobId: 'job-admin-1' }, 202),
    ) as typeof fetch;

    await generateAdminAudioGuide('poi-1', {
      wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
    });

    const urls = (global.fetch as jest.Mock).mock.calls.map(
      (call: unknown[]) => String(call[0]),
    );
    expect(urls.every((url) => !url.includes('/me/credits'))).toBe(true);
  });
});

describe('getAdminAudioGuideJob', () => {
  beforeEach(() => {
    setMemoryAccessToken('test-admin-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMemoryAccessToken(null);
  });

  it('GET /admin/audio-guides/jobs/:jobId et normalise le statut', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'job-1',
        status: 'COMPLETED',
        poiId: 'poi-1',
        sourceUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
        language: 'fr',
        targetDurationMinutes: 4,
        audioId: 'audio-1',
        errorMessage: null,
      }),
    ) as typeof fetch;

    const job = await getAdminAudioGuideJob('job-1');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/audio-guides/jobs/job-1',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(job).toEqual({
      id: 'job-1',
      status: 'ready',
      guideId: 'audio-1',
      errorMessage: null,
    });
  });

  it('mappe audioId null vers guideId null', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'job-1',
        status: 'FAILED',
        poiId: 'poi-1',
        sourceUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
        language: 'fr',
        targetDurationMinutes: 4,
        audioId: null,
        errorMessage: 'Échec',
      }),
    ) as typeof fetch;

    const job = await getAdminAudioGuideJob('job-1');
    expect(job).toEqual({
      id: 'job-1',
      status: 'error',
      guideId: null,
      errorMessage: 'Échec',
    });
  });
});

describe('retryAdminAudioGuideJob', () => {
  beforeEach(() => {
    setMemoryAccessToken('test-admin-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMemoryAccessToken(null);
  });

  it('POST /admin/audio-guides/jobs/:jobId/retry', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ accepted: true, jobId: 'job-1' }),
    ) as typeof fetch;

    const result = await retryAdminAudioGuideJob('job-1');
    expect(result).toEqual({ accepted: true, jobId: 'job-1' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/admin/audio-guides/jobs/job-1/retry',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('generateAdminAudioGuideAndAwaitJob', () => {
  beforeEach(() => {
    setMemoryAccessToken('test-admin-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    setMemoryAccessToken(null);
  });

  it('poll jusqu’à ready', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ jobId: 'job-1' }, 202))
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'job-1',
          status: 'SCRIPTING',
          poiId: 'poi-1',
          sourceUrl: 'https://fr.wikipedia.org/wiki/Test',
          language: 'fr',
          targetDurationMinutes: null,
          audioId: null,
          errorMessage: null,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'job-1',
          status: 'COMPLETED',
          poiId: 'poi-1',
          sourceUrl: 'https://fr.wikipedia.org/wiki/Test',
          language: 'fr',
          targetDurationMinutes: null,
          audioId: 'audio-1',
          errorMessage: null,
        }),
      ) as typeof fetch;

    const result = await generateAdminAudioGuideAndAwaitJob(
      'poi-1',
      { wikipediaUrl: 'https://fr.wikipedia.org/wiki/Test', language: 'fr' },
      { poll: { intervalMs: 0, maxAttempts: 5 } },
    );

    expect(result.outcome).toBe('ready');
    expect(result.job?.status).toBe('ready');
    expect(result.job?.guideId).toBe('audio-1');

    const urls = (global.fetch as jest.Mock).mock.calls.map(
      (call: unknown[]) => String(call[0]),
    );
    expect(urls.some((url) => url.includes('/me/credits'))).toBe(false);
  });

  it('échoue si le job passe en error', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ jobId: 'job-1' }, 202))
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'job-1',
          status: 'FAILED',
          poiId: 'poi-1',
          sourceUrl: 'https://fr.wikipedia.org/wiki/Test',
          language: 'fr',
          targetDurationMinutes: null,
          audioId: null,
          errorMessage: 'Synthèse impossible',
        }),
      ) as typeof fetch;

    const result = await generateAdminAudioGuideAndAwaitJob(
      'poi-1',
      { wikipediaUrl: 'https://fr.wikipedia.org/wiki/Test' },
      { poll: { intervalMs: 0, maxAttempts: 5 } },
    );

    expect(result.outcome).toBe('failed');
    expect(result.errorMessage).toBe('Synthèse impossible');
  });

  it('retourne launched si le polling expire', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ jobId: 'job-1' }, 202))
      .mockResolvedValue(
        jsonResponse({
          id: 'job-1',
          status: 'PENDING',
          poiId: 'poi-1',
          sourceUrl: 'https://fr.wikipedia.org/wiki/Test',
          language: 'fr',
          targetDurationMinutes: null,
          audioId: null,
          errorMessage: null,
        }),
      ) as typeof fetch;

    const result = await generateAdminAudioGuideAndAwaitJob(
      'poi-1',
      { wikipediaUrl: 'https://fr.wikipedia.org/wiki/Test' },
      { poll: { intervalMs: 0, maxAttempts: 2 } },
    );

    expect(result.outcome).toBe('launched');
    expect(result.job).toBeNull();
  });

  it('propage AudioGuideGenerationError sur 422', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          statusCode: 422,
          message: 'URL invalide',
          code: 'INVALID_URL',
        },
        422,
      ),
    ) as typeof fetch;

    await expect(
      generateAdminAudioGuideAndAwaitJob('poi-1', {
        wikipediaUrl: 'https://example.com/x',
      }),
    ).rejects.toBeInstanceOf(AudioGuideGenerationError);
  });
});
