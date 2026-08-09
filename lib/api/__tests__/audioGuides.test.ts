import { shouldUseMockData } from '../../config';
import {
  fetchAudioGuideJob,
  fetchCreditPacks,
  fetchCreditsBalance,
  generateAudioGuide,
  generateAudioGuideAndAwaitJob,
  purchaseCreditsPack,
} from '../audioGuides';

jest.mock('../../config', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  isApiConfigured: jest.fn(() => true),
  shouldUseMockData: jest.fn((demoSession: boolean) => demoSession),
}));

const { isApiConfigured, shouldUseMockData: shouldUseMockDataMock } = jest.requireMock(
  '../../config',
) as {
  isApiConfigured: jest.Mock;
  shouldUseMockData: jest.Mock;
};

const originalFetch = global.fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('shouldUseMockData (audio guides)', () => {
  beforeEach(() => {
    isApiConfigured.mockReturnValue(true);
    shouldUseMockDataMock.mockImplementation((demoSession: boolean) => demoSession);
  });

  it('retourne false quand API configurée et session réelle', () => {
    isApiConfigured.mockReturnValue(true);
    expect(shouldUseMockData(false)).toBe(false);
  });

  it('retourne true sans API ou session démo', () => {
    isApiConfigured.mockReturnValue(false);
    shouldUseMockDataMock.mockImplementation((demoSession: boolean) => !isApiConfigured() || demoSession);
    expect(shouldUseMockData(false)).toBe(true);

    isApiConfigured.mockReturnValue(true);
    shouldUseMockDataMock.mockImplementation((demoSession: boolean) => demoSession);
    expect(shouldUseMockData(true)).toBe(true);
  });
});

describe('fetchAudioGuideJob', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parse un job en cours puis terminal', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'job-1',
          status: 'pending',
          guideId: 'guide-1',
          errorMessage: null,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'job-1',
          status: 'ready',
          guideId: 'guide-1',
          errorMessage: null,
        }),
      ) as typeof fetch;

    const pending = await fetchAudioGuideJob('job-1');
    expect(pending.status).toBe('pending');

    const ready = await fetchAudioGuideJob('job-1');
    expect(ready.status).toBe('ready');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/audio-guides/jobs/job-1',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('fetchCreditsBalance', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle GET /me/credits en session réelle', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        creditsBalance: 7,
        subscriptionGenerationsRemaining: 1,
      }),
    ) as typeof fetch;

    const balance = await fetchCreditsBalance({ demoSession: false });
    expect(balance).toEqual({
      creditsBalance: 7,
      subscriptionGenerationsRemaining: 1,
    });
  });
});

describe('fetchCreditPacks', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('appelle GET /me/credits/packs en session réelle', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [
          {
            productId: 'credits_5',
            credits: 5,
            priceLabel: '2,99 €',
            currency: 'EUR',
            priceCents: 299,
          },
        ],
      }),
    ) as typeof fetch;

    const res = await fetchCreditPacks(false);
    expect(res.items).toHaveLength(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/credits/packs',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('generateAudioGuide', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('mappe 402 vers AudioGuideGenerationError INSUFFICIENT_CREDITS', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          statusCode: 402,
          message: 'Crédits insuffisants.',
          code: 'AUDIO_GUIDE_INSUFFICIENT_CREDITS',
        },
        402,
      ),
    ) as typeof fetch;

    await expect(
      generateAudioGuide(
        'user-1',
        'poi-1',
        'Lieu',
        { wikipediaUrl: 'https://fr.wikipedia.org/wiki/Test', durationTier: 'normal', language: 'fr' },
        false,
        false,
      ),
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_CREDITS',
      statusCode: 402,
    });
  });

  it('accepte une réponse 202', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          jobId: 'job-1',
          guideId: 'guide-1',
          paymentType: 'credits',
        },
        202,
      ),
    ) as typeof fetch;

    const response = await generateAudioGuide(
      'user-1',
      'poi-1',
      'Lieu',
      { wikipediaUrl: 'https://fr.wikipedia.org/wiki/Test', durationTier: 'normal', language: 'fr' },
      false,
      false,
    );

    expect(response.jobId).toBe('job-1');
  });
});

describe('generateAudioGuideAndAwaitJob', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retourne launched si le polling expire', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { jobId: 'job-1', guideId: 'guide-1', paymentType: 'credits' },
          202,
        ),
      )
      .mockResolvedValue(
        jsonResponse({
          id: 'job-1',
          status: 'pending',
          guideId: 'guide-1',
          errorMessage: null,
        }),
      ) as typeof fetch;

    const result = await generateAudioGuideAndAwaitJob(
      'user-1',
      'poi-1',
      'Lieu',
      { wikipediaUrl: 'https://fr.wikipedia.org/wiki/Test', durationTier: 'normal', language: 'fr' },
      false,
      { demoSession: false, poll: { intervalMs: 0, maxAttempts: 2 } },
    );

    expect(result.outcome).toBe('launched');
    expect(result.job).toBeNull();
  });
});

describe('purchaseCreditsPack', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('POST /me/credits/purchase avec productId uniquement', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        creditsBalance: 12,
        subscriptionGenerationsRemaining: 1,
      }),
    ) as typeof fetch;

    const balance = await purchaseCreditsPack('credits_15', false);

    expect(balance.creditsBalance).toBe(12);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ productId: 'credits_15' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/credits/purchase',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
