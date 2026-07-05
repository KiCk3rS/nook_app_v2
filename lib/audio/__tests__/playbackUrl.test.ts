import {
  computeListenPercent,
  isPlaybackUrlExpired,
  PLAYBACK_URL_EXPIRY_BUFFER_MS,
  PLAY_EVENT_THRESHOLD_PERCENT,
  shouldSendPlayEvent,
} from '../playbackUrl';

describe('isPlaybackUrlExpired', () => {
  it('retourne true si expiresAt est invalide', () => {
    expect(isPlaybackUrlExpired('invalid')).toBe(true);
  });

  it('retourne true dans la marge avant expiration', () => {
    const now = Date.parse('2026-07-05T12:00:00.000Z');
    const expiresAt = new Date(
      now + PLAYBACK_URL_EXPIRY_BUFFER_MS - 1000,
    ).toISOString();

    expect(isPlaybackUrlExpired(expiresAt, now)).toBe(true);
  });

  it('retourne false si l’URL est encore valide', () => {
    const now = Date.parse('2026-07-05T12:00:00.000Z');
    const expiresAt = new Date(now + 120_000).toISOString();

    expect(isPlaybackUrlExpired(expiresAt, now)).toBe(false);
  });
});

describe('shouldSendPlayEvent', () => {
  it('n’envoie pas si déjà envoyé', () => {
    expect(shouldSendPlayEvent(90, true)).toBe(false);
  });

  it('n’envoie pas sous le seuil', () => {
    expect(
      shouldSendPlayEvent(PLAY_EVENT_THRESHOLD_PERCENT - 1, false),
    ).toBe(false);
  });

  it('envoie à partir du seuil', () => {
    expect(
      shouldSendPlayEvent(PLAY_EVENT_THRESHOLD_PERCENT, false),
    ).toBe(true);
  });
});

describe('computeListenPercent', () => {
  it('borne entre 0 et 100', () => {
    expect(computeListenPercent(30, 100)).toBe(30);
    expect(computeListenPercent(150, 100)).toBe(100);
    expect(computeListenPercent(-5, 100)).toBe(0);
    expect(computeListenPercent(10, 0)).toBe(0);
  });
});
