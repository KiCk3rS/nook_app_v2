import { getApiBaseUrl, isApiConfigured } from '../config';
import { ApiError, type ApiErrorBody } from '../../types/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  accessToken?: string | null;
}

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

function parseErrorMessage(body: ApiErrorBody, fallback: string): string {
  if (typeof body.message === 'string' && body.message.length > 0) {
    return body.message;
  }
  if (Array.isArray(body.message) && body.message.length > 0) {
    return body.message.join('\n');
  }
  if (typeof body.error === 'string' && body.error.length > 0) {
    return body.error;
  }
  return fallback;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    if (!response.ok) {
      throw new ApiError('Une erreur est survenue.', response.status);
    }
    return undefined as T;
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new ApiError('Une erreur est survenue.', response.status);
    }
    return text as T;
  }

  if (!response.ok) {
    const body = data as ApiErrorBody;
    throw new ApiError(parseErrorMessage(body, 'Une erreur est survenue.'), response.status, {
      details: body.details,
      code: typeof body.error === 'string' ? body.error : undefined,
    });
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
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = accessToken ?? (options.auth ? memoryAccessToken : null);
  if (options.auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1${path}`, {
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
