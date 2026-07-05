import { getApiBaseUrl, isApiConfigured } from '../config';
import { ApiError, type ApiErrorBody } from '../../types/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  accessToken?: string | null;
}

const REQUEST_TIMEOUT_MS = 30_000;

let memoryAccessToken: string | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;

export function setMemoryAccessToken(token: string | null): void {
  memoryAccessToken = token;
}

export function getMemoryAccessToken(): string | null {
  return memoryAccessToken;
}

export function setTokenRefreshHandler(
  handler: (() => Promise<string | null>) | null,
): void {
  refreshHandler = handler;
}

/** Construit une query string (`limit=20&offset=0&q=paris`) en omettant `null` / `undefined`. */
export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  return search.toString();
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Délai de requête dépassé.', 0);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const requestIdHeader = response.headers.get('X-Request-Id');
  const text = await response.text();
  if (!text) {
    if (!response.ok) {
      throw new ApiError('Une erreur est survenue.', response.status, {
        requestId: requestIdHeader ?? undefined,
      });
    }
    return undefined as T;
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new ApiError('Une erreur est survenue.', response.status, {
        requestId: requestIdHeader ?? undefined,
      });
    }
    return text as T;
  }

  if (!response.ok) {
    throw ApiError.fromBody(
      data as ApiErrorBody,
      response.status,
      'Une erreur est survenue.',
      requestIdHeader,
    );
  }

  return data as T;
}

async function requestOnce<T>(
  path: string,
  options: ApiRequestOptions,
  accessToken?: string | null,
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError(
      'Service non configuré. Définissez API_BASE_URL dans votre fichier .env.',
      0,
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Request-Id': createRequestId(),
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = accessToken ?? (options.auth ? memoryAccessToken : null);
  if (options.auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/v1${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  return parseResponse<T>(response);
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  try {
    return await requestOnce<T>(path, options);
  } catch (error) {
    if (
      options.auth &&
      ApiError.isUnauthorized(error) &&
      refreshHandler &&
      !path.startsWith('/auth/')
    ) {
      const newToken = await refreshHandler();
      if (newToken) {
        return requestOnce<T>(path, options, newToken);
      }
    }
    throw error;
  }
}
