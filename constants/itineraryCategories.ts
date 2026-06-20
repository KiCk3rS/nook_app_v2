/** Catégories d’itinéraires éditoriaux — hub ville A4.3. */

export interface ItineraryCategory {
  slug: string;
  label: string;
  icon: keyof typeof CATEGORY_ICONS;
}

export const CATEGORY_ICONS = {
  highlights: 'star-outline',
  secrets: 'eye-outline',
  family: 'people-outline',
  'one-day': 'sunny-outline',
  walking: 'walk-outline',
  evening: 'moon-outline',
} as const;

export const itineraryCategories: ItineraryCategory[] = [
  { slug: 'highlights', label: 'Les points forts', icon: 'highlights' },
  { slug: 'secrets', label: 'Les secrets', icon: 'secrets' },
  { slug: 'family', label: 'En famille', icon: 'family' },
  { slug: 'one-day', label: 'Une journée', icon: 'one-day' },
  { slug: 'walking', label: 'À pied', icon: 'walking' },
  { slug: 'evening', label: 'En soirée', icon: 'evening' },
];

export function getCategoryBySlug(slug: string): ItineraryCategory | undefined {
  return itineraryCategories.find((c) => c.slug === slug);
}

export function getCategoryLabel(slug: string): string {
  return getCategoryBySlug(slug)?.label ?? slug;
}
