/** Itinéraires éditoriaux NOOK — A5.6 / A5.7. */

export type ItineraryDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface EditorialItinerary {
  id: string;
  citySlug: string;
  categorySlug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  durationMinutes: number;
  distanceMeters: number;
  difficulty: ItineraryDifficulty;
  stepPoiIds: string[];
  isPremium: boolean;
  priceLabel?: string;
  editorialOrder: number;
}

export const difficultyLabels: Record<ItineraryDifficulty, string> = {
  EASY: 'Facile',
  MEDIUM: 'Modéré',
  HARD: 'Difficile',
};

export const mockItineraries: EditorialItinerary[] = [
  {
    id: 'itin-paris-highlights',
    citySlug: 'paris',
    categorySlug: 'highlights',
    title: 'Les incontournables de Paris',
    description:
      'Notre-Dame, le Louvre et les sites emblématiques en un parcours fluide à pied.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    durationMinutes: 180,
    distanceMeters: 5200,
    difficulty: 'EASY',
    stepPoiIds: ['1', '2', '6'],
    isPremium: false,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-secrets',
    citySlug: 'paris',
    categorySlug: 'secrets',
    title: 'Paris secret et insolite',
    description: 'Passages couverts, courtyards cachées et adresses connues des initiés.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    durationMinutes: 120,
    distanceMeters: 3800,
    difficulty: 'MEDIUM',
    stepPoiIds: ['3', '5', '7'],
    isPremium: false,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-family',
    citySlug: 'paris',
    categorySlug: 'family',
    title: 'Paris en famille',
    description: 'Un parcours adapté aux enfants avec pauses et lieux interactifs.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    durationMinutes: 240,
    distanceMeters: 4500,
    difficulty: 'EASY',
    stepPoiIds: ['4', '6', '8'],
    isPremium: false,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-one-day',
    citySlug: 'paris',
    categorySlug: 'one-day',
    title: 'Paris en une journée',
    description: 'Le maximum de la capitale en 8 heures, rythme soutenu.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1550340490-a6cdf0e4b016?w=800&q=80',
    durationMinutes: 480,
    distanceMeters: 12000,
    difficulty: 'MEDIUM',
    stepPoiIds: ['1', '2', '4', '6'],
    isPremium: false,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-walking',
    citySlug: 'paris',
    categorySlug: 'walking',
    title: 'Balade flâneur',
    description: 'Quartiers historiques et berges de Seine à pied, sans pression.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1431274172761-fca41c894578?w=800&q=80',
    durationMinutes: 150,
    distanceMeters: 6000,
    difficulty: 'EASY',
    stepPoiIds: ['1', '3', '5'],
    isPremium: false,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-premium',
    citySlug: 'paris',
    categorySlug: 'evening',
    title: 'Paris by Night — Premium',
    description:
      'Itinéraire exclusif au coucher du soleil : monuments illuminés et guides audio enrichis.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    durationMinutes: 210,
    distanceMeters: 5500,
    difficulty: 'MEDIUM',
    stepPoiIds: ['1', '2', '4', '6', '5'],
    isPremium: true,
    priceLabel: '4,99 €',
    editorialOrder: 1,
  },
];

export function getItineraryById(id: string): EditorialItinerary | undefined {
  return mockItineraries.find((i) => i.id === id);
}

export function getItinerariesByCity(citySlug: string): EditorialItinerary[] {
  return mockItineraries.filter((i) => i.citySlug === citySlug);
}

export function getItinerariesByCategory(
  citySlug: string,
  categorySlug: string,
): EditorialItinerary[] {
  return mockItineraries
    .filter((i) => i.citySlug === citySlug && i.categorySlug === categorySlug)
    .sort((a, b) => {
      if (a.editorialOrder !== b.editorialOrder) {
        return a.editorialOrder - b.editorialOrder;
      }
      return a.id.localeCompare(b.id);
    });
}

export function countItinerariesByCategory(
  citySlug: string,
  categorySlug: string,
): number {
  return getItinerariesByCategory(citySlug, categorySlug).length;
}

export function formatItineraryDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
}

export function formatItineraryDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
}
