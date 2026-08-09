import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { fetchAudioTranscript } from '../lib/api/transcripts';
import { shouldUseMockData } from '../lib/config';
import { getGuideTranscript } from '../lib/guideTranscript';
import type { TranscriptSegment } from '../types/api';

export interface UseGuideTranscriptResult {
  segments: TranscriptSegment[];
  loading: boolean;
}

export function useGuideTranscript(
  poiId: string,
  guideId: string,
): UseGuideTranscriptResult {
  const { isMockSession } = useAuth();
  const useMock = shouldUseMockData(isMockSession);

  const [segments, setSegments] = useState<TranscriptSegment[]>(() =>
    useMock ? getGuideTranscript(guideId) : [],
  );
  const [loading, setLoading] = useState(() => !useMock);

  useEffect(() => {
    if (useMock) {
      setSegments(getGuideTranscript(guideId));
      setLoading(false);
      return;
    }

    if (!poiId || !guideId) {
      setSegments([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchAudioTranscript(poiId, guideId)
      .then((next) => {
        if (!cancelled) {
          setSegments(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSegments([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [guideId, poiId, useMock]);

  return { segments, loading };
}
