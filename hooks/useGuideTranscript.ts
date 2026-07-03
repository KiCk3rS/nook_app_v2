import { useMemo } from 'react';

import { getGuideTranscript, type GuideTranscriptSegment } from '../lib/guideTranscript';

export function useGuideTranscript(guideId: string): GuideTranscriptSegment[] {
  return useMemo(() => getGuideTranscript(guideId), [guideId]);
}
