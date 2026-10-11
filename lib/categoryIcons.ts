import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Mapping client-only : clé API `iconKey` → glyphe Ionicons. */
const ICON_BY_KEY: Record<string, IoniconName> = {
  landmark: 'business',
  museum: 'color-palette',
  gallery: 'images',
  theater: 'ticket',
  castle: 'business',
  fountain: 'water',
  artwork: 'image',
  attraction: 'star',
  restaurant: 'restaurant',
  cafe: 'cafe',
  bar: 'wine',
  lodging: 'bed',
  transit: 'bus',
  park: 'leaf',
  garden: 'flower',
  nature: 'trail-sign',
  zoo: 'paw',
  library: 'library',
  school: 'school',
  worship: 'home',
  place: 'map',
  plaza: 'flag',
  shopping: 'bag-handle',
  viewpoint: 'camera',
};

export const DEFAULT_CATEGORY_ICON_KEY = 'landmark';
export const DEFAULT_CATEGORY_COLOR = '#7B1FA2';

export function ioniconForCategoryIconKey(iconKey?: string | null): IoniconName {
  if (!iconKey) return 'location';
  return ICON_BY_KEY[iconKey] ?? 'location';
}
