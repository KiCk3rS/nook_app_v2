import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enAudioPlayer from './locales/en/audioPlayer.json';
import enAdminAddPlace from './locales/en/adminAddPlace.json';
import enCategories from './locales/en/categories.json';
import enCreateGuide from './locales/en/createGuide.json';
import enCreditsPack from './locales/en/creditsPack.json';
import enDiscovery from './locales/en/discovery.json';
import enFavorites from './locales/en/favorites.json';
import enGuidance from './locales/en/guidance.json';
import enHub from './locales/en/hub.json';
import enLegal from './locales/en/legal.json';
import enListenHistory from './locales/en/listenHistory.json';
import enPermissions from './locales/en/permissions.json';
import enPlace from './locales/en/place.json';
import enProfile from './locales/en/profile.json';
import enSearch from './locales/en/search.json';
import enSettings from './locales/en/settings.json';
import enTabs from './locales/en/tabs.json';
import enUserItineraries from './locales/en/userItineraries.json';
import frAuth from './locales/fr/auth.json';
import frAudioPlayer from './locales/fr/audioPlayer.json';
import frAdminAddPlace from './locales/fr/adminAddPlace.json';
import frCategories from './locales/fr/categories.json';
import frCreateGuide from './locales/fr/createGuide.json';
import frCreditsPack from './locales/fr/creditsPack.json';
import frDiscovery from './locales/fr/discovery.json';
import frFavorites from './locales/fr/favorites.json';
import frGuidance from './locales/fr/guidance.json';
import frHub from './locales/fr/hub.json';
import frLegal from './locales/fr/legal.json';
import frListenHistory from './locales/fr/listenHistory.json';
import frPermissions from './locales/fr/permissions.json';
import frPlace from './locales/fr/place.json';
import frProfile from './locales/fr/profile.json';
import frSearch from './locales/fr/search.json';
import frSettings from './locales/fr/settings.json';
import frTabs from './locales/fr/tabs.json';
import frUserItineraries from './locales/fr/userItineraries.json';

import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';

/** Editorial content (itineraries, places) will use Accept-Language or localized API fields. */
export type AppLocale = 'fr' | 'en';

export const SUPPORTED_LOCALES: AppLocale[] = ['fr', 'en'];
export const DEFAULT_LOCALE: AppLocale = 'fr';

const resources = {
  fr: {
    common: frCommon,
    audioPlayer: frAudioPlayer,
    adminAddPlace: frAdminAddPlace,
    auth: frAuth,
    settings: frSettings,
    tabs: frTabs,
    profile: frProfile,
    favorites: frFavorites,
    guidance: frGuidance,
    hub: frHub,
    userItineraries: frUserItineraries,
    listenHistory: frListenHistory,
    search: frSearch,
    discovery: frDiscovery,
    permissions: frPermissions,
    place: frPlace,
    createGuide: frCreateGuide,
    categories: frCategories,
    creditsPack: frCreditsPack,
    legal: frLegal,
  },
  en: {
    common: enCommon,
    audioPlayer: enAudioPlayer,
    adminAddPlace: enAdminAddPlace,
    auth: enAuth,
    settings: enSettings,
    tabs: enTabs,
    profile: enProfile,
    favorites: enFavorites,
    guidance: enGuidance,
    hub: enHub,
    userItineraries: enUserItineraries,
    listenHistory: enListenHistory,
    search: enSearch,
    discovery: enDiscovery,
    permissions: enPermissions,
    place: enPlace,
    createGuide: enCreateGuide,
    categories: enCategories,
    creditsPack: enCreditsPack,
    legal: enLegal,
  },
} as const;

export function normalizeLocale(code: string | undefined | null): AppLocale {
  if (!code) return DEFAULT_LOCALE;
  const base = code.split('-')[0]?.toLowerCase();
  if (base === 'en') return 'en';
  if (base === 'fr') return 'fr';
  return DEFAULT_LOCALE;
}

export function getDeviceLocale(): AppLocale {
  const deviceCode = Localization.getLocales()[0]?.languageCode;
  return normalizeLocale(deviceCode);
}

export function resolveLocaleForSession(
  isAuthenticated: boolean,
  preferenceLanguage?: AppLocale,
): AppLocale {
  if (isAuthenticated && preferenceLanguage) {
    return normalizeLocale(preferenceLanguage);
  }
  return getDeviceLocale();
}

let initialized = false;

export function initI18n(initialLocale: AppLocale = DEFAULT_LOCALE): typeof i18n {
  if (initialized) {
    if (i18n.language !== initialLocale) {
      void i18n.changeLanguage(initialLocale);
    }
    return i18n;
  }

  void i18n.use(initReactI18next).init({
    resources,
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: 'common',
    ns: [
      'common',
      'audioPlayer',
      'adminAddPlace',
      'auth',
      'settings',
      'tabs',
      'profile',
      'favorites',
      'guidance',
      'hub',
      'userItineraries',
      'listenHistory',
      'search',
      'discovery',
      'permissions',
      'place',
      'createGuide',
      'categories',
      'creditsPack',
      'legal',
    ],
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

  initialized = true;
  return i18n;
}

initI18n(getDeviceLocale());

export { i18n };
export default i18n;
