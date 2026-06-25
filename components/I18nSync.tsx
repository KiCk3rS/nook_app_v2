import { useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { changeAppLanguage } from '../lib/i18n/syncLocale';
import { getDeviceLocale, resolveLocaleForSession } from '../lib/i18n';

/** Keeps i18next in sync with auth state and device locale for anonymous users. */
export function I18nSync() {
  const { isAuthenticated, preferences, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const locale = resolveLocaleForSession(
      isAuthenticated,
      preferences.language,
    );
    void changeAppLanguage(locale);
  }, [isAuthenticated, isLoading, preferences.language]);

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    void changeAppLanguage(getDeviceLocale());
  }, [isAuthenticated, isLoading]);

  return null;
}
