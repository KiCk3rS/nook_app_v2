import type { ListenHistoryEntry, PaginatedResponse } from '../../types/api';
import {
  formatListenHistoryDurationLabel,
  listenHistoryEntryToItem,
} from '../mappers/listenHistory';

export interface ProfileRecentListen {
  placeId: string;
  name: string;
  imageUrl: string;
  durationLabel?: string;
  listenedAtLabel: string;
}

export interface ProfileStatsInput {
  useMockData: boolean;
  routesCount: number;
  placeFavoritesCount: number;
  itineraryFavoritesCount: number;
  listenHistory: Pick<PaginatedResponse<ListenHistoryEntry>, 'total' | 'items'> | null;
  mockListenCount: number;
  mockCitiesCount: number;
  memberSinceLabel?: string;
}

export interface ProfileStatsResult {
  routesCount: number;
  favoritesCount: number;
  listenCount: number;
  citiesCount: number;
  memberSinceLabel?: string;
}

export function resolveFavoritesCount(input: {
  useMockData: boolean;
  placeFavoritesCount: number;
  itineraryFavoritesCount: number;
}): number {
  if (input.useMockData) {
    return input.placeFavoritesCount + input.itineraryFavoritesCount;
  }
  return input.placeFavoritesCount;
}

export function resolveListenCount(
  listenHistory: Pick<PaginatedResponse<ListenHistoryEntry>, 'total'> | null,
  mockListenCount: number,
  useMockData: boolean,
): number {
  if (useMockData) {
    return mockListenCount;
  }
  return listenHistory?.total ?? 0;
}

export function buildProfileStats(input: ProfileStatsInput): ProfileStatsResult {
  return {
    routesCount: input.routesCount,
    favoritesCount: resolveFavoritesCount({
      useMockData: input.useMockData,
      placeFavoritesCount: input.placeFavoritesCount,
      itineraryFavoritesCount: input.itineraryFavoritesCount,
    }),
    listenCount: resolveListenCount(
      input.listenHistory,
      input.mockListenCount,
      input.useMockData,
    ),
    citiesCount: input.useMockData ? input.mockCitiesCount : 0,
    memberSinceLabel: input.useMockData ? input.memberSinceLabel : undefined,
  };
}

export function mapRecentListensFromHistory(
  entries: ListenHistoryEntry[],
  locale: string,
  limit = 3,
): ProfileRecentListen[] {
  return entries
    .map((entry) => listenHistoryEntryToItem(entry, locale))
    .filter((item): item is NonNullable<typeof item> => item != null)
    .slice(0, limit)
    .map((item) => ({
      placeId: item.placeId,
      name: item.placeName,
      imageUrl: item.imageUrl,
      durationLabel:
        formatListenHistoryDurationLabel(
          entries.find((entry) => entry.id === item.id)?.audio.durationSeconds,
        ) ?? undefined,
      listenedAtLabel: item.listenedAtLabel,
    }));
}
