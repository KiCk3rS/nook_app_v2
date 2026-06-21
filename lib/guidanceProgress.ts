import AsyncStorage from '@react-native-async-storage/async-storage';

export type GuidanceSourceType = 'editorial' | 'user';

export interface GuidanceProgress {
  stepIndex: number;
  updatedAt: number;
  completedAt?: number;
}

const STORAGE_PREFIX = 'guidance:';

function storageKey(sourceType: GuidanceSourceType, itineraryId: string): string {
  return `${STORAGE_PREFIX}${sourceType}:${itineraryId}`;
}

export async function getGuidanceProgress(
  sourceType: GuidanceSourceType,
  itineraryId: string,
): Promise<GuidanceProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(sourceType, itineraryId));
    if (!raw) return null;
    return JSON.parse(raw) as GuidanceProgress;
  } catch {
    return null;
  }
}

export async function saveGuidanceProgress(
  sourceType: GuidanceSourceType,
  itineraryId: string,
  progress: GuidanceProgress,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      storageKey(sourceType, itineraryId),
      JSON.stringify(progress),
    );
  } catch {
    // Persistance locale non bloquante.
  }
}

export async function clearGuidanceProgress(
  sourceType: GuidanceSourceType,
  itineraryId: string,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(sourceType, itineraryId));
  } catch {
    // ignore
  }
}
