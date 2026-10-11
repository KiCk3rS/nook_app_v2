import { ioniconForCategoryIconKey } from '../categoryIcons';

describe('categoryIcons', () => {
  it('mappe iconKey vers Ionicons', () => {
    expect(ioniconForCategoryIconKey('lodging')).toBe('bed');
    expect(ioniconForCategoryIconKey('restaurant')).toBe('restaurant');
    expect(ioniconForCategoryIconKey('unknown')).toBe('location');
    expect(ioniconForCategoryIconKey(null)).toBe('location');
  });
});
