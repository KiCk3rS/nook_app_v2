import { fetchHealth } from '../health';
import { ApiError } from '../../../types/api';

const originalFetch = global.fetch;

describe('fetchHealth', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('parse { status: "ok" } en succès', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'ok' }),
    }) as typeof fetch;

    await expect(fetchHealth()).resolves.toEqual({ status: 'ok' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('rejette sur status HTTP non-2xx', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service unavailable',
    }) as typeof fetch;

    await expect(fetchHealth()).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 503,
    });
  });

  it('rejette sur erreur réseau', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed')) as typeof fetch;

    await expect(fetchHealth()).rejects.toThrow(TypeError);
  });

  it('rejette si le corps ne contient pas status ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ status: 'degraded' }),
    }) as typeof fetch;

    await expect(fetchHealth()).rejects.toBeInstanceOf(ApiError);
  });
});
