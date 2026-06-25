import type { AppLocale } from './index';
import i18n from './index';

export async function changeAppLanguage(locale: AppLocale): Promise<void> {
  await i18n.changeLanguage(locale);
}

export function getAppLanguage(): AppLocale {
  return (i18n.language?.split('-')[0] as AppLocale) ?? 'fr';
}
