import { PLACE_IMAGE_PLACEHOLDER } from '../../../constants/placeImages';
import type { CitySummary } from '../../../types/api';
import { citySummaryToCityView, mockCityToCityView } from '../cities';

const baseCity: CitySummary = {
  id: 'city-1',
  slug: 'lyon',
  name: 'Lyon',
  subtitle: null,
  coverImage: {
    id: 'img-1',
    url: 'https://cdn.example.com/lyon.jpg',
    expiresAt: '2026-08-10T00:00:00.000Z',
    altText: null,
  },
  stats: {
    publishedPoiCount: 3,
    editorialItineraryCount: 2,
    districtHubCount: 0,
  },
  isPromoted: false,
};

describe('citySummaryToCityView', () => {
  it('mappe les champs API (subtitle éditorial uniquement)', () => {
    expect(
      citySummaryToCityView({
        ...baseCity,
        subtitle: '9 guides audio · 5 parcours',
      }),
    ).toEqual({
      id: 'city-1',
      slug: 'lyon',
      name: 'Lyon',
      coverImageUrl: 'https://cdn.example.com/lyon.jpg',
      subtitle: '9 guides audio · 5 parcours',
    });
  });

  it('utilise une chaîne vide si subtitle null (pas de formatage stats phase 1)', () => {
    expect(citySummaryToCityView(baseCity).subtitle).toBe('');
  });

  it('utilise le placeholder si cover absente', () => {
    const view = citySummaryToCityView({ ...baseCity, coverImage: null });
    expect(view.coverImageUrl).toBe(PLACE_IMAGE_PLACEHOLDER);
  });
});

describe('mockCityToCityView', () => {
  it('projette MockCity vers CityView', () => {
    expect(
      mockCityToCityView({
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
        mustSeePoiIds: [],
        recommendedPoiIds: [],
        featuredPremiumItineraryId: null,
        touristPasses: [],
        affiliateExperiences: [],
      }),
    ).toEqual({
      id: 'city-paris',
      slug: 'paris',
      name: 'Paris',
      coverImageUrl: 'https://example.com/p.jpg',
      subtitle: '9 guides',
    });
  });
});
