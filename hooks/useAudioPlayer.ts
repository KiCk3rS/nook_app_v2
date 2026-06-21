import {
  setAudioModeAsync,
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useCallback, useEffect, useRef } from 'react';

import { DEMO_AUDIO_SOURCE } from '../constants/demoAudio';
import type { AudioGuide, MockPlace } from '../constants/mockPlaces';

const SKIP_BACK_SEC = 15;
const SKIP_FORWARD_SEC = 30;

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

export function useAudioPlayer({ guide, place, active }: UseAudioPlayerOptions) {
  const player = useExpoAudioPlayer(DEMO_AUDIO_SOURCE, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const lockScreenActiveRef = useRef(false);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    if (!active || !guide) {
      player.pause();
      void player.seekTo(0);
      if (lockScreenActiveRef.current) {
        player.setActiveForLockScreen(false);
        lockScreenActiveRef.current = false;
      }
      return;
    }

    player.play();
  }, [active, guide?.id, guide, player]);

  useEffect(() => {
    const metadata = getLockScreenMetadata(guide, place);

    if (!active || !metadata) {
      if (lockScreenActiveRef.current) {
        player.setActiveForLockScreen(false);
        lockScreenActiveRef.current = false;
      }
      return;
    }

    const enableLockScreen = () => {
      player.setActiveForLockScreen(true, metadata, LOCK_SCREEN_OPTIONS);
      lockScreenActiveRef.current = true;
    };

    if (lockScreenActiveRef.current) {
      player.updateLockScreenMetadata(metadata);
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
  ]);

  useEffect(() => {
    return () => {
      if (lockScreenActiveRef.current) {
        player.setActiveForLockScreen(false);
        lockScreenActiveRef.current = false;
      }
    };
  }, [player]);

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
    player.pause();
    void player.seekTo(0);
    if (lockScreenActiveRef.current) {
      player.setActiveForLockScreen(false);
      lockScreenActiveRef.current = false;
    }
  }, [player]);

  return {
    isPlaying,
    positionMs,
    durationMs,
    togglePlay,
    seekTo,
    skipBack,
    skipForward,
    pause,
    reset,
  };
}
