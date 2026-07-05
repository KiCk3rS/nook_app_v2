import {
  setAudioModeAsync,
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { DEMO_AUDIO_SOURCE } from '../constants/demoAudio';
import type { AudioGuide, MockPlace } from '../constants/mockPlaces';
import {
  PLAYBACK_RATES,
  type SleepTimerValue,
} from '../constants/audioPlayerOptions';
import { shouldUseMockData } from '../lib/config';
import { fetchPlaybackUrl } from '../lib/api/audios';
import { isPlaybackUrlExpired } from '../lib/audio/playbackUrl';
import { ApiError } from '../types/api';

const SKIP_BACK_SEC = 15;
const SKIP_FORWARD_SEC = 30;

function applyPlaybackRate(
  player: ReturnType<typeof useExpoAudioPlayer>,
  rate: number,
) {
  if (Platform.OS === 'android') {
    player.shouldCorrectPitch = true;
    player.setPlaybackRate(rate);
    return;
  }

  player.setPlaybackRate(rate, 'high');
}

const LOCK_SCREEN_OPTIONS = {
  showSeekForward: true,
  showSeekBackward: true,
} as const;

interface UseAudioPlayerOptions {
  guide: AudioGuide | null;
  place: MockPlace | null;
  /** Session active — false uniquement après dismiss explicite. */
  active: boolean;
  isMockSession: boolean;
}

function getFallbackDurationMs(guide: AudioGuide | null): number {
  return Math.max((guide?.durationSec ?? 180) * 1000, 1000);
}

function getLockScreenMetadata(guide: AudioGuide | null, place: MockPlace | null) {
  if (!guide || !place) {
    return null;
  }

  return {
    title: guide.title,
    artist: place.name,
    artworkUrl: place.imageUrl,
  };
}

function runIfPlayerAvailable(action: () => void) {
  try {
    action();
  } catch {
    // Native AudioPlayer already released (dismiss, hot reload, etc.)
  }
}
export function useAudioPlayer({
  guide,
  place,
  active,
  isMockSession,
}: UseAudioPlayerOptions) {
  const player = useExpoAudioPlayer(null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const lockScreenActiveRef = useRef(false);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(active);
  const playbackCacheRef = useRef<{ url: string; expiresAt: string } | null>(null);
  const loadRequestIdRef = useRef(0);

  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [voiceBoostEnabled, setVoiceBoostEnabled] = useState(false);
  const [trimSilencesEnabled, setTrimSilencesEnabled] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<SleepTimerValue>({ mode: 'off' });
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const useMockPlayback = shouldUseMockData(isMockSession);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const clearSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
  }, []);

  const deactivateLockScreen = useCallback(() => {
    if (!lockScreenActiveRef.current) {
      return;
    }

    runIfPlayerAvailable(() => {
      player.setActiveForLockScreen(false);
    });
    lockScreenActiveRef.current = false;
  }, [player]);

  const pauseIfActive = useCallback(() => {
    if (!activeRef.current) {
      return;
    }

    runIfPlayerAvailable(() => {
      player.pause();
    });
  }, [player]);

  const loadPlaybackSource = useCallback(
    async (poiId: string, audioId: string): Promise<boolean> => {
      const requestId = loadRequestIdRef.current + 1;
      loadRequestIdRef.current = requestId;
      setPlaybackLoading(true);
      setPlaybackError(null);

      if (useMockPlayback) {
        playbackCacheRef.current = null;
        runIfPlayerAvailable(() => {
          player.replace(DEMO_AUDIO_SOURCE);
        });
        if (loadRequestIdRef.current === requestId) {
          setPlaybackLoading(false);
        }
        return true;
      }

      try {
        const playback = await fetchPlaybackUrl(poiId, audioId);
        if (loadRequestIdRef.current !== requestId) {
          return false;
        }

        playbackCacheRef.current = {
          url: playback.playbackUrl,
          expiresAt: playback.expiresAt,
        };
        runIfPlayerAvailable(() => {
          player.replace({ uri: playback.playbackUrl });
        });
        return true;
      } catch (error) {
        if (loadRequestIdRef.current !== requestId) {
          return false;
        }

        playbackCacheRef.current = null;
        if (error instanceof ApiError && error.statusCode === 503) {
          setPlaybackError('playbackUnavailable');
        } else {
          setPlaybackError('playbackLoadFailed');
        }
        return false;
      } finally {
        if (loadRequestIdRef.current === requestId) {
          setPlaybackLoading(false);
        }
      }
    },
    [player, useMockPlayback],
  );

  const ensurePlaybackSource = useCallback(async (): Promise<boolean> => {
    if (!place || !guide) {
      return false;
    }

    if (useMockPlayback) {
      return true;
    }

    const cached = playbackCacheRef.current;
    if (!cached || isPlaybackUrlExpired(cached.expiresAt)) {
      return loadPlaybackSource(place.id, guide.id);
    }

    return true;
  }, [guide, loadPlaybackSource, place, useMockPlayback]);

  const retryPlayback = useCallback(() => {
    if (!place || !guide) {
      return;
    }
    void loadPlaybackSource(place.id, guide.id);
  }, [guide, loadPlaybackSource, place]);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    if (!active || !place || !guide) {
      playbackCacheRef.current = null;
      setPlaybackError(null);
      setPlaybackLoading(false);
      return;
    }

    void loadPlaybackSource(place.id, guide.id);
  }, [active, guide?.id, loadPlaybackSource, place?.id]);

  useEffect(() => {
    if (!active || sleepTimer.mode !== 'endOfGuide' || !status.didJustFinish) {
      return;
    }

    pauseIfActive();
    setSleepTimer({ mode: 'off' });
  }, [active, pauseIfActive, sleepTimer.mode, status.didJustFinish]);

  useEffect(() => {
    clearSleepTimer();

    if (!active || sleepTimer.mode !== 'minutes' || !sleepTimer.minutes) {
      return;
    }

    sleepTimerRef.current = setTimeout(() => {
      if (!activeRef.current) {
        return;
      }

      pauseIfActive();
      setSleepTimer({ mode: 'off' });
    }, sleepTimer.minutes * 60 * 1000);

    return clearSleepTimer;
  }, [active, clearSleepTimer, pauseIfActive, sleepTimer]);

  useEffect(() => {
    if (!active || !guide || playbackError || playbackLoading) {
      if (!active || !guide) {
        runIfPlayerAvailable(() => {
          player.pause();
          void player.seekTo(0);
        });
        deactivateLockScreen();
      }
      return;
    }

    void (async () => {
      const ready = await ensurePlaybackSource();
      if (!ready || !activeRef.current) {
        return;
      }

      runIfPlayerAvailable(() => {
        player.play();
      });
    })();
  }, [
    active,
    deactivateLockScreen,
    ensurePlaybackSource,
    guide,
    playbackError,
    playbackLoading,
    player,
  ]);

  useEffect(() => {
    const metadata = getLockScreenMetadata(guide, place);

    if (!active || !metadata || playbackError) {
      deactivateLockScreen();
      return;
    }

    const enableLockScreen = () => {
      if (!activeRef.current) {
        return;
      }

      runIfPlayerAvailable(() => {
        player.setActiveForLockScreen(true, metadata, LOCK_SCREEN_OPTIONS);
        lockScreenActiveRef.current = true;
      });
    };

    if (lockScreenActiveRef.current) {
      runIfPlayerAvailable(() => {
        player.updateLockScreenMetadata(metadata);
      });
      return;
    }

    const timer = setTimeout(enableLockScreen, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [
    active,
    guide?.id,
    guide?.title,
    place?.id,
    place?.name,
    place?.imageUrl,
    playbackError,
    player,
    status.playing,
    deactivateLockScreen,
  ]);

  useEffect(() => {
    return () => {
      clearSleepTimer();
      deactivateLockScreen();
    };
  }, [clearSleepTimer, deactivateLockScreen]);

  const isPlaying = status.playing;
  const positionMs = Math.round(status.currentTime * 1000);
  const durationMs =
    status.duration > 0
      ? Math.round(status.duration * 1000)
      : getFallbackDurationMs(guide);

  const togglePlay = useCallback(() => {
    if (playbackError) {
      retryPlayback();
      return;
    }

    if (status.playing) {
      player.pause();
      return;
    }

    void (async () => {
      const ready = await ensurePlaybackSource();
      if (!ready) {
        return;
      }

      if (
        status.didJustFinish ||
        (status.duration > 0 && status.currentTime >= status.duration)
      ) {
        void player.seekTo(0);
      }

      player.play();
    })();
  }, [
    ensurePlaybackSource,
    playbackError,
    player,
    retryPlayback,
    status.currentTime,
    status.didJustFinish,
    status.duration,
    status.playing,
  ]);

  const seekTo = useCallback(
    async (ms: number) => {
      const ready = await ensurePlaybackSource();
      if (!ready) {
        return;
      }

      const clampedSec = Math.min(Math.max(ms, 0), durationMs) / 1000;
      await player.seekTo(clampedSec);
    },
    [durationMs, ensurePlaybackSource, player],
  );

  const skipBack = useCallback(() => {
    void seekTo(positionMs - SKIP_BACK_SEC * 1000);
  }, [positionMs, seekTo]);

  const skipForward = useCallback(() => {
    void seekTo(positionMs + SKIP_FORWARD_SEC * 1000);
  }, [positionMs, seekTo]);

  const pause = useCallback(() => {
    player.pause();
  }, [player]);

  const reset = useCallback(() => {
    clearSleepTimer();
    activeRef.current = false;
    playbackCacheRef.current = null;
    setPlaybackError(null);
    setPlaybackLoading(false);
    runIfPlayerAvailable(() => {
      player.pause();
      void player.seekTo(0);
      applyPlaybackRate(player, 1);
    });
    setPlaybackRateState(1);
    setVoiceBoostEnabled(false);
    setTrimSilencesEnabled(false);
    setSleepTimer({ mode: 'off' });
    deactivateLockScreen();
  }, [clearSleepTimer, deactivateLockScreen, player]);

  const cyclePlaybackRate = useCallback(() => {
    const currentIndex = PLAYBACK_RATES.findIndex((rate) => rate === playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length] ?? 1;
    applyPlaybackRate(player, nextRate);
    setPlaybackRateState(nextRate);
  }, [playbackRate, player]);

  const setSleepTimerValue = useCallback((value: SleepTimerValue) => {
    setSleepTimer(value);
  }, []);

  return {
    isPlaying,
    positionMs,
    durationMs,
    playbackRate,
    voiceBoostEnabled,
    trimSilencesEnabled,
    sleepTimer,
    playbackLoading,
    playbackError,
    togglePlay,
    seekTo,
    skipBack,
    skipForward,
    pause,
    reset,
    retryPlayback,
    cyclePlaybackRate,
    setVoiceBoostEnabled,
    setTrimSilencesEnabled,
    setSleepTimer: setSleepTimerValue,
  };
}
