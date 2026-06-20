import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAudioPlayback } from '../../contexts/AudioPlaybackContext';
import { tabBarHeight } from '../../constants/theme';
import { AudioPlayerSheet } from '../place/AudioPlayerSheet';
import { AudioMiniPlayer } from './AudioMiniPlayer';

export function GlobalAudioChrome() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const {
    place,
    guide,
    viewMode,
    isPlaying,
    positionMs,
    durationMs,
    minimize,
    expand,
    dismiss,
    togglePlay,
    skipBack,
    skipForward,
    seekTo,
  } = useAudioPlayback();

  const isInTabs = segments[0] === '(tabs)';
  const miniPlayerBottom = isInTabs ? tabBarHeight + insets.bottom : 0;
  const miniPlayerSafeAreaBottom = isInTabs ? 0 : insets.bottom;

  if (!place || !guide || viewMode === 'idle') {
    return null;
  }

  return (
    <>
      {viewMode === 'mini' ? (
        <AudioMiniPlayer
          place={place}
          guide={guide}
          isPlaying={isPlaying}
          positionMs={positionMs}
          durationMs={durationMs}
          bottom={miniPlayerBottom}
          safeAreaBottom={miniPlayerSafeAreaBottom}
          onExpand={expand}
          onTogglePlay={togglePlay}
          onDismiss={dismiss}
        />
      ) : null}

      {viewMode === 'expanded' ? (
        <AudioPlayerSheet
          visible
          place={place}
          guide={guide}
          isPlaying={isPlaying}
          positionMs={positionMs}
          durationMs={durationMs}
          onMinimize={minimize}
          onTogglePlay={togglePlay}
          onSkipBack={skipBack}
          onSkipForward={skipForward}
          onSeek={seekTo}
        />
      ) : null}
    </>
  );
}
