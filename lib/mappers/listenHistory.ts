import type {
  ListenHistoryItem,
  ListenHistorySectionKey,
} from '../../constants/mockListenHistory';
import { PLACE_IMAGE_PLACEHOLDER } from '../../constants/placeImages';
import type { ListenHistoryEntry } from '../../types/api';
import { formatAudioDurationClock } from '../../constants/mockPlaces';
import { computeListenPercent } from '../audio/playbackUrl';

export type MappedListenHistoryItem = ListenHistoryItem;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayDiff(from: Date, to: Date): number {
  const ms = startOfDay(from).getTime() - startOfDay(to).getTime();
  return Math.round(ms / 86_400_000);
}

export function getListenHistorySectionKey(
  listenedAt: string,
  now: Date = new Date(),
): ListenHistorySectionKey {
  const listened = new Date(listenedAt);
  if (Number.isNaN(listened.getTime())) {
    return 'earlier';
  }

  const diff = dayDiff(now, listened);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff >= 2 && diff <= 6) return 'thisWeek';
  return 'earlier';
}

export function formatListenedAtLabel(
  listenedAt: string,
  sectionKey: ListenHistorySectionKey,
  locale: string,
): string {
  const date = new Date(listenedAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  if (sectionKey === 'today') {
    return time;
  }

  if (sectionKey === 'yesterday') {
    const yesterdayLabel =
      locale.startsWith('fr') ? 'Hier' : 'Yesterday';
    return `${yesterdayLabel} · ${time}`;
  }

  if (sectionKey === 'thisWeek') {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/**
 * - `progressSeconds` absent ou ≤ 0 → terminé (100 %)
 * - avec `durationSeconds` → ratio réel
 * - progression partielle sans durée API → barre neutre « en cours » (50 %)
 */
export function computeListenHistoryProgressPercent(
  progressSeconds: number | null,
  durationSeconds?: number | null,
): number {
  if (progressSeconds == null || progressSeconds <= 0) {
    return 100;
  }
  if (durationSeconds != null && durationSeconds > 0) {
    return computeListenPercent(progressSeconds, durationSeconds);
  }
  return 50;
}

export function listenHistoryEntryToItem(
  entry: ListenHistoryEntry,
  locale: string,
  now: Date = new Date(),
): MappedListenHistoryItem | null {
  if (!entry.poiId) {
    return null;
  }

  const sectionKey = getListenHistorySectionKey(entry.listenedAt, now);
  const guideTitle = entry.audio.title?.trim() || 'Guide audio';
  const placeName = entry.poi?.title?.trim() || 'Lieu';

  return {
    id: entry.id,
    placeId: entry.poiId,
    guideId: entry.audioId,
    placeName,
    guideTitle,
    imageUrl: PLACE_IMAGE_PLACEHOLDER,
    durationLabel: null,
    progressPercent: computeListenHistoryProgressPercent(
      entry.progressSeconds,
      entry.audio.durationSeconds,
    ),
    listenedAtLabel: formatListenedAtLabel(entry.listenedAt, sectionKey, locale),
    sectionKey,
  };
}

export function formatListenHistoryDurationLabel(
  durationSeconds: number | null | undefined,
): string | null {
  if (durationSeconds == null || durationSeconds <= 0) {
    return null;
  }
  return formatAudioDurationClock(durationSeconds);
}
