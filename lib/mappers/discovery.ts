import type { DiscoveryPlaceItem } from '../../constants/discoveryFeed';
import type { DiscoveryItem } from '../../types/api';
import {
  formatLatestGuideSubtitle,
  formatListenCount,
} from '../i18n/formatters';
import { getCategoryDisplayLabel } from './poi';

export type DiscoverySectionKey = 'latest' | 'popular' | 'top_rated';

export interface DiscoveryCardItem {
  id: string;
  title: string;
  categoryLabel: string;
  subtitle: string;
  imageUrl: string | null;
  usesPlaceholder: boolean;
}

function primaryCategoryLabel(item: DiscoveryItem): string {
  const cat = item.categories[0];
  return getCategoryDisplayLabel(cat?.slug ?? 'monument', cat?.label);
}

function formatTopRatedSubtitle(
  rating: number | null | undefined,
  locale?: string,
): string {
  if (rating == null || Number.isNaN(rating)) {
    return '★ —';
  }
  const lang = locale ?? 'fr';
  const formatted = new Intl.NumberFormat(lang, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
  return `★ ${formatted}`;
}

export function formatDiscoverySubtitle(
  item: DiscoveryItem,
  section: DiscoverySectionKey,
  locale?: string,
): string {
  switch (section) {
    case 'latest':
      return formatLatestGuideSubtitle(item.publishedAt ?? undefined, locale);
    case 'popular':
      return formatListenCount(
        item.popularity?.playCountLast7Days ?? 0,
        locale,
      );
    case 'top_rated':
      return formatTopRatedSubtitle(item.popularity?.averageRating, locale);
    default:
      return '';
  }
}

export function discoveryItemToCardProps(
  item: DiscoveryItem,
  section: DiscoverySectionKey,
  locale?: string,
): DiscoveryCardItem {
  return {
    id: item.id,
    title: item.title,
    categoryLabel: primaryCategoryLabel(item),
    subtitle: formatDiscoverySubtitle(item, section, locale),
    imageUrl: item.coverImage?.url ?? null,
    usesPlaceholder: item.coverImage == null,
  };
}

export function mockDiscoveryPlaceItemToCardProps(
  item: DiscoveryPlaceItem,
): DiscoveryCardItem {
  return {
    id: item.place.id,
    title: item.place.name,
    categoryLabel: getCategoryDisplayLabel(item.place.categoryId),
    subtitle: item.subtitle,
    imageUrl: item.place.imageUrl,
    usesPlaceholder: false,
  };
}
