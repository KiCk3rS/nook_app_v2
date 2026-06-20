/** Données mock villes — hub territorial A4.3. */

export interface CityBbox {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface AffiliateMapItem {
  id: string;
  title: string;
  partnerName: string;
  imageUrl: string;
  affiliateUrl: string;
}

export interface AffiliateExperienceItem {
  id: string;
  title: string;
  provider: string;
  priceFrom: string;
  duration?: string;
  rating?: number;
  imageUrl: string;
  externalUrl: string;
}

export interface MockCity {
  id: string;
  slug: string;
  name: string;
  coverImageUrl: string;
  subtitle: string;
  mapRegion: CityBbox;
  mustSeePoiIds: string[];
  recommendedPoiIds: string[];
  featuredPremiumItineraryId: string | null;
  affiliateMaps: AffiliateMapItem[];
  affiliateExperiences: AffiliateExperienceItem[];
}

export const mockCities: MockCity[] = [
  {
    id: 'city-paris',
    slug: 'paris',
    name: 'Paris',
    coverImageUrl:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    subtitle: '9 guides audio · 5 parcours',
    mapRegion: {
      latitude: 48.8566,
      longitude: 2.3522,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    },
    mustSeePoiIds: ['1', '2', '4', '6'],
    recommendedPoiIds: ['3', '5'],
    featuredPremiumItineraryId: 'itin-paris-premium',
    affiliateMaps: [
      {
        id: 'map-paris-1',
        title: 'Carte Paris monuments',
        partnerName: 'Planète Guides',
        imageUrl:
          'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80',
        affiliateUrl: 'https://example.com/affiliate/paris-map',
      },
      {
        id: 'map-paris-2',
        title: 'Plan métro & monuments',
        partnerName: 'Urban Maps',
        imageUrl:
          'https://images.unsplash.com/photo-1569336410460-0f0a2a2a0a0a?w=400&q=80',
        affiliateUrl: 'https://example.com/affiliate/paris-metro',
      },
    ],
    affiliateExperiences: [
      {
        id: 'exp-paris-1',
        title: 'Croisière sur la Seine',
        provider: 'GetYourGuide',
        priceFrom: '29 €',
        duration: '1 h 30',
        rating: 4.8,
        imageUrl:
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
        externalUrl: 'https://example.com/affiliate/seine-cruise',
      },
      {
        id: 'exp-paris-2',
        title: 'Visite guidée du Louvre',
        provider: 'GetYourGuide',
        priceFrom: '45 €',
        duration: '3 h',
        rating: 4.9,
        imageUrl:
          'https://images.unsplash.com/photo-1743880475189-e36f80868bcc?w=400&q=80',
        externalUrl: 'https://example.com/affiliate/louvre-tour',
      },
    ],
  },
  {
    id: 'city-lyon',
    slug: 'lyon',
    name: 'Lyon',
    coverImageUrl:
      'https://images.unsplash.com/photo-1565967511849-76a60a516107?w=1200&q=80',
    subtitle: 'Bientôt disponible',
    mapRegion: {
      latitude: 45.764,
      longitude: 4.8357,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    },
    mustSeePoiIds: [],
    recommendedPoiIds: [],
    featuredPremiumItineraryId: null,
    affiliateMaps: [],
    affiliateExperiences: [],
  },
];

export function getCityBySlug(slug: string): MockCity | undefined {
  return mockCities.find((c) => c.slug === slug);
}

export function getCityById(id: string): MockCity | undefined {
  return mockCities.find((c) => c.id === id);
}
