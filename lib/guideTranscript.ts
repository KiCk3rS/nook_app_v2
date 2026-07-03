import { MOCK_GUIDE_TRANSCRIPTS } from '../constants/mockGuideTranscripts';

export interface GuideTranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
}

/** Transcript d'un guide — mock aujourd'hui, branchement API prévu (F-016). */
export function getGuideTranscript(guideId: string): GuideTranscriptSegment[] {
  return MOCK_GUIDE_TRANSCRIPTS[guideId] ?? [];
}

/** Index du segment actif selon la position de lecture (phrase par phrase). */
export function findActiveSegmentIndex(
  segments: GuideTranscriptSegment[],
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
