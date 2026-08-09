import { requestForgotPassword, resetPassword } from '../auth';
import { jsonResponse } from './helpers';

jest.mock('../../config', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
  isApiConfigured: jest.fn(() => true),
}));

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('requestForgotPassword', () => {
  it('POST /auth/forgot-password', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ ok: true }),
    ) as typeof fetch;

    const result = await requestForgotPassword({ email: 'a@example.com' });

    expect(result).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@example.com' }),
      }),
    );
  });
});

describe('resetPassword', () => {
  it('POST /auth/reset-password', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ ok: true }),
    ) as typeof fetch;

    const result = await resetPassword({
      token: 'plain-token',
      password: 'newpassword12',
    });

    expect(result).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          token: 'plain-token',
          password: 'newpassword12',
        }),
      }),
    );
  });
});
