import { getApiBaseUrl, isApiConfigured } from '../config';
import { ApiError } from '../../types/api';

export interface HealthResponse {
  status: 'ok';
}

export async function fetchHealth(): Promise<HealthResponse> {
  if (!isApiConfigured()) {
    throw new ApiError(
      'Service non configuré. Définissez API_BASE_URL dans votre fichier .env.',
      0,
    );
  }

  const response = await fetch(`${getApiBaseUrl()}/api/health`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new ApiError(
      text || `Health check failed (${response.status})`,
      response.status,
    );
  }

  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError('Réponse health invalide (JSON attendu).', response.status);
  }

  const body = data as Partial<HealthResponse>;
  if (body?.status !== 'ok') {
    throw new ApiError('Réponse health inattendue.', response.status);
  }

  return { status: 'ok' };
}
