import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FAVORITES_COPY } from '../../constants/favoritesCopy';
import { HUB_COPY } from '../../constants/hubCopy';
import type { EditorialItinerary } from '../../constants/mockItineraries';
import {
  difficultyLabels,
  formatItineraryDuration,
} from '../../constants/mockItineraries';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { usePremium } from '../../contexts/PremiumContext';

interface FavoriteItineraryRowProps {
  itinerary: EditorialItinerary;
  isPendingRemoval?: boolean;
  onPress: () => void;
  onRemove: () => void;
}

const THUMB_SIZE = 72;

export function FavoriteItineraryRow({
  itinerary,
  isPendingRemoval = false,
  onPress,
  onRemove,
}: FavoriteItineraryRowProps) {
  const { isUnlocked } = usePremium();
  const unlocked = isUnlocked(itinerary.id, itinerary.isPremium);
  const duration = formatItineraryDuration(itinerary.durationMinutes);
  const steps = `${itinerary.stepPoiIds.length} étapes`;

  return (
    <View style={[styles.row, isPendingRemoval && styles.rowPending]}>
      <Pressable
        style={({ pressed }) => [styles.main, pressed && !isPendingRemoval && styles.mainPressed]}
        onPress={onPress}
        disabled={isPendingRemoval}
        accessibilityRole="button"
        accessibilityLabel={FAVORITES_COPY.openItinerary(itinerary.title)}
        accessibilityState={{ disabled: isPendingRemoval }}
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
            {!unlocked && itinerary.isPremium ? ' · Verrouillé' : ''}
          </Text>
        </View>
        {itinerary.isPremium && !unlocked ? (
          <Ionicons name="lock-closed" size={18} color={colors.mutedSoft} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
        )}
      </Pressable>
      <Pressable
        onPress={onRemove}
        style={({ pressed }) => [styles.heartBtn, pressed && styles.heartBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel={
          isPendingRemoval ? FAVORITES_COPY.undo : FAVORITES_COPY.removeItinerary
        }
        hitSlop={8}
      >
        <Ionicons
          name={isPendingRemoval ? 'heart-outline' : 'heart'}
          size={20}
          color={isPendingRemoval ? colors.muted : colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowPending: {
    opacity: 0.55,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: componentSizes.iconControlSize + spacing.md * 2,
  },
  mainPressed: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.sm,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
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
    borderRadius: radius.full,
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
  heartBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  heartBtnPressed: {
    backgroundColor: colors.surfaceSoft,
  },
});
