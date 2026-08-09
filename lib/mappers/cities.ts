import type { MockCity } from '../../constants/mockCities';
import { PLACE_IMAGE_PLACEHOLDER } from '../../constants/placeImages';
import type { CitySummary } from '../../types/api';

/**
 * Vue UI villes pour recherche / carrousels (A2.1, A4.1).
 * Sous-ensemble de `MockCity` — le hub complet reste mock jusqu’à T18.
 */
export interface CityView {
  id: string;
  slug: string;
  name: string;
  coverImageUrl: string;
  subtitle: string;
}

export function citySummaryToCityView(city: CitySummary): CityView {
  return {
    id: city.id,
    slug: city.slug,
    name: city.name,
    coverImageUrl: city.coverImage?.url?.trim() || PLACE_IMAGE_PLACEHOLDER,
    subtitle: city.subtitle?.trim() ?? '',
  };
}

export function mockCityToCityView(city: MockCity): CityView {
  return {
    id: city.id,
    slug: city.slug,
    name: city.name,
    coverImageUrl: city.coverImageUrl,
    subtitle: city.subtitle,
  };
}
