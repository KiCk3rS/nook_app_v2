/** Données mock quartiers hub — A4.5. */

import type { AffiliateExperienceItem, CityBbox } from './mockCities';

export type DistrictPresentation = 'place' | 'hub';

export interface MockDistrict {
  id: string;
  slug: string;
  citySlug: string;
  name: string;
  coverImageUrl: string;
  subtitle: string;
  presentation: DistrictPresentation;
  /** POI carte associé au quartier. */
  anchorPoiId: string;
  mapRegion: CityBbox;
  mustSeePoiIds: string[];
  recommendedPoiIds: string[];
  featuredPremiumItineraryId: string | null;
  affiliateExperiences: AffiliateExperienceItem[];
}

export const mockDistricts: MockDistrict[] = [
  {
    id: 'district-le-marais',
    slug: 'le-marais',
    citySlug: 'paris',
    name: 'Le Marais',
    coverImageUrl:
      'https://images.unsplash.com/photo-1594558068774-4bd20990a583?w=1200&q=80',
    subtitle: '4 parcours · 6 lieux · 2 expériences',
    presentation: 'hub',
    anchorPoiId: '6',
    mapRegion: {
      latitude: 48.859,
      longitude: 2.3622,
      latitudeDelta: 0.018,
      longitudeDelta: 0.022,
    },
    mustSeePoiIds: ['10', '11', '12', '13'],
    recommendedPoiIds: ['14'],
    featuredPremiumItineraryId: 'itin-marais-premium',
    affiliateExperiences: [
      {
        id: 'exp-marais-1',
        title: 'Visite guidée du Marais médiéval',
        provider: 'GetYourGuide',
        priceFrom: '24 €',
        duration: '2 h',
        rating: 4.7,
        imageUrl:
          'https://images.unsplash.com/photo-1594558068774-4bd20990a583?w=400&q=80',
        externalUrl: 'https://example.com/affiliate/marais-walking-tour',
      },
      {
        id: 'exp-marais-2',
        title: 'Balade gastronomique — falafel & pâtisseries',
        provider: 'GetYourGuide',
        priceFrom: '39 €',
        duration: '3 h',
        rating: 4.8,
        imageUrl:
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
        externalUrl: 'https://example.com/affiliate/marais-food-tour',
      },
    ],
  },
];

export function getDistrictBySlug(
  citySlug: string,
  districtSlug: string,
): MockDistrict | undefined {
  return mockDistricts.find(
    (d) => d.citySlug === citySlug && d.slug === districtSlug,
  );
}

export function getDistrictByAnchorPoiId(poiId: string): MockDistrict | undefined {
  return mockDistricts.find(
    (d) => d.anchorPoiId === poiId && d.presentation === 'hub',
  );
}

export function isDistrictHubPoi(poiId: string): boolean {
  return getDistrictByAnchorPoiId(poiId) !== undefined;
}
