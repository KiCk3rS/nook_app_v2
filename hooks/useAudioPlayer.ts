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

export function useAudioPlayer({ guide, place, active }: UseAudioPlayerOptions) {
  const player = useExpoAudioPlayer(DEMO_AUDIO_SOURCE, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const lockScreenActiveRef = useRef(false);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(active);

  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [voiceBoostEnabled, setVoiceBoostEnabled] = useState(false);
  const [trimSilencesEnabled, setTrimSilencesEnabled] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<SleepTimerValue>({ mode: 'off' });

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

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

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
    if (!active || !guide) {
      runIfPlayerAvailable(() => {
        player.pause();
        void player.seekTo(0);
      });
      deactivateLockScreen();
      return;
    }

    runIfPlayerAvailable(() => {
      player.play();
    });
  }, [active, deactivateLockScreen, guide?.id, guide, player]);

  useEffect(() => {
    const metadata = getLockScreenMetadata(guide, place);

    if (!active || !metadata) {
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
    if (status.playing) {
      player.pause();
      return;
    }

    if (
      status.didJustFinish ||
      (status.duration > 0 && status.currentTime >= status.duration)
    ) {
      void player.seekTo(0);
    }

    player.play();
  }, [player, status.currentTime, status.didJustFinish, status.duration, status.playing]);

  const seekTo = useCallback(
    async (ms: number) => {
      const clampedSec = Math.min(Math.max(ms, 0), durationMs) / 1000;
      await player.seekTo(clampedSec);
    },
    [durationMs, player],
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
    togglePlay,
    seekTo,
    skipBack,
    skipForward,
    pause,
    reset,
    cyclePlaybackRate,
    setVoiceBoostEnabled,
    setTrimSilencesEnabled,
    setSleepTimer: setSleepTimerValue,
  };
}
