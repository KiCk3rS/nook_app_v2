import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AudioGuide, MockPlace } from '../constants/mockPlaces';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export type AudioPlayerViewMode = 'idle' | 'mini' | 'expanded';

interface AudioPlaybackContextValue {
  place: MockPlace | null;
  guide: AudioGuide | null;
  viewMode: AudioPlayerViewMode;
  activeGuideId: string | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  startPlayback: (place: MockPlace, guide: AudioGuide) => void;
  minimize: () => void;
  expand: () => void;
  dismiss: () => void;
  togglePlay: () => void;
  seekTo: (ms: number) => void;
  skipBack: () => void;
  skipForward: () => void;
}

const AudioPlaybackContext = createContext<AudioPlaybackContextValue | null>(null);

export function AudioPlaybackProvider({ children }: { children: ReactNode }) {
  const [place, setPlace] = useState<MockPlace | null>(null);
  const [guide, setGuide] = useState<AudioGuide | null>(null);
  const [viewMode, setViewMode] = useState<AudioPlayerViewMode>('idle');

  const sessionActive = viewMode !== 'idle' && guide !== null;

  const playback = useAudioPlayer({ guide, place, active: sessionActive });
  const { togglePlay, reset, isPlaying, positionMs, durationMs, seekTo, skipBack, skipForward } =
    playback;

  const startPlayback = useCallback(
    (nextPlace: MockPlace, nextGuide: AudioGuide) => {
      if (guide?.id === nextGuide.id && viewMode !== 'idle') {
        togglePlay();
        return;
      }

      setPlace(nextPlace);
      setGuide(nextGuide);
      setViewMode('expanded');
    },
    [guide?.id, togglePlay, viewMode],
  );

  const minimize = useCallback(() => {
    if (!guide) return;
    setViewMode('mini');
  }, [guide]);

  const expand = useCallback(() => {
    if (!guide) return;
    setViewMode('expanded');
  }, [guide]);

  const dismiss = useCallback(() => {
    reset();
    setPlace(null);
    setGuide(null);
    setViewMode('idle');
  }, [reset]);

  const value = useMemo<AudioPlaybackContextValue>(
    () => ({
      place,
      guide,
      viewMode,
      activeGuideId: guide?.id ?? null,
      isPlaying,
      positionMs,
      durationMs,
      startPlayback,
      minimize,
      expand,
      dismiss,
      togglePlay,
      seekTo,
      skipBack,
      skipForward,
    }),
    [
      place,
      guide,
      viewMode,
      isPlaying,
      positionMs,
      durationMs,
      togglePlay,
      seekTo,
      skipBack,
      skipForward,
      startPlayback,
      minimize,
      expand,
      dismiss,
    ],
  );

  return (
    <AudioPlaybackContext.Provider value={value}>
      {children}
    </AudioPlaybackContext.Provider>
  );
}

export function useAudioPlayback(): AudioPlaybackContextValue {
  const context = useContext(AudioPlaybackContext);
  if (!context) {
    throw new Error('useAudioPlayback must be used within AudioPlaybackProvider');
  }
  return context;
}
