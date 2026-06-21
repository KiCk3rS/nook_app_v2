/** Données mock villes — hub territorial A4.3. */

export interface CityBbox {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface TouristPassItem {
  id: string;
  title: string;
  partnerName: string;
  imageUrl: string;
  affiliateUrl: string;
  /** Prix affiché « à partir de ». */
  priceFrom: string;
  /** Ex. « 2 jours », « 48 h ». */
  validityLabel?: string;
  /** Ex. « Jusqu’à 30 % d’économies ». */
  savingsHint?: string;
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
  touristPasses: TouristPassItem[];
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
    touristPasses: [
      {
        id: 'pass-paris-1',
        title: 'Paris Museum Pass',
        partnerName: 'Office de Tourisme de Paris',
        imageUrl:
          'https://images.unsplash.com/photo-1743880475189-e36f80868bcc?w=400&q=80',
        affiliateUrl: 'https://example.com/affiliate/paris-museum-pass',
        priceFrom: '62 €',
        validityLabel: '2 jours',
        savingsHint: 'Accès à 50+ musées et monuments',
      },
      {
        id: 'pass-paris-2',
        title: 'Paris Pass',
        partnerName: 'Paris City Vision',
        imageUrl:
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
        affiliateUrl: 'https://example.com/affiliate/paris-pass',
        priceFrom: '89 €',
        validityLabel: '4 jours',
        savingsHint: 'Musées + transports + activités',
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
    touristPasses: [],
    affiliateExperiences: [],
  },
];

export function getCityBySlug(slug: string): MockCity | undefined {
  return mockCities.find((c) => c.slug === slug);
}

export function getCityById(id: string): MockCity | undefined {
  return mockCities.find((c) => c.id === id);
}
