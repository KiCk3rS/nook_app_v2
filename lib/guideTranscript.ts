import { MOCK_GUIDE_TRANSCRIPTS } from '../constants/mockGuideTranscripts';
import type { TranscriptSegment } from '../types/api';

/** Transcript mock en mode démo ; API via `useGuideTranscript` / `fetchAudioTranscript`. */
export function getGuideTranscript(guideId: string): TranscriptSegment[] {
  return MOCK_GUIDE_TRANSCRIPTS[guideId] ?? [];
}

/** Index du segment actif selon la position de lecture (phrase par phrase). */
export function findActiveSegmentIndex(
  segments: TranscriptSegment[],
  positionMs: number,
): number {
  if (segments.length === 0) return -1;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (positionMs >= segment.startMs && positionMs < segment.endMs) {
      return i;
    }
  }

  const last = segments[segments.length - 1];
  if (positionMs >= last.endMs) {
    return segments.length - 1;
  }

  return -1;
}
