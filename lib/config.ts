import Constants from 'expo-constants';

/**
 * Règles démo vs API (T09) :
 * - Sans `API_BASE_URL` : données mock ; bouton démo visible.
 * - Avec API en prod : auth réelle uniquement ; pas de session mock silencieuse.
 * - Avec API en dev (`__DEV__`) : bouton démo explicite sur le profil.
 */
export function getApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra.replace(/\/$/, '');
  }
  return '';
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

/** Profil démo : sans API, ou en build dev même si l’API est branchée. */
export function shouldShowDemoLogin(): boolean {
  return !isApiConfigured() || __DEV__;
}

/** Données mock / pas d’appels API réels (session démo ou API absente). */
export function shouldUseMockData(isMockSession: boolean): boolean {
  return !isApiConfigured() || isMockSession;
}

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}
