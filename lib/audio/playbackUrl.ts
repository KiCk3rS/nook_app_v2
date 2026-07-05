/** Marge avant expiration pour re-fetcher l'URL signée (ms). */
export const PLAYBACK_URL_EXPIRY_BUFFER_MS = 30_000;

/** Seuil d'écoute (%) pour envoyer un play-event (F-013). */
export const PLAY_EVENT_THRESHOLD_PERCENT = 80;

export function isPlaybackUrlExpired(
  expiresAt: string,
  nowMs: number = Date.now(),
): boolean {
  const expiryMs = Date.parse(expiresAt);
  if (Number.isNaN(expiryMs)) {
    return true;
  }
  return expiryMs - PLAYBACK_URL_EXPIRY_BUFFER_MS <= nowMs;
}

export function computeListenPercent(
  positionSeconds: number,
  durationSeconds: number,
): number {
  if (durationSeconds <= 0) {
    return 0;
  }
  const ratio = positionSeconds / durationSeconds;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

export function shouldSendPlayEvent(
  listenPercent: number,
  alreadySent: boolean,
  thresholdPercent: number = PLAY_EVENT_THRESHOLD_PERCENT,
): boolean {
  if (alreadySent) {
    return false;
  }
  return listenPercent >= thresholdPercent;
}

export function createPlayEventClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `play-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
