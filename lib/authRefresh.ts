/** Marge avant expiration du JWT pour déclencher un refresh proactif. */
export const DEFAULT_REFRESH_MARGIN_MS = 60_000;

/** Durée access token API (`JWT_ACCESS_EXPIRES`, défaut 15 min) — repli si `exp` illisible. */
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  if (typeof atob === 'function') {
    return atob(padded);
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

/** Retourne l'expiration JWT en ms (epoch), ou `null` si le token n'est pas un JWT valide. */
export function parseJwtExpMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Délai (ms) avant le prochain refresh proactif ; `0` si déjà dans la fenêtre de marge. */
export function getProactiveRefreshDelayMs(
  accessToken: string,
  nowMs: number = Date.now(),
  marginMs: number = DEFAULT_REFRESH_MARGIN_MS,
): number {
  const expMs = parseJwtExpMs(accessToken);
  const refreshAtMs =
    expMs != null ? expMs - marginMs : nowMs + ACCESS_TOKEN_TTL_MS - marginMs;
  return Math.max(0, refreshAtMs - nowMs);
}

/** `true` si le token est dans la fenêtre de refresh (exp - marge). */
export function isTokenNearExpiry(
  accessToken: string,
  nowMs: number = Date.now(),
  marginMs: number = DEFAULT_REFRESH_MARGIN_MS,
): boolean {
  return getProactiveRefreshDelayMs(accessToken, nowMs, marginMs) === 0;
}

/** Évite les refresh concurrents (proactif + réactif 401). */
export class TokenRefreshLock {
  private refreshPromise: Promise<string | null> | null = null;

  refresh(refreshFn: () => Promise<string | null>): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = refreshFn().finally(() => {
      this.refreshPromise = null;
    });
    return this.refreshPromise;
  }
}

export const sharedRefreshLock = new TokenRefreshLock();
