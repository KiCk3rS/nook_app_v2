import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { AudioGuide, MockPlace } from '../constants/mockPlaces';
import type { SleepTimerValue } from '../constants/audioPlayerOptions';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { usePlaybackEngagement } from '../hooks/usePlaybackEngagement';
import { trackAudioPlayerExpand, trackAudioThemeSelect } from '../lib/analytics';
import { useAuth } from './AuthContext';

export type AudioPlayerViewMode = 'idle' | 'mini' | 'expanded';

interface AudioPlaybackContextValue {
  place: MockPlace | null;
  guide: AudioGuide | null;
  playbackGuides: AudioGuide[];
  viewMode: AudioPlayerViewMode;
  activeGuideId: string | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  playbackLoading: boolean;
  playbackError: string | null;
  startPlayback: (place: MockPlace, guide: AudioGuide, guides?: AudioGuide[]) => void;
  syncPlaybackGuides: (guides: AudioGuide[]) => void;
  switchGuide: (guideId: string) => void;
  minimize: () => void;
  expand: () => void;
  dismiss: () => void;
  togglePlay: () => void;
  pause: () => void;
  seekTo: (ms: number) => void;
  skipBack: () => void;
  skipForward: () => void;
  retryPlayback: () => void;
  playbackRate: number;
  voiceBoostEnabled: boolean;
  trimSilencesEnabled: boolean;
  sleepTimer: SleepTimerValue;
  cyclePlaybackRate: () => void;
  setVoiceBoostEnabled: (enabled: boolean) => void;
  setTrimSilencesEnabled: (enabled: boolean) => void;
  setSleepTimer: (value: SleepTimerValue) => void;
}

const AudioPlaybackContext = createContext<AudioPlaybackContextValue | null>(null);

export function AudioPlaybackProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isMockSession } = useAuth();
  const [place, setPlace] = useState<MockPlace | null>(null);
  const [guide, setGuide] = useState<AudioGuide | null>(null);
  const [playbackGuides, setPlaybackGuides] = useState<AudioGuide[]>([]);
  const [viewMode, setViewMode] = useState<AudioPlayerViewMode>('idle');

  const sessionActive = viewMode !== 'idle' && guide !== null;

  const playback = useAudioPlayer({
    guide,
    place,
    active: sessionActive,
    isMockSession,
  });
  const {
    togglePlay,
    pause,
    reset,
    isPlaying,
    positionMs,
    durationMs,
    playbackLoading,
    playbackError,
    seekTo,
    skipBack,
    skipForward,
    retryPlayback,
    playbackRate,
    voiceBoostEnabled,
    trimSilencesEnabled,
    sleepTimer,
    cyclePlaybackRate,
    setVoiceBoostEnabled,
    setTrimSilencesEnabled,
    setSleepTimer,
  } = playback;

  usePlaybackEngagement({
    poiId: place?.id ?? null,
    audioId: guide?.id ?? null,
    positionMs,
    durationMs,
    isPlaying,
    active: sessionActive,
    viewMode,
    isAuthenticated,
    isMockSession,
  });

  const startPlayback = useCallback(
    (nextPlace: MockPlace, nextGuide: AudioGuide, guides?: AudioGuide[]) => {
      if (guide?.id === nextGuide.id && viewMode !== 'idle') {
        togglePlay();
        return;
      }

      setPlace(nextPlace);
      setGuide(nextGuide);
      setPlaybackGuides(guides ?? nextPlace.audioGuides);
      setViewMode('expanded');
      trackAudioPlayerExpand(nextPlace.id, nextGuide.id);
    },
    [guide?.id, togglePlay, viewMode],
  );

  const syncPlaybackGuides = useCallback((guides: AudioGuide[]) => {
    setPlaybackGuides(guides);
  }, []);

  const switchGuide = useCallback(
    (guideId: string) => {
      if (!place || !guide) return;
      const nextGuide = playbackGuides.find(
        (item) => item.id === guideId && item.status === 'ready',
      );
      if (!nextGuide || nextGuide.id === guide.id) return;
      trackAudioThemeSelect(place.id, guide.id, guideId);
      setGuide(nextGuide);
    },
    [place, guide, playbackGuides],
  );

  const minimize = useCallback(() => {
    if (!guide) return;
    setViewMode('mini');
  }, [guide]);

  const expand = useCallback(() => {
    if (!guide || !place) return;
    setViewMode('expanded');
    trackAudioPlayerExpand(place.id, guide.id);
  }, [guide, place]);

  const dismiss = useCallback(() => {
    reset();
    setPlace(null);
    setGuide(null);
    setPlaybackGuides([]);
    setViewMode('idle');
  }, [reset]);

  const value = useMemo<AudioPlaybackContextValue>(
    () => ({
      place,
      guide,
      playbackGuides,
      viewMode,
      activeGuideId: guide?.id ?? null,
      isPlaying,
      positionMs,
      durationMs,
      playbackLoading,
      playbackError,
      startPlayback,
      syncPlaybackGuides,
      switchGuide,
      minimize,
      expand,
      dismiss,
      togglePlay,
      pause,
      seekTo,
      skipBack,
      skipForward,
      retryPlayback,
      playbackRate,
      voiceBoostEnabled,
      trimSilencesEnabled,
      sleepTimer,
      cyclePlaybackRate,
      setVoiceBoostEnabled,
      setTrimSilencesEnabled,
      setSleepTimer,
    }),
    [
      place,
      guide,
      playbackGuides,
      viewMode,
      isPlaying,
      positionMs,
      durationMs,
      playbackLoading,
      playbackError,
      togglePlay,
      pause,
      seekTo,
      skipBack,
      skipForward,
      retryPlayback,
      playbackRate,
      voiceBoostEnabled,
      trimSilencesEnabled,
      sleepTimer,
      cyclePlaybackRate,
      setVoiceBoostEnabled,
      setTrimSilencesEnabled,
      setSleepTimer,
      startPlayback,
      syncPlaybackGuides,
      switchGuide,
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
