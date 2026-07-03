import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatAudioDurationClock,
  type AudioGuide,
} from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

function getGuideDurationLabel(
  guide: AudioGuide,
  pendingLabel: string,
  errorLabel: string,
): string {
  if (guide.status === 'pending') return pendingLabel;
  if (guide.status === 'error') return errorLabel;
  if (guide.durationSec !== null) return formatAudioDurationClock(guide.durationSec);
  return pendingLabel;
}

function PrivateGuideBadge({ label }: { label: string }) {
  return (
    <View style={styles.privateBadge}>
      <Text style={styles.privateBadgeText}>{label}</Text>
    </View>
  );
}

interface GuidePlayButtonProps {
  guide: AudioGuide;
  isActive: boolean;
  isPlaying: boolean;
  size: 'lg' | 'sm';
  onPress: () => void;
}

export function GuidePlayButton({
  guide,
  isActive,
  isPlaying,
  size,
  onPress,
}: GuidePlayButtonProps) {
  const { t } = useTranslation('audioPlayer');
  const isReady = guide.status === 'ready';
  const isLarge = size === 'lg';
  const buttonSize = isLarge ? 56 : 40;
  const iconSize = isLarge ? 24 : 16;

  return (
    <Pressable
      style={[
        styles.playButton,
        { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
        isReady && isActive && styles.playButtonActive,
        isReady && !isActive && styles.playButtonReady,
        !isReady && styles.playButtonPending,
      ]}
      onPress={onPress}
      disabled={!isReady}
      accessibilityRole="button"
      accessibilityLabel={
        !isReady
          ? t('themesGuidePendingA11y', { title: guide.title })
          : isActive && isPlaying
            ? t('themesGuidePauseA11y', { title: guide.title })
            : t('themesGuidePlayA11y', { title: guide.title })
      }
      accessibilityState={{ disabled: !isReady, selected: isActive }}
    >
      <Ionicons
        name={isActive && isPlaying ? 'pause' : 'play'}
        size={iconSize}
        color={!isReady ? colors.mutedSoft : colors.onPrimary}
        style={isActive || isLarge ? undefined : { marginLeft: 2 }}
      />
    </Pressable>
  );
}

export interface ThemeGuideRowProps {
  guide: AudioGuide;
  isActive: boolean;
  isPlaying: boolean;
  isLast: boolean;
  onPlayGuide: (guideId: string) => void;
  onRetryGuide?: (guideId: string) => void;
}

export function ThemeGuideRow({
  guide,
  isActive,
  isPlaying,
  isLast,
  onPlayGuide,
  onRetryGuide,
}: ThemeGuideRowProps) {
  const { t } = useTranslation('createGuide');
  const isReady = guide.status === 'ready';

  function handlePlay() {
    if (!isReady) return;
    onPlayGuide(guide.id);
  }

  return (
    <View style={[styles.themeRow, !isLast && styles.themeRowBorder]}>
      <View style={styles.themeContent}>
        <Text style={styles.themeTitle} numberOfLines={2}>
          {guide.title}
        </Text>
        {guide.isPrivate ? <PrivateGuideBadge label={t('myGuideBadge')} /> : null}
        <View style={styles.themeMeta}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={styles.themeMetaText}>
            {getGuideDurationLabel(guide, t('guidePending'), t('guideError'))}
          </Text>
        </View>
        <Text style={styles.themeSummary} numberOfLines={2}>
          {guide.summary}
        </Text>
      </View>
      <GuidePlayButton
        guide={guide}
        isActive={isActive}
        isPlaying={isPlaying}
        size="sm"
        onPress={handlePlay}
      />
      {guide.status === 'error' && onRetryGuide ? (
        <Pressable
          onPress={() => onRetryGuide(guide.id)}
          style={styles.retryInline}
          accessibilityRole="button"
          accessibilityLabel={t('guideRetry')}
        >
          <Text style={styles.retryInlineText}>{t('guideRetry')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  playButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonReady: {
    backgroundColor: colors.primary,
  },
  playButtonActive: {
    backgroundColor: colors.primaryActive,
  },
  playButtonPending: {
    backgroundColor: colors.hairline,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.canvas,
  },
  themeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  themeContent: {
    flex: 1,
    gap: spacing.xxs,
  },
  themeTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  themeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  themeMetaText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  themeSummary: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
  },
  privateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
  },
  privateBadgeText: {
    ...textStyle('microLabel'),
    color: colors.primary,
    textTransform: 'uppercase',
  },
  retryInline: {
    minHeight: componentSizes.iconControlSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  retryInlineText: {
    ...textStyle('bodySm'),
    color: colors.primary,
    fontWeight: '600',
  },
});
