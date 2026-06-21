import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'nook:favorites:v1';

export interface StoredFavorites {
  placeIds: string[];
  itineraryIds: string[];
}

const EMPTY: StoredFavorites = { placeIds: [], itineraryIds: [] };

export async function loadStoredFavorites(): Promise<StoredFavorites> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<StoredFavorites>;
    return {
      placeIds: Array.isArray(parsed.placeIds) ? parsed.placeIds.filter(Boolean) : [],
      itineraryIds: Array.isArray(parsed.itineraryIds)
        ? parsed.itineraryIds.filter(Boolean)
        : [],
    };
  } catch {
    return EMPTY;
  }
}

export async function saveStoredFavorites(favorites: StoredFavorites): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Persistance locale non bloquante.
  }
}
