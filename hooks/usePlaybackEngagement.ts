import { useCallback, useEffect, useRef } from 'react';

import { postPlayEvent } from '../lib/api/audios';
import { postListenProgress } from '../lib/api/listenHistory';
import {
  computeListenPercent,
  createPlayEventClientId,
  PLAY_EVENT_THRESHOLD_PERCENT,
  shouldSendPlayEvent,
} from '../lib/audio/playbackUrl';
import { shouldUseMockData } from '../lib/config';

const LISTEN_HISTORY_SYNC_INTERVAL_MS = 30_000;

export type PlaybackEngagementViewMode = 'idle' | 'mini' | 'expanded';

export interface UsePlaybackEngagementOptions {
  poiId: string | null;
  audioId: string | null;
  positionMs: number;
  durationMs: number;
  isPlaying: boolean;
  active: boolean;
  viewMode: PlaybackEngagementViewMode;
  isAuthenticated: boolean;
  isMockSession: boolean;
}

export function usePlaybackEngagement({
  poiId,
  audioId,
  positionMs,
  durationMs,
  isPlaying,
  active,
  viewMode,
  isAuthenticated,
  isMockSession,
}: UsePlaybackEngagementOptions) {
  const playEventSentRef = useRef(false);
  const clientEventIdRef = useRef(createPlayEventClientId());
  const prevListenPercentRef = useRef(0);
  const positionRef = useRef(positionMs);
  const prevIsPlayingRef = useRef(isPlaying);
  const prevViewModeRef = useRef(viewMode);
  const useMockLayer = shouldUseMockData(isMockSession);

  positionRef.current = positionMs;

  useEffect(() => {
    playEventSentRef.current = false;
    clientEventIdRef.current = createPlayEventClientId();
    prevListenPercentRef.current = 0;
  }, [audioId]);

  const syncListenHistory = useCallback(
    async (targetAudioId: string, progressSeconds: number) => {
      if (!isAuthenticated || useMockLayer) {
        return;
      }

      try {
        await postListenProgress({
          audioId: targetAudioId,
          poiId: poiId ?? undefined,
          progressSeconds: Math.max(0, Math.round(progressSeconds)),
        });
      } catch {
        // Engagement best-effort — ne pas bloquer la lecture.
      }
    },
    [isAuthenticated, poiId, useMockLayer],
  );

  const flushCurrentProgress = useCallback(
    (targetAudioId: string = audioId ?? '') => {
      if (!targetAudioId) {
        return;
      }
      void syncListenHistory(targetAudioId, positionRef.current / 1000);
    },
    [audioId, syncListenHistory],
  );

  useEffect(() => {
    if (!active || !poiId || !audioId || useMockLayer) {
      return;
    }

    const listenPercent = computeListenPercent(
      positionMs / 1000,
      durationMs / 1000,
    );
    const prevListenPercent = prevListenPercentRef.current;
    prevListenPercentRef.current = listenPercent;

    const crossedThreshold =
      prevListenPercent < PLAY_EVENT_THRESHOLD_PERCENT &&
      listenPercent >= PLAY_EVENT_THRESHOLD_PERCENT;

    if (
      !crossedThreshold ||
      !shouldSendPlayEvent(listenPercent, playEventSentRef.current)
    ) {
      return;
    }

    playEventSentRef.current = true;
    void postPlayEvent(poiId, {
      audioId,
      listenPercent,
      clientEventId: clientEventIdRef.current,
    }).catch(() => {
      playEventSentRef.current = false;
    });
  }, [active, audioId, durationMs, poiId, positionMs, useMockLayer]);

  useEffect(() => {
    if (!active || !isPlaying || !isAuthenticated || useMockLayer || !audioId) {
      return;
    }

    const timer = setInterval(() => {
      flushCurrentProgress(audioId);
    }, LISTEN_HISTORY_SYNC_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [active, audioId, flushCurrentProgress, isAuthenticated, isPlaying, useMockLayer]);

  useEffect(() => {
    if (prevIsPlayingRef.current && !isPlaying && active && audioId) {
      flushCurrentProgress(audioId);
    }
    prevIsPlayingRef.current = isPlaying;
  }, [active, audioId, flushCurrentProgress, isPlaying]);

  useEffect(() => {
    if (
      prevViewModeRef.current === 'expanded' &&
      viewMode !== 'expanded' &&
      active &&
      audioId
    ) {
      flushCurrentProgress(audioId);
    }
    prevViewModeRef.current = viewMode;
  }, [active, audioId, flushCurrentProgress, viewMode]);

  useEffect(() => {
    const snapshot = {
      audioId,
      poiId,
      active,
    };

    return () => {
      if (!snapshot.active || !snapshot.audioId || useMockLayer || !isAuthenticated) {
        return;
      }
      void postListenProgress({
        audioId: snapshot.audioId,
        poiId: snapshot.poiId ?? undefined,
        progressSeconds: Math.max(0, Math.round(positionRef.current / 1000)),
      }).catch(() => {
        // best-effort
      });
    };
  }, [active, audioId, isAuthenticated, poiId, useMockLayer]);
}
