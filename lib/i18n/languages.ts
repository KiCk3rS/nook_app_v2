import type { AppLocale } from './index';
import { SUPPORTED_LOCALES } from './index';

/** Libellés natifs — clés i18n `settings:languages.<code>`. */
export const APP_LANGUAGE_OPTIONS = SUPPORTED_LOCALES.map((code) => ({
  code,
  labelKey: `languages.${code}` as const,
}));

export function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
