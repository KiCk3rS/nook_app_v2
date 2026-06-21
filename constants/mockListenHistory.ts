import { formatAudioDuration, getPlaceById } from './mockPlaces';
import { LISTEN_HISTORY_COPY } from './listenHistoryCopy';

export type ListenHistorySectionKey = keyof typeof LISTEN_HISTORY_COPY.sections;

export const LISTEN_HISTORY_SECTION_ORDER: ListenHistorySectionKey[] = [
  'today',
  'yesterday',
  'thisWeek',
  'earlier',
];

export interface MockListenHistoryEntry {
  id: string;
  placeId: string;
  guideId: string;
  sectionKey: ListenHistorySectionKey;
  listenedAtLabel: string;
  progressPercent: number;
}

export interface ListenHistoryItem {
  id: string;
  placeId: string;
  guideId: string;
  placeName: string;
  guideTitle: string;
  imageUrl: string;
  durationLabel: string | null;
  progressPercent: number;
  listenedAtLabel: string;
  sectionKey: ListenHistorySectionKey;
}

export const MOCK_LISTEN_HISTORY: MockListenHistoryEntry[] = [
  {
    id: 'listen-1',
    placeId: '10',
    guideId: '10-a',
    sectionKey: 'today',
    listenedAtLabel: '14:32',
    progressPercent: 100,
  },
  {
    id: 'listen-2',
    placeId: '12',
    guideId: '12-a',
    sectionKey: 'today',
    listenedAtLabel: '11:05',
    progressPercent: 62,
  },
  {
    id: 'listen-3',
    placeId: '1',
    guideId: '1-a',
    sectionKey: 'yesterday',
    listenedAtLabel: 'Hier · 18:20',
    progressPercent: 100,
  },
  {
    id: 'listen-4',
    placeId: '2',
    guideId: '2-a',
    sectionKey: 'yesterday',
    listenedAtLabel: 'Hier · 09:15',
    progressPercent: 38,
  },
  {
    id: 'listen-5',
    placeId: '11',
    guideId: '11-a',
    sectionKey: 'thisWeek',
    listenedAtLabel: 'Mercredi',
    progressPercent: 100,
  },
  {
    id: 'listen-6',
    placeId: '6',
    guideId: '6-a',
    sectionKey: 'thisWeek',
    listenedAtLabel: 'Lundi',
    progressPercent: 100,
  },
  {
    id: 'listen-7',
    placeId: '4',
    guideId: '4-a',
    sectionKey: 'earlier',
    listenedAtLabel: '12 juin',
    progressPercent: 100,
  },
  {
    id: 'listen-8',
    placeId: '5',
    guideId: '5-a',
    sectionKey: 'earlier',
    listenedAtLabel: '5 juin',
    progressPercent: 85,
  },
  {
    id: 'listen-9',
    placeId: '13',
    guideId: '13-a',
    sectionKey: 'earlier',
    listenedAtLabel: '28 mai',
    progressPercent: 100,
  },
];

function resolveListenHistoryItem(entry: MockListenHistoryEntry): ListenHistoryItem | null {
  const place = getPlaceById(entry.placeId);
  if (!place) return null;
  const guide = place.audioGuides.find((g) => g.id === entry.guideId);
  if (!guide) return null;

  return {
    id: entry.id,
    placeId: place.id,
    guideId: guide.id,
    placeName: place.name,
    guideTitle: guide.title,
    imageUrl: place.imageUrl,
    durationLabel: guide.durationSec ? formatAudioDuration(guide.durationSec) : null,
    progressPercent: entry.progressPercent,
    listenedAtLabel: entry.listenedAtLabel,
    sectionKey: entry.sectionKey,
  };
}

export function getMockListenHistory(): ListenHistoryItem[] {
  return MOCK_LISTEN_HISTORY.map(resolveListenHistoryItem).filter(
    (item): item is ListenHistoryItem => item != null,
  );
}

export interface ListenHistorySection {
  key: ListenHistorySectionKey;
  title: string;
  items: ListenHistoryItem[];
}

export function groupListenHistory(items: ListenHistoryItem[]): ListenHistorySection[] {
  return LISTEN_HISTORY_SECTION_ORDER.map((key) => ({
    key,
    title: LISTEN_HISTORY_COPY.sections[key],
    items: items.filter((item) => item.sectionKey === key),
  })).filter((section) => section.items.length > 0);
}
