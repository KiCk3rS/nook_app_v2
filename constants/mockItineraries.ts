/** Itinéraires éditoriaux NOOK — A5.6 / A5.7 (fallback mock offline). */

import { getDifficultyLabel } from '../lib/i18n/categoryLabels';
import {
  formatItineraryDistance as formatDistance,
  formatItineraryDuration as formatDuration,
} from '../lib/i18n/formatters';
import type {
  EditorialItinerary,
  ItineraryDifficulty,
} from '../types/api';

export type { EditorialItinerary, ItineraryDifficulty } from '../types/api';

/** @deprecated Use getDifficultyLabel() from lib/i18n/categoryLabels */
export const difficultyLabels: Record<ItineraryDifficulty, string> = {
  EASY: 'Facile',
  MEDIUM: 'Modéré',
  HARD: 'Difficile',
};

export function getItineraryDifficultyLabel(difficulty: ItineraryDifficulty): string {
  return getDifficultyLabel(difficulty);
}

export const mockItineraries: EditorialItinerary[] = [
  {
    id: 'itin-paris-highlights',
    slug: 'itin-paris-highlights',
    citySlug: 'paris',
    districtSlug: null,
    categorySlug: 'highlights',
    title: 'Les incontournables de Paris',
    description:
      'Notre-Dame, le Louvre et les sites emblématiques en un parcours fluide à pied.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    durationMinutes: 180,
    distanceMeters: 5200,
    difficulty: 'EASY',
    stepCount: 3,
    stepPoiIds: ['1', '2', '6'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-secrets',
    slug: 'itin-paris-secrets',
    citySlug: 'paris',
    districtSlug: null,
    categorySlug: 'secrets',
    title: 'Paris secret et insolite',
    description: 'Passages couverts, courtyards cachées et adresses connues des initiés.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    durationMinutes: 120,
    distanceMeters: 3800,
    difficulty: 'MEDIUM',
    stepCount: 3,
    stepPoiIds: ['3', '5', '7'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-family',
    slug: 'itin-paris-family',
    citySlug: 'paris',
    districtSlug: null,
    categorySlug: 'family',
    title: 'Paris en famille',
    description: 'Un parcours adapté aux enfants avec pauses et lieux interactifs.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    durationMinutes: 240,
    distanceMeters: 4500,
    difficulty: 'EASY',
    stepCount: 3,
    stepPoiIds: ['4', '6', '8'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-one-day',
    slug: 'itin-paris-one-day',
    citySlug: 'paris',
    districtSlug: null,
    categorySlug: 'one-day',
    title: 'Paris en une journée',
    description: 'Le maximum de la capitale en 8 heures, rythme soutenu.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1550340490-a6cdf0e4b016?w=800&q=80',
    durationMinutes: 480,
    distanceMeters: 12000,
    difficulty: 'MEDIUM',
    stepCount: 4,
    stepPoiIds: ['1', '2', '4', '6'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-walking',
    slug: 'itin-paris-walking',
    citySlug: 'paris',
    districtSlug: null,
    categorySlug: 'walking',
    title: 'Balade flâneur',
    description: 'Quartiers historiques et berges de Seine à pied, sans pression.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1431274172761-fca41c894578?w=800&q=80',
    durationMinutes: 150,
    distanceMeters: 6000,
    difficulty: 'EASY',
    stepCount: 3,
    stepPoiIds: ['1', '3', '5'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-paris-premium',
    slug: 'itin-paris-premium',
    citySlug: 'paris',
    districtSlug: null,
    categorySlug: 'evening',
    title: 'Paris by Night — Premium',
    description:
      'Itinéraire exclusif au coucher du soleil : monuments illuminés et guides audio enrichis.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    durationMinutes: 210,
    distanceMeters: 5500,
    difficulty: 'MEDIUM',
    stepCount: 5,
    stepPoiIds: ['1', '2', '4', '6', '5'],
    isPremium: true,
    priceLabel: '4,99 €',
    editorialOrder: 1,
  },
  {
    id: 'itin-marais-highlights',
    slug: 'itin-marais-highlights',
    citySlug: 'paris',
    districtSlug: 'le-marais',
    categorySlug: 'highlights',
    title: 'Les essentiels du Marais',
    description:
      'Place des Vosges, hôtels particuliers et ruelles emblématiques du quartier historique.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1594558068774-4bd20990a583?w=800&q=80',
    durationMinutes: 90,
    distanceMeters: 2400,
    difficulty: 'EASY',
    stepCount: 3,
    stepPoiIds: ['10', '11', '12'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-marais-secrets',
    slug: 'itin-marais-secrets',
    citySlug: 'paris',
    districtSlug: 'le-marais',
    categorySlug: 'secrets',
    title: 'Cours cachées et adresses secrètes',
    description: 'Passages privés, cours intérieures et détails architecturaux méconnus.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    durationMinutes: 75,
    distanceMeters: 2100,
    difficulty: 'MEDIUM',
    stepCount: 3,
    stepPoiIds: ['13', '14', '12'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-marais-walking',
    slug: 'itin-marais-walking',
    citySlug: 'paris',
    districtSlug: 'le-marais',
    categorySlug: 'walking',
    title: 'Flânerie dans le Marais',
    description: 'Un rythme lent entre galeries, cafés et patrimoine du 3e et 4e.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1431274172761-fca41c894578?w=800&q=80',
    durationMinutes: 120,
    distanceMeters: 3200,
    difficulty: 'EASY',
    stepCount: 4,
    stepPoiIds: ['10', '12', '11', '13'],
    isPremium: false,
    priceLabel: null,
    editorialOrder: 1,
  },
  {
    id: 'itin-marais-premium',
    slug: 'itin-marais-premium',
    citySlug: 'paris',
    districtSlug: 'le-marais',
    categorySlug: 'evening',
    title: 'Marais by Night — Premium',
    description:
      'Itinéraire exclusif au crépuscule : façades illuminées, places paisibles et guides enrichis.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    durationMinutes: 105,
    distanceMeters: 2800,
    difficulty: 'EASY',
    stepCount: 5,
    stepPoiIds: ['10', '11', '12', '13', '14'],
    isPremium: true,
    priceLabel: '3,99 €',
    editorialOrder: 1,
  },
];

export function getItineraryById(idOrSlug: string): EditorialItinerary | undefined {
  return mockItineraries.find((i) => i.id === idOrSlug || i.slug === idOrSlug);
}

export function getItinerariesByCity(citySlug: string): EditorialItinerary[] {
  return mockItineraries.filter((i) => i.citySlug === citySlug);
}

export function getItinerariesByCategory(
  citySlug: string,
  categorySlug: string,
  districtSlug?: string,
): EditorialItinerary[] {
  return mockItineraries
    .filter((i) => {
      if (i.citySlug !== citySlug || i.categorySlug !== categorySlug) return false;
      if (districtSlug) return i.districtSlug === districtSlug;
      return i.districtSlug == null;
    })
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
  districtSlug?: string,
): number {
  return getItinerariesByCategory(citySlug, categorySlug, districtSlug).length;
}

export function formatItineraryDuration(minutes: number): string {
  return formatDuration(minutes);
}

export function formatItineraryDistance(meters: number): string {
  return formatDistance(meters);
}
