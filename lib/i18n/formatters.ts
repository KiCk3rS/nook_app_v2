import i18n from './index';

export function formatDistanceMeters(meters: number, locale?: string): string {
  const lang = locale ?? i18n.language ?? 'fr';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  const formatted = new Intl.NumberFormat(lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(km);
  return `${formatted} km`;
}

export function formatWalkMinutes(minutes: number, locale?: string): string {
  const lang = locale ?? i18n.language ?? 'fr';
  return i18n.t('common:walkMinutes', { count: minutes, lng: lang });
}

export function formatGuidanceWalkHint(
  distance: string,
  minutes: number,
  locale?: string,
): string {
  const lang = locale ?? i18n.language ?? 'fr';
  const walkLabel = formatWalkMinutes(minutes, lang);
  return i18n.t('guidance:walkHint', {
    distance,
    minutes: walkLabel,
    lng: lang,
  });
}

export function formatListenCount(count: number, locale?: string): string {
  const lang = locale ?? i18n.language ?? 'fr';
  if (count >= 1000) {
    const rounded = Math.round(count / 100) / 10;
    const formatted = new Intl.NumberFormat(lang, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(rounded);
    return i18n.t('common:listenCountK', { count: formatted, lng: lang });
  }
  return i18n.t('common:listenCount', { count, lng: lang });
}

export function formatLatestGuideSubtitle(
  publishedAt: string | undefined,
  locale?: string,
): string {
  const lang = locale ?? i18n.language ?? 'fr';
  if (!publishedAt) {
    return i18n.t('common:newGuide', { lng: lang });
  }
  return i18n.t('common:publishedOn', { date: publishedAt, lng: lang });
}

export function formatListenHistorySectionKey(
  key: 'today' | 'yesterday' | 'thisWeek' | 'earlier',
  locale?: string,
): string {
  const lang = locale ?? i18n.language ?? 'fr';
  return i18n.t(`common:${key}`, { lng: lang });
}

export function formatStepsCount(count: number, locale?: string): string {
  const lang = locale ?? i18n.language ?? 'fr';
  return i18n.t('common:steps', { count, lng: lang });
}

export function formatItineraryStepMeta(
  duration: string,
  steps: number,
  locale?: string,
): string {
  const lang = locale ?? i18n.language ?? 'fr';
  const stepsLabel = formatStepsCount(steps, lang);
  return i18n.t('hub:itineraryStepMeta', {
    duration,
    stepsCount: stepsLabel,
    lng: lang,
  });
}
