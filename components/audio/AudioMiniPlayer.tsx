import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatAudioDurationClock } from '../../constants/mockPlaces';
import {
  colors,
  miniPlayerHeight,
  radius,
  spacing,
  textStyle,
  zIndex,
} from '../../constants/theme';
import type { AudioGuide, MockPlace } from '../../constants/mockPlaces';

interface AudioMiniPlayerProps {
  place: MockPlace;
  guide: AudioGuide;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  /** Distance du bas de l'écran au bas du conteneur. */
  bottom: number;
  /** Padding interne bas (safe area quand pas de tab bar). */
  safeAreaBottom: number;
  onExpand: () => void;
  onTogglePlay: () => void;
  onDismiss: () => void;
}

export function AudioMiniPlayer({
  place,
  guide,
  isPlaying,
  positionMs,
  durationMs,
  bottom,
  safeAreaBottom,
  onExpand,
  onTogglePlay,
  onDismiss,
}: AudioMiniPlayerProps) {
  const progress = durationMs > 0 ? positionMs / durationMs : 0;
  const positionLabel = formatAudioDurationClock(Math.floor(positionMs / 1000));
  const durationLabel = formatAudioDurationClock(Math.floor(durationMs / 1000));

  return (
    <View
      style={[
        styles.container,
        {
          bottom,
          paddingBottom: safeAreaBottom,
          borderBottomWidth: safeAreaBottom > 0 ? 0 : 1,
        },
      ]}
      accessibilityRole="none"
    >
      <View style={styles.progressTrack} accessibilityElementsHidden>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.row}>
        <Pressable
          style={({ pressed }) => [styles.mainArea, pressed && styles.mainAreaPressed]}
          onPress={onExpand}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le lecteur"
        >
          <Image
            source={{ uri: place.imageUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {guide.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {place.name} • {positionLabel} / {durationLabel}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
          onPress={onTogglePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Mettre en pause' : 'Lire le guide'}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color={colors.onPrimary}
            style={!isPlaying ? styles.playIconOffset : undefined}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.dismissButton, pressed && styles.dismissPressed]}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fermer le lecteur"
          hitSlop={8}
        >
          <Ionicons name="close" size={22} color={colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const THUMBNAIL_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceStrong,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    zIndex: zIndex.miniPlayer,
    elevation: 0,
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.hairline,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: miniPlayerHeight,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },
  mainAreaPressed: {
    opacity: 0.85,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: radius.full,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },
  title: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  subtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonPressed: {
    backgroundColor: colors.primaryActive,
  },
  playIconOffset: {
    marginLeft: 2,
  },
  dismissButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissPressed: {
    opacity: 0.7,
  },
});
