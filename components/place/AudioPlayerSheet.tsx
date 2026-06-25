import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BlurView, BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type View as RNView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SleepTimerValue } from '../../constants/audioPlayerOptions';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import { formatAudioDurationClock, type AudioGuide, type MockPlace } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { AudioDiscussionPanel } from './AudioDiscussionPanel';
import { AudioOptionsPanel } from './AudioOptionsPanel';

type PlayerMenuId = 'content' | 'options' | 'discussion' | 'themes';

const PLAYER_MENU: Array<{
  id: PlayerMenuId;
  labelKey: 'menuContent' | 'menuOptions' | 'menuDiscussion' | 'menuThemes';
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: 'content', labelKey: 'menuContent', icon: 'document-text-outline' },
  { id: 'options', labelKey: 'menuOptions', icon: 'settings-outline' },
  { id: 'discussion', labelKey: 'menuDiscussion', icon: 'chatbubble-outline' },
  { id: 'themes', labelKey: 'menuThemes', icon: 'sparkles-outline' },
];

const ARTWORK_SIZE = 220;

/** Encre `{colors.ink}` — stops du dégradé hero (contraste texte clair). */
const INK_RGB = '14, 17, 22';

const HERO_GRADIENT_COLORS = [
  'transparent',
  `rgba(${INK_RGB}, 0.22)`,
  `rgba(${INK_RGB}, 0.52)`,
  `rgba(${INK_RGB}, 0.78)`,
  `rgba(${INK_RGB}, 0.92)`,
] as const;

const HERO_GRADIENT_LOCATIONS = [0, 0.28, 0.52, 0.78, 1] as const;

interface AudioPlayerSheetProps {
  visible: boolean;
  place: MockPlace;
  guide: AudioGuide;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  playbackRate: number;
  voiceBoostEnabled: boolean;
  trimSilencesEnabled: boolean;
  sleepTimer: SleepTimerValue;
  onMinimize: () => void;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSeek: (ms: number) => void;
  onCyclePlaybackRate: () => void;
  onVoiceBoostChange: (enabled: boolean) => void;
  onTrimSilencesChange: (enabled: boolean) => void;
  onSleepTimerChange: (value: SleepTimerValue) => void;
}

export function AudioPlayerSheet({
  visible,
  place,
  guide,
  isPlaying,
  positionMs,
  durationMs,
  playbackRate,
  voiceBoostEnabled,
  trimSilencesEnabled,
  sleepTimer,
  onMinimize,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  onSeek,
  onCyclePlaybackRate,
  onVoiceBoostChange,
  onTrimSilencesChange,
  onSleepTimerChange,
}: AudioPlayerSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['common', 'audioPlayer']);
  const [activeMenuId, setActiveMenuId] = useState<PlayerMenuId | null>(null);
  const trackWidthRef = useRef(0);
  const blurTargetRef = useRef<RNView | null>(null);
  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onMinimize();
      return true;
    });
    return () => sub.remove();
  }, [visible, onMinimize]);

  const handleSeekPress = useCallback(
    (locationX: number) => {
      if (trackWidthRef.current <= 0) return;
      const ratio = Math.min(Math.max(locationX / trackWidthRef.current, 0), 1);
      onSeek(ratio * durationMs);
    },
    [durationMs, onSeek],
  );

  useEffect(() => {
    if (!visible) {
      setActiveMenuId(null);
    }
  }, [visible]);

  function handleMenuPress(menuId: PlayerMenuId) {
    if (menuId === 'content') {
      setActiveMenuId(null);
      return;
    }

    if (menuId === 'options') {
      setActiveMenuId((current) => (current === 'options' ? null : 'options'));
      return;
    }

    if (menuId === 'discussion') {
      setActiveMenuId((current) => (current === 'discussion' ? null : 'discussion'));
      return;
    }

    setActiveMenuId(null);
  }

  const showOptionsPanel = activeMenuId === 'options';
  const showDiscussionPanel = activeMenuId === 'discussion';
  const showPlayerControls = !showOptionsPanel && !showDiscussionPanel;
  const keyboardHeight = useKeyboardHeight(showDiscussionPanel);
  const keyboardOffset = Math.max(0, keyboardHeight - insets.bottom);
  const compactHero = showDiscussionPanel && keyboardOffset > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onMinimize}
      accessibilityViewIsModal
    >
      <View style={styles.root}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <BlurTargetView ref={blurTargetRef} style={styles.backgroundTarget}>
            <Image
              source={{ uri: place.imageUrl }}
              style={styles.backgroundImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          </BlurTargetView>
          <BlurView
            blurTarget={blurTargetRef}
            intensity={80}
            tint="default"
            blurMethod={
              Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined
            }
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.backgroundScrim} />
          <LinearGradient
            colors={[...HERO_GRADIENT_COLORS]}
            locations={[...HERO_GRADIENT_LOCATIONS]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.heroGradient}
            pointerEvents="none"
          />
        </View>

        <View style={[styles.content, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            style={({ pressed }) => [styles.dismissButton, pressed && styles.dismissPressed]}
            onPress={onMinimize}
            accessibilityRole="button"
            accessibilityLabel={t('minimizePlayer')}
            hitSlop={8}
          >
            <Ionicons name="chevron-down" size={22} color={colors.onDark} />
          </Pressable>

          <View style={[styles.hero, compactHero && styles.heroCompact]}>
            <View style={[styles.artworkWrap, compactHero && styles.artworkWrapCompact]}>
              <Image
                source={{ uri: place.imageUrl }}
                style={styles.artwork}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            </View>
            <Text style={styles.guideTitle} accessibilityRole="header">
              {guide.title}
            </Text>
            <Text style={styles.placeName}>{place.name}</Text>
          </View>

          <View
            style={[
              styles.panel,
              showDiscussionPanel && styles.panelDiscussion,
              {
                paddingBottom: Math.max(insets.bottom, spacing.lg),
                marginBottom: keyboardOffset,
              },
            ]}
          >
            {showOptionsPanel ? (
              <AudioOptionsPanel
                playbackRate={playbackRate}
                voiceBoostEnabled={voiceBoostEnabled}
                trimSilencesEnabled={trimSilencesEnabled}
                sleepTimer={sleepTimer}
                onCyclePlaybackRate={onCyclePlaybackRate}
                onVoiceBoostChange={onVoiceBoostChange}
                onTrimSilencesChange={onTrimSilencesChange}
                onSleepTimerChange={onSleepTimerChange}
              />
            ) : showDiscussionPanel ? (
              <View style={styles.discussionWrap}>
                <AudioDiscussionPanel
                  poiId={place.id}
                  poiName={place.name}
                  guideTitle={guide.title}
                  enabled={showDiscussionPanel}
                />
              </View>
            ) : showPlayerControls ? (
              <>
                <View style={styles.timelineBlock}>
                  <Pressable
                    style={styles.progressTrack}
                    onLayout={(event) => {
                      trackWidthRef.current = event.nativeEvent.layout.width;
                    }}
                    onPress={(event) => handleSeekPress(event.nativeEvent.locationX)}
                    accessibilityRole="adjustable"
                    accessibilityLabel={t('common:audioPosition')}
                    accessibilityValue={{
                      min: 0,
                      max: durationMs,
                      now: positionMs,
                      text: `${formatAudioDurationClock(Math.floor(positionMs / 1000))} sur ${formatAudioDurationClock(Math.floor(durationMs / 1000))}`,
                    }}
                  >
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
                  </Pressable>
                  <View style={styles.timeRow}>
                    <Text style={styles.timeText}>
                      {formatAudioDurationClock(Math.floor(positionMs / 1000))}
                    </Text>
                    <Text style={styles.timeText}>
                      {formatAudioDurationClock(Math.floor(durationMs / 1000))}
                    </Text>
                  </View>
                </View>

                <View style={styles.controlsRow}>
                  <Pressable
                    style={styles.skipButton}
                    onPress={onSkipBack}
                    accessibilityRole="button"
                    accessibilityLabel={t('common:rewind15')}
                  >
                    <Ionicons name="play-back" size={28} color={colors.ink} />
                    <Text style={styles.skipLabel}>15 s</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.playButton,
                      pressed && styles.playButtonPressed,
                    ]}
                    onPress={onTogglePlay}
                    accessibilityRole="button"
                    accessibilityLabel={isPlaying ? t('common:pauseGuide') : t('common:playGuide')}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={32}
                      color={colors.onPrimary}
                      style={!isPlaying ? styles.playIconOffset : undefined}
                    />
                  </Pressable>

                  <Pressable
                    style={styles.skipButton}
                    onPress={onSkipForward}
                    accessibilityRole="button"
                    accessibilityLabel={t('common:forward30')}
                  >
                    <Ionicons name="play-forward" size={28} color={colors.ink} />
                    <Text style={styles.skipLabel}>30 s</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            <View style={styles.menuRow}>
              {PLAYER_MENU.map((item) => {
                const isActive =
                  item.id === 'content' ? activeMenuId === null : activeMenuId === item.id;
                const label = t(`audioPlayer:${item.labelKey}`);

                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.menuItem,
                      isActive && styles.menuItemActive,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() => handleMenuPress(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: isActive }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isActive ? colors.primary : colors.muted}
                    />
                    <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  backgroundTarget: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.08 }],
  },
  backgroundScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '72%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  dismissButton: {
    alignSelf: 'flex-start',
    marginLeft: spacing.base,
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  heroCompact: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  artworkWrap: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation.card,
  },
  artworkWrapCompact: {
    width: 120,
    height: 120,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  guideTitle: {
    ...textStyle('displayMd'),
    color: colors.onDark,
    textAlign: 'center',
  },
  placeName: {
    ...textStyle('bodyMd'),
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
    ...elevation.sheet,
  },
  panelDiscussion: {
    flex: 1,
    gap: spacing.md,
  },
  discussionWrap: {
    flex: 1,
    minHeight: 0,
  },
  timelineBlock: {
    gap: spacing.sm,
  },
  progressTrack: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.hairline,
    overflow: 'visible',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    top: -5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  skipButton: {
    alignItems: 'center',
    gap: spacing.xxs,
    minWidth: 56,
  },
  skipLabel: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonPressed: {
    backgroundColor: colors.primaryActive,
  },
  playIconOffset: {
    marginLeft: 4,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  menuItemActive: {
    backgroundColor: colors.primaryDisabled,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuLabel: {
    ...textStyle('captionSm'),
    color: colors.muted,
    textAlign: 'center',
  },
  menuLabelActive: {
    color: colors.primary,
    fontWeight: Platform.select({ ios: '600', default: '700' }),
  },
});
