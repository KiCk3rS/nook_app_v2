import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatAudioDurationClock,
  getLanguageFlag,
  type AudioGuide,
} from '../../constants/mockPlaces';
import i18n from '../../lib/i18n';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface AudioGuideListProps {
  guides: AudioGuide[];
  activeGuideId: string | null;
  isPlaying: boolean;
  onPlayGuide: (guideId: string) => void;
  onAddGuide?: () => void;
}

function getAuthorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function getRatingLabel(rating: number | null): string {
  if (rating === null) return i18n.t('common:notRatedYet');
  return rating.toFixed(1).replace('.0', '');
}

interface GuidePlayButtonProps {
  guide: AudioGuide;
  isActive: boolean;
  isPlaying: boolean;
  size: 'lg' | 'sm';
  onPress: () => void;
}

function GuidePlayButton({ guide, isActive, isPlaying, size, onPress }: GuidePlayButtonProps) {
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
          ? `${guide.title} — à générer`
          : isActive && isPlaying
            ? `Mettre en pause — ${guide.title}`
            : `Écouter ${guide.title}`
      }
      accessibilityState={{ disabled: !isReady, selected: isActive }}
    >
      <Ionicons
        name={isActive && isPlaying ? 'pause' : 'play'}
        size={iconSize}
        color={
          !isReady
            ? colors.mutedSoft
            : colors.onPrimary
        }
        style={isActive || isLarge ? undefined : { marginLeft: 2 }}
      />
    </Pressable>
  );
}

interface FeaturedGuideCardProps {
  guide: AudioGuide;
  isActive: boolean;
  isPlaying: boolean;
  onPlayGuide: (guideId: string) => void;
}

function FeaturedGuideCard({ guide, isActive, isPlaying, onPlayGuide }: FeaturedGuideCardProps) {
  const isReady = guide.status === 'ready';

  function handlePlay() {
    if (!isReady) return;
    onPlayGuide(guide.id);
  }

  return (
    <View style={styles.featured}>
      <View style={styles.featuredHeader}>
        <View style={styles.authorRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getAuthorInitial(guide.authorName)}</Text>
          </View>
          <View style={styles.authorMeta}>
            <Text style={styles.authorName}>{guide.authorName}</Text>
            <Text style={styles.publishedAt}>{guide.publishedAt}</Text>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons
            name={guide.rating === null ? 'star-outline' : 'star'}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.ratingText}>{getRatingLabel(guide.rating)}</Text>
        </View>
      </View>

      <Text style={styles.featuredTitle}>{guide.title}</Text>
      <Text style={styles.featuredSummary}>{guide.summary}</Text>

      <View style={styles.featuredFooter}>
        <Text style={styles.languageFlag}>{getLanguageFlag(guide.language)}</Text>
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={16} color={colors.muted} />
          <Text style={styles.durationText}>
            {isReady && guide.durationSec !== null
              ? formatAudioDurationClock(guide.durationSec)
              : 'À générer'}
          </Text>
        </View>
        <GuidePlayButton
          guide={guide}
          isActive={isActive}
          isPlaying={isPlaying}
          size="lg"
          onPress={handlePlay}
        />
      </View>
    </View>
  );
}

interface ThemeGuideRowProps {
  guide: AudioGuide;
  isActive: boolean;
  isPlaying: boolean;
  isLast: boolean;
  onPlayGuide: (guideId: string) => void;
}

function ThemeGuideRow({
  guide,
  isActive,
  isPlaying,
  isLast,
  onPlayGuide,
}: ThemeGuideRowProps) {
  const isReady = guide.status === 'ready';

  function handlePlay() {
    if (!isReady) return;
    onPlayGuide(guide.id);
  }

  return (
    <View style={[styles.themeRow, !isLast && styles.themeRowBorder]}>
      <View style={styles.themeContent}>
        <Text style={styles.themeTitle} numberOfLines={1}>
          {guide.title}
        </Text>
        <View style={styles.themeMeta}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={styles.themeMetaText}>
            {isReady && guide.durationSec !== null
              ? formatAudioDurationClock(guide.durationSec)
              : 'À générer'}
          </Text>
        </View>
        <Text style={styles.themeSummary} numberOfLines={1}>
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
    </View>
  );
}

export function AudioGuideList({
  guides,
  activeGuideId,
  isPlaying,
  onPlayGuide,
  onAddGuide,
}: AudioGuideListProps) {
  const { t } = useTranslation('common');

  if (guides.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('audioGuidesSection')}</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('noAudioGuides')}</Text>
        </View>
      </View>
    );
  }

  const [featuredGuide, ...otherGuides] = guides;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Guides Audio</Text>
        <Text style={styles.sectionCount}>
          {guides.length} disponible{guides.length > 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.card}>
        <FeaturedGuideCard
          guide={featuredGuide}
          isActive={activeGuideId === featuredGuide.id}
          isPlaying={isPlaying && activeGuideId === featuredGuide.id}
          onPlayGuide={onPlayGuide}
        />

        {otherGuides.length > 0 ? (
          <>
            <View style={styles.themesHeader}>
              <Text style={styles.themesHeaderText}>Autres thèmes</Text>
            </View>
            {otherGuides.map((guide, index) => (
              <ThemeGuideRow
                key={guide.id}
                guide={guide}
                isActive={activeGuideId === guide.id}
                isPlaying={isPlaying && activeGuideId === guide.id}
                isLast={index === otherGuides.length - 1}
                onPlayGuide={onPlayGuide}
              />
            ))}
          </>
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
        onPress={onAddGuide}
        accessibilityRole="button"
        accessibilityLabel={t('addAudioGuide')}
      >
        <Ionicons name="add" size={22} color={colors.onPrimary} />
        <Text style={styles.addButtonText}>{t('addAudioGuide')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  sectionCount: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  featured: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...textStyle('titleMd'),
    color: colors.onPrimary,
  },
  authorMeta: {
    flex: 1,
    gap: spacing.xxs,
  },
  authorName: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  publishedAt: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '42%',
  },
  ratingText: {
    ...textStyle('bodySm'),
    color: colors.primary,
    flexShrink: 1,
  },
  featuredTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  featuredSummary: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  languageFlag: {
    fontSize: 18,
    lineHeight: 22,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    marginLeft: spacing.sm,
  },
  durationText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
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
  themesHeader: {
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  themesHeaderText: {
    ...textStyle('microLabel'),
    color: colors.muted,
    textTransform: 'uppercase',
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
  },
  themeMetaText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  themeSummary: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
  },
  addButton: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  addButtonPressed: {
    backgroundColor: colors.primaryActive,
  },
  addButtonText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  emptyWrap: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
  },
  emptyText: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
});
