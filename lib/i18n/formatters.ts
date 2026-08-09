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

export function formatAudioDuration(durationSec: number, locale?: string): string {
  const totalMinutes = Math.max(1, Math.round(durationSec / 60));
  return formatDurationMinutes(totalMinutes, locale);
}

export function formatDurationMinutes(totalMinutes: number, locale?: string): string {
  const lang = locale ?? i18n.language ?? 'fr';
  if (totalMinutes < 60) {
    return i18n.t('common:durationMinutes', { count: totalMinutes, lng: lang });
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes > 0) {
    return i18n.t('common:durationHoursMinutes', { hours, minutes, lng: lang });
  }
  return i18n.t('common:durationHours', { hours, lng: lang });
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

/** Mois + année localisés depuis une date ISO (profil memberSince). */
export function formatMemberSinceWhen(
  createdAt: string,
  locale?: string,
): string | undefined {
  const lang = locale ?? i18n.language ?? 'fr';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(lang, {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Libellé « Explorateur depuis … » via i18n ; `undefined` si date absente/invalide. */
export function formatMemberSinceLabel(
  createdAt: string | null | undefined,
  locale?: string,
): string | undefined {
  if (!createdAt?.trim()) return undefined;
  const lang = locale ?? i18n.language ?? 'fr';
  const when = formatMemberSinceWhen(createdAt, lang);
  if (!when) return undefined;
  return i18n.t('profile:memberSince', { when, lng: lang });
}

/** Durée d’itinéraire éditorial (minutes → libellé i18n). */
export function formatItineraryDuration(minutes: number, locale?: string): string {
  return formatDurationMinutes(minutes, locale);
}

/** Distance d’itinéraire éditorial. */
export function formatItineraryDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}
