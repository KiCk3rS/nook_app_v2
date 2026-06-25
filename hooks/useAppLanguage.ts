import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../contexts/AuthContext';
import type { AppLocale } from '../lib/i18n';
import { changeAppLanguage, getAppLanguage } from '../lib/i18n/syncLocale';

export function useAppLanguage() {
  const { i18n } = useTranslation();
  const { updatePreferences } = useAuth();

  const language = getAppLanguage();

  const setLanguage = useCallback(
    async (locale: AppLocale) => {
      if (locale === getAppLanguage()) return;

      const previous = getAppLanguage();
      await changeAppLanguage(locale);

      try {
        await updatePreferences({ language: locale });
      } catch (_error) {
        await changeAppLanguage(previous);
        throw _error;
      }
    },
    [updatePreferences],
  );

  return {
    language,
    setLanguage,
    isReady: i18n.isInitialized,
  };
}
