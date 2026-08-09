import { parseFocusMapRegion } from '../focusMapRegion';

describe('parseFocusMapRegion', () => {
  it('parse une région valide depuis les query params', () => {
    expect(
      parseFocusMapRegion({
        focusLat: '48.859',
        focusLng: '2.3622',
        focusLatDelta: '0.018',
        focusLngDelta: '0.022',
      }),
    ).toEqual({
      latitude: 48.859,
      longitude: 2.3622,
      latitudeDelta: 0.018,
      longitudeDelta: 0.022,
    });
  });

  it('rejette deltas non positifs ou NaN', () => {
    expect(
      parseFocusMapRegion({
        focusLat: '48',
        focusLng: '2',
        focusLatDelta: '0',
        focusLngDelta: '0.1',
      }),
    ).toBeNull();
    expect(parseFocusMapRegion({})).toBeNull();
  });
});
