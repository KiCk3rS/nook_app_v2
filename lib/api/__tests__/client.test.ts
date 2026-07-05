import { ApiError } from '../../../types/api';
import {
  apiRequest,
  buildQuery,
  setMemoryAccessToken,
  setTokenRefreshHandler,
} from '../client';

jest.mock('../../config', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  isApiConfigured: jest.fn(() => true),
}));

const { isApiConfigured } = jest.requireMock('../../config') as {
  isApiConfigured: jest.Mock;
};

const originalFetch = global.fetch;

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('buildQuery', () => {
  it('encode limit, offset et q', () => {
    expect(buildQuery({ limit: 20, offset: 0, q: 'paris' })).toBe(
      'limit=20&offset=0&q=paris',
    );
  });

  it('omet les valeurs null et undefined', () => {
    expect(buildQuery({ limit: 10, offset: undefined, q: null })).toBe('limit=10');
  });
});

describe('ApiError parsing via apiRequest', () => {
  beforeEach(() => {
    setMemoryAccessToken(null);
    setTokenRefreshHandler(null);
    isApiConfigured.mockReturnValue(true);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parse code, requestId et details depuis le corps JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        {
          statusCode: 402,
          message: 'Crédits insuffisants.',
          code: 'GUIDE_CHAT_INSUFFICIENT_CREDITS',
          details: { credits: ['required'] },
          requestId: 'body-request-id',
        },
        402,
      ),
    ) as typeof fetch;

    await expect(apiRequest('/me/pois/x/guide-chat/messages', { auth: true })).rejects.toMatchObject({
      statusCode: 402,
      code: 'GUIDE_CHAT_INSUFFICIENT_CREDITS',
      requestId: 'body-request-id',
      details: { credits: ['required'] },
      message: 'Crédits insuffisants.',
    });
  });

  it('utilise X-Request-Id du header si absent du corps', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse(
        { statusCode: 500, message: 'Erreur serveur.' },
        500,
        { 'X-Request-Id': 'header-request-id' },
      ),
    ) as typeof fetch;

    try {
      await apiRequest('/me');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).requestId).toBe('header-request-id');
    }
  });

  it('retry 401 : refreshHandler appelé une fois puis requête rejouée', async () => {
    const refreshHandler = jest.fn().mockResolvedValue('new-access-token');
    setTokenRefreshHandler(refreshHandler);
    setMemoryAccessToken('expired-token');

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ statusCode: 401, message: 'Non autorisé.' }, 401),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 'user-1', email: 'a@b.c' })) as typeof fetch;

    const result = await apiRequest<{ id: string }>('/me', { auth: true });

    expect(result).toEqual({ id: 'user-1', email: 'a@b.c' });
    expect(refreshHandler).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const secondCall = (global.fetch as jest.Mock).mock.calls[1];
    expect(secondCall[1].headers.Authorization).toBe('Bearer new-access-token');
  });

  it('isApiConfigured false → ApiError statusCode 0', async () => {
    isApiConfigured.mockReturnValue(false);
    global.fetch = jest.fn() as typeof fetch;

    await expect(apiRequest('/me')).rejects.toMatchObject({
      statusCode: 0,
      message: expect.stringContaining('API_BASE_URL'),
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
