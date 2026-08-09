import type {
  AudioTrack,
  ListAudiosResponse,
  PlaybackUrl,
  PlayEventPayload,
} from '../../types/api';
import { apiRequest } from './client';

export function fetchAudiosForPoi(poiId: string): Promise<AudioTrack[]> {
  return apiRequest<ListAudiosResponse>(
    `/pois/${encodeURIComponent(poiId)}/audios`,
  ).then((response) => response.audios);
}

export function fetchPlaybackUrl(
  poiId: string,
  audioId: string,
): Promise<PlaybackUrl> {
  return apiRequest<PlaybackUrl>(
    `/pois/${encodeURIComponent(poiId)}/audios/${encodeURIComponent(audioId)}/playback`,
    { auth: true },
  );
}

/** Auth optionnelle : envoie le Bearer s'il est en mémoire (F-013). */
export function postPlayEvent(
  poiId: string,
  payload: PlayEventPayload,
): Promise<void> {
  return apiRequest<void>(`/pois/${encodeURIComponent(poiId)}/play-event`, {
    method: 'POST',
    auth: true,
    body: payload,
  });
}
