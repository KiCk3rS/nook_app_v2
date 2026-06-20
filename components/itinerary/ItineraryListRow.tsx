import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { HUB_COPY } from '../../constants/hubCopy';
import type { EditorialItinerary } from '../../constants/mockItineraries';
import {
  formatItineraryDuration,
  difficultyLabels,
} from '../../constants/mockItineraries';
import {
  colors,
  componentSizes,
  spacing,
  textStyle,
} from '../../constants/theme';

interface ItineraryListRowProps {
  itinerary: EditorialItinerary;
  isLocked: boolean;
  onPress: () => void;
}

const THUMB_SIZE = 72;

export function ItineraryListRow({ itinerary, isLocked, onPress }: ItineraryListRowProps) {
  const duration = formatItineraryDuration(itinerary.durationMinutes);
  const steps = `${itinerary.stepPoiIds.length} étapes`;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Itinéraire ${itinerary.title}, ${duration}, ${steps}${isLocked ? ', premium verrouillé' : ''}`}
    >
      <Image
        source={{ uri: itinerary.coverImageUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {itinerary.title}
          </Text>
          {itinerary.isPremium ? (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>{HUB_COPY.premiumBadge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>
          {duration} · {steps} · {difficultyLabels[itinerary.difficulty]}
        </Text>
      </View>
      {isLocked ? (
        <Ionicons name="lock-closed" size={18} color={colors.mutedSoft} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: componentSizes.iconControlSize + spacing.md * 2,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: colors.surfaceStrong,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
  },
  premiumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  premiumText: {
    ...textStyle('captionSm'),
    color: colors.onPrimary,
    fontWeight: '600',
  },
  meta: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
