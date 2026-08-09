import { PLACE_IMAGE_PLACEHOLDER } from '../../../constants/placeImages';
import type { CityHub, CityHubPoiSnippet } from '../../../types/api';
import {
  cityHubPoiSnippetToMockPlace,
  cityHubToHubData,
  mockCityToHubData,
} from '../cityHub';

const samplePoi: CityHubPoiSnippet = {
  id: 'poi-1',
  title: 'Notre-Dame de Paris',
  parentPoiId: null,
  lat: 48.853,
  lng: 2.3499,
  categories: [{ slug: 'culture', label: 'Culture' }],
  popularity: null,
  coverImage: {
    id: 'img-1',
    url: 'https://cdn.example.com/nd.jpg',
    expiresAt: '2026-08-10T00:00:00.000Z',
    altText: null,
  },
};

const sampleHub: CityHub = {
  id: 'city-paris',
  slug: 'paris',
  name: 'Paris',
  subtitle: '9 guides audio · 5 parcours',
  coverImage: {
    id: 'cover-1',
    url: 'https://cdn.example.com/paris.jpg',
    expiresAt: '2026-08-10T00:00:00.000Z',
    altText: 'Paris',
  },
  map: {
    center: { lat: 48.8566, lng: 2.3522 },
    bbox: { north: 48.92, south: 48.8, east: 2.45, west: 2.22 },
    latitudeDelta: 0.06,
    longitudeDelta: 0.115,
  },
  stats: { publishedPoiCount: 5, editorialItineraryCount: 0 },
  itineraryCategories: [],
  featuredPremiumItinerary: { id: 'ignored-until-t21' },
  mustSeePois: [samplePoi],
  recommendedPois: [],
  touristPasses: [{ id: 'ignored-stub' }],
  affiliateExperiences: [{ id: 'ignored-stub' }],
};

describe('cityHubPoiSnippetToMockPlace', () => {
  it('mappe coords, catégorie et cover via poiCardLike', () => {
    expect(cityHubPoiSnippetToMockPlace(samplePoi)).toMatchObject({
      id: 'poi-1',
      name: 'Notre-Dame de Paris',
      latitude: 48.853,
      longitude: 2.3499,
      categoryId: 'culture',
      imageUrl: 'https://cdn.example.com/nd.jpg',
    });
  });

  it('utilise le placeholder si cover absente', () => {
    const place = cityHubPoiSnippetToMockPlace({
      ...samplePoi,
      coverImage: null,
      lat: null,
      lng: null,
    });
    expect(place.imageUrl).toBe(PLACE_IMAGE_PLACEHOLDER);
    expect(place.latitude).toBe(0);
    expect(place.longitude).toBe(0);
  });
});

describe('cityHubToHubData', () => {
  it('mappe hub API et ignore stubs affiliation / premium', () => {
    const data = cityHubToHubData(sampleHub);
    expect(data).toMatchObject({
      citySlug: 'paris',
      name: 'Paris',
      coverImageUrl: 'https://cdn.example.com/paris.jpg',
      subtitle: '9 guides audio · 5 parcours',
      featuredPremiumItineraryId: null,
      touristPasses: [],
      affiliateExperiences: [],
    });
    expect(data.mustSeePlaces).toHaveLength(1);
    expect(data.mustSeePlaces[0]?.id).toBe('poi-1');
  });

  it('utilise placeholder si cover ville absente', () => {
    const data = cityHubToHubData({
      ...sampleHub,
      coverImage: null,
      subtitle: null,
    });
    expect(data.coverImageUrl).toBe(PLACE_IMAGE_PLACEHOLDER);
    expect(data.subtitle).toBe('');
  });
});

describe('mockCityToHubData', () => {
  it('résout les POI mock et conserve affiliation démo', () => {
    const data = mockCityToHubData({
      id: 'city-paris',
      slug: 'paris',
      name: 'Paris',
      coverImageUrl: 'https://example.com/p.jpg',
      subtitle: '9 guides',
      mapRegion: {
        latitude: 48.85,
        longitude: 2.35,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      },
      mustSeePoiIds: ['1'],
      recommendedPoiIds: ['999'],
      featuredPremiumItineraryId: 'itin-paris-premium',
      touristPasses: [
        {
          id: 'pass-1',
          title: 'Pass',
          partnerName: 'OT',
          imageUrl: 'https://example.com/pass.jpg',
          affiliateUrl: 'https://example.com/a',
          priceFrom: '10 €',
        },
      ],
      affiliateExperiences: [],
    });
    expect(data.mustSeePlaces).toHaveLength(1);
    expect(data.mustSeePlaces[0]?.id).toBe('1');
    expect(data.recommendedPlaces).toHaveLength(0);
    expect(data.featuredPremiumItineraryId).toBe('itin-paris-premium');
    expect(data.touristPasses).toHaveLength(1);
  });
});
