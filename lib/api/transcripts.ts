import type { AudioTranscriptResponse, TranscriptSegment } from '../../types/api';
import { apiRequest } from './client';

export async function fetchAudioTranscript(
  poiId: string,
  audioId: string,
): Promise<TranscriptSegment[]> {
  const body = await apiRequest<AudioTranscriptResponse>(
    `/pois/${encodeURIComponent(poiId)}/audios/${encodeURIComponent(audioId)}/transcript`,
    { auth: true },
  );
  return Array.isArray(body?.segments) ? body.segments : [];
}
