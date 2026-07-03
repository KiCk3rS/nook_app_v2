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
import { GuidePlayButton, ThemeGuideRow } from './AudioGuideRow';

interface AudioGuideListProps {
  guides: AudioGuide[];
  activeGuideId: string | null;
  isPlaying: boolean;
  onPlayGuide: (guideId: string) => void;
  onAddGuide?: () => void;
  onRetryGuide?: (guideId: string) => void;
}

function getAuthorInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

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

function getRatingLabel(rating: number | null): string {
  if (rating === null) return i18n.t('common:notRatedYet');
  return rating.toFixed(1).replace('.0', '');
}

function PrivateGuideBadge({ label }: { label: string }) {
  return (
    <View style={styles.privateBadge}>
      <Text style={styles.privateBadgeText}>{label}</Text>
    </View>
  );
}

interface FeaturedGuideCardProps {
  guide: AudioGuide;
  isActive: boolean;
  isPlaying: boolean;
  onPlayGuide: (guideId: string) => void;
  onRetryGuide?: (guideId: string) => void;
}

function FeaturedGuideCard({
  guide,
  isActive,
  isPlaying,
  onPlayGuide,
  onRetryGuide,
}: FeaturedGuideCardProps) {
  const { t } = useTranslation(['createGuide', 'common']);
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
      {guide.isPrivate ? (
        <PrivateGuideBadge label={t('createGuide:myGuideBadge')} />
      ) : null}
      <Text style={styles.featuredSummary}>{guide.summary}</Text>

      <View style={styles.featuredFooter}>
        <Text style={styles.languageFlag}>{getLanguageFlag(guide.language)}</Text>
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={16} color={colors.muted} />
          <Text style={styles.durationText}>
            {getGuideDurationLabel(
              guide,
              t('createGuide:guidePending'),
              t('createGuide:guideError'),
            )}
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
      {guide.status === 'error' && onRetryGuide ? (
        <Pressable
          onPress={() => onRetryGuide(guide.id)}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel={t('createGuide:guideRetry')}
        >
          <Text style={styles.retryButtonText}>{t('createGuide:guideRetry')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function AudioGuideList({
  guides,
  activeGuideId,
  isPlaying,
  onPlayGuide,
  onAddGuide,
  onRetryGuide,
}: AudioGuideListProps) {
  const { t } = useTranslation(['common', 'createGuide']);

  const addGuideButton = onAddGuide ? (
    <Pressable
      style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
      onPress={onAddGuide}
      accessibilityRole="button"
      accessibilityLabel={t('common:addAudioGuide')}
    >
      <Ionicons name="add" size={22} color={colors.onPrimary} />
      <Text style={styles.addButtonText}>{t('common:addAudioGuide')}</Text>
    </Pressable>
  ) : null;

  const hasPendingGuide = guides.some((guide) => guide.status === 'pending');

  const generationNotice = hasPendingGuide ? (
    <View style={styles.generationNotice} accessibilityRole="text">
      <Ionicons name="time-outline" size={18} color={colors.primary} />
      <Text style={styles.generationNoticeText}>{t('createGuide:generationLaunchedNotice')}</Text>
    </View>
  ) : null;

  if (guides.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('common:audioGuidesSection')}</Text>
        </View>
        {generationNotice}
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('common:noAudioGuides')}</Text>
        </View>
        {addGuideButton}
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

      {generationNotice}

      <View style={styles.card}>
        <FeaturedGuideCard
          guide={featuredGuide}
          isActive={activeGuideId === featuredGuide.id}
          isPlaying={isPlaying && activeGuideId === featuredGuide.id}
          onPlayGuide={onPlayGuide}
          onRetryGuide={onRetryGuide}
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
                onRetryGuide={onRetryGuide}
              />
            ))}
          </>
        ) : null}
      </View>

      {addGuideButton}
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
  generationNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryDisabled,
  },
  generationNoticeText: {
    ...textStyle('bodySm'),
    color: colors.ink,
    flex: 1,
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
  retryButton: {
    alignSelf: 'flex-start',
    minHeight: componentSizes.iconControlSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  retryButtonText: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    fontWeight: '600',
  },
});
