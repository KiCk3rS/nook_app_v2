import { getPlaceHref, getPlaceHrefById } from '../placeNavigation';

jest.mock('../config', () => ({
  isApiConfigured: jest.fn(),
}));

import { isApiConfigured } from '../config';

const mockedIsApiConfigured = isApiConfigured as jest.MockedFunction<
  typeof isApiConfigured
>;

describe('placeNavigation', () => {
  beforeEach(() => {
    mockedIsApiConfigured.mockReset();
  });

  it('mode démo : ancre mock Marais → hub quartier', () => {
    mockedIsApiConfigured.mockReturnValue(false);
    expect(getPlaceHrefById('6')).toBe('/city/paris/district/le-marais');
  });

  it('mode API sans districtHub sur le POI → fiche lieu', () => {
    mockedIsApiConfigured.mockReturnValue(true);
    expect(getPlaceHrefById('6')).toBe('/place/6');
  });

  it('mode API avec districtHub sur le POI → hub', () => {
    mockedIsApiConfigured.mockReturnValue(true);
    expect(
      getPlaceHref({
        id: 'uuid-marais',
        districtHub: { citySlug: 'paris', districtSlug: 'le-marais' },
      }),
    ).toBe('/city/paris/district/le-marais');
  });
});
