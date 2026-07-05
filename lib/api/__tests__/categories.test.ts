import { fetchCategories } from '../categories';

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

describe('fetchCategories', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parse { items: [...] }', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: 'cat-1',
            slug: 'culture',
            label: 'Culture',
            createdAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    ) as typeof fetch;

    const result = await fetchCategories();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/categories',
      expect.any(Object),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ slug: 'culture', label: 'Culture' });
  });
});
