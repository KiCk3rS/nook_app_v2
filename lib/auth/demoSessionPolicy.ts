import { ApiError } from '../../types/api';

/** Connexion démo autorisée uniquement sans API ou via action explicite (bouton démo). */
export function shouldAllowMockLogin(
  apiConfigured: boolean,
  explicitDemo: boolean,
): boolean {
  return explicitDemo || !apiConfigured;
}

/** Bloque login/register API quand l’URL de base n’est pas configurée. */
export function assertApiAuthAvailable(apiConfigured: boolean): void {
  if (!apiConfigured) {
    throw new ApiError(
      'Service non configuré. Définissez API_BASE_URL dans votre fichier .env.',
      0,
    );
  }
}

/** Jamais de session mock silencieuse après un échec login quand l’API est branchée. */
export function shouldFallbackToMockAfterLoginFailure(
  apiConfigured: boolean,
): boolean {
  return !apiConfigured;
}
