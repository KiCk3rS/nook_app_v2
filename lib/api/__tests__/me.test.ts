import { fetchMe, patchMe, patchPreferences } from '../me';
import { jsonResponse } from './helpers';

jest.mock('../../config', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  isApiConfigured: jest.fn(() => true),
}));

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('fetchMe', () => {
  it('GET /me avec auth', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'user-1',
        email: 'u***@example.com',
        displayName: 'Alice',
        role: 'USER',
        preferences: { notifications: { push: true } },
      }),
    ) as typeof fetch;

    const profile = await fetchMe();

    expect(profile.displayName).toBe('Alice');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('patchMe', () => {
  it('PATCH /me', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        id: 'user-1',
        email: 'alice@example.com',
        displayName: 'Nouveau',
        role: 'USER',
      }),
    ) as typeof fetch;

    const user = await patchMe({ displayName: 'Nouveau' });

    expect(user.displayName).toBe('Nouveau');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ displayName: 'Nouveau' }),
      }),
    );
  });
});

describe('patchPreferences', () => {
  it('PATCH /me/preferences', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({
        notifications: { push: false },
      }),
    ) as typeof fetch;

    const prefs = await patchPreferences({
      notifications: { push: false },
    });

    expect(prefs.notifications?.push).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/me/preferences',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
