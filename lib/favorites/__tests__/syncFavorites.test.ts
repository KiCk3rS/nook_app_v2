import {
  applyPlaceToggle,
  mergeFavoritePlaceIds,
  rollbackPlaceToggle,
  shouldUseServerFavorites,
} from '../syncFavorites';

jest.mock('../../config', () => ({
  isApiConfigured: jest.fn(() => true),
  shouldUseMockData: jest.fn((isMockSession: boolean) => isMockSession),
}));

const { shouldUseMockData } = jest.requireMock('../../config') as {
  shouldUseMockData: jest.Mock;
};

describe('shouldUseServerFavorites', () => {
  beforeEach(() => {
    shouldUseMockData.mockImplementation((isMockSession: boolean) => isMockSession);
  });

  it('ignore l’API en mode demo', () => {
    expect(shouldUseServerFavorites(true, true)).toBe(false);
  });

  it('utilise l’API quand connecté et pas demo', () => {
    expect(shouldUseServerFavorites(true, false)).toBe(true);
  });

  it('ignore l’API si non connecté', () => {
    expect(shouldUseServerFavorites(false, false)).toBe(false);
  });
});

describe('mergeFavoritePlaceIds', () => {
  it('fusionne serveur puis local offline sans doublons', () => {
    expect(
      mergeFavoritePlaceIds(['poi-a', 'poi-b'], ['poi-b', 'poi-c']),
    ).toEqual(['poi-a', 'poi-b', 'poi-c']);
  });
});

describe('applyPlaceToggle', () => {
  it('ajoute un favori', () => {
    const next = applyPlaceToggle(new Set(['poi-a']), 'poi-b', true);
    expect([...next]).toEqual(['poi-a', 'poi-b']);
  });

  it('retire un favori', () => {
    const next = applyPlaceToggle(new Set(['poi-a', 'poi-b']), 'poi-a', false);
    expect([...next]).toEqual(['poi-b']);
  });
});

describe('rollbackPlaceToggle', () => {
  it('restaure l’état avant toggle optimiste', () => {
    const rolledBack = rollbackPlaceToggle(new Set(['poi-b']), 'poi-a', true);
    expect([...rolledBack]).toEqual(['poi-b', 'poi-a']);
  });

  it('rollback après échec de suppression', () => {
    const rolledBack = rollbackPlaceToggle(new Set([]), 'poi-a', true);
    expect([...rolledBack]).toEqual(['poi-a']);
  });
});
