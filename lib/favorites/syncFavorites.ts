import { shouldUseMockData } from '../config';

export function shouldUseServerFavorites(
  isAuthenticated: boolean,
  isMockSession: boolean,
): boolean {
  return isAuthenticated && !shouldUseMockData(isMockSession);
}

/** Union ordonnée : serveur d’abord, puis ajouts locaux offline absents du serveur. */
export function mergeFavoritePlaceIds(
  serverIds: readonly string[],
  localIds: readonly string[],
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const id of serverIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(id);
  }

  for (const id of localIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(id);
  }

  return merged;
}

export function applyPlaceToggle(
  ids: ReadonlySet<string>,
  placeId: string,
  adding: boolean,
): Set<string> {
  const next = new Set(ids);
  if (adding) {
    next.add(placeId);
  } else {
    next.delete(placeId);
  }
  return next;
}

export function rollbackPlaceToggle(
  ids: ReadonlySet<string>,
  placeId: string,
  previousWasFavorite: boolean,
): Set<string> {
  const next = new Set(ids);
  if (previousWasFavorite) {
    next.add(placeId);
  } else {
    next.delete(placeId);
  }
  return next;
}

export function favoriteItemsToMap(
  items: readonly { poiId: string }[],
): Map<string, (typeof items)[number]> {
  const map = new Map<string, (typeof items)[number]>();
  for (const item of items) {
    map.set(item.poiId, item);
  }
  return map;
}
