import Constants from 'expo-constants';

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

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}
