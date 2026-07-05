import {
  DEFAULT_REFRESH_MARGIN_MS,
  TokenRefreshLock,
  getProactiveRefreshDelayMs,
  isTokenNearExpiry,
  parseJwtExpMs,
} from '../../authRefresh';

function makeJwt(expSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
    'base64url',
  );
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString('base64url');
  return `${header}.${payload}.signature`;
}

describe('authRefresh', () => {
  it('parseJwtExpMs décode exp', () => {
    const expSeconds = Math.floor(Date.now() / 1000) + 900;
    const token = makeJwt(expSeconds);
    expect(parseJwtExpMs(token)).toBe(expSeconds * 1000);
  });

  it('refresh proactif déclenché avant exp (délai > 0 hors fenêtre de marge)', () => {
    const nowMs = 1_700_000_000_000;
    const expMs = nowMs + 10 * 60 * 1000;
    const token = makeJwt(Math.floor(expMs / 1000));

    const delayMs = getProactiveRefreshDelayMs(token, nowMs, DEFAULT_REFRESH_MARGIN_MS);
    expect(delayMs).toBe(10 * 60 * 1000 - DEFAULT_REFRESH_MARGIN_MS);
    expect(isTokenNearExpiry(token, nowMs, DEFAULT_REFRESH_MARGIN_MS)).toBe(false);
  });

  it('isTokenNearExpiry true dans la fenêtre de marge', () => {
    const nowMs = 1_700_000_000_000;
    const expMs = nowMs + 30_000;
    const token = makeJwt(Math.floor(expMs / 1000));

    expect(getProactiveRefreshDelayMs(token, nowMs, DEFAULT_REFRESH_MARGIN_MS)).toBe(0);
    expect(isTokenNearExpiry(token, nowMs, DEFAULT_REFRESH_MARGIN_MS)).toBe(true);
  });

  it('TokenRefreshLock : pas de double refresh concurrent', async () => {
    const lock = new TokenRefreshLock();
    let running = 0;
    let maxRunning = 0;

    const refreshFn = jest.fn(async () => {
      running += 1;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((resolve) => setTimeout(resolve, 20));
      running -= 1;
      return 'token';
    });

    const [a, b] = await Promise.all([
      lock.refresh(refreshFn),
      lock.refresh(refreshFn),
    ]);

    expect(a).toBe('token');
    expect(b).toBe('token');
    expect(refreshFn).toHaveBeenCalledTimes(1);
    expect(maxRunning).toBe(1);
  });
});
