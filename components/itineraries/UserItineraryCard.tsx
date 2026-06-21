import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { USER_ITINERARIES_COPY } from '../../constants/userItinerariesCopy';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';
import { formatDurationMinutes, formatStepCount } from '../../lib/userDisplay';
import type { UserItinerary } from '../../types/api';

interface UserItineraryCardProps {
  itinerary: UserItinerary;
  onPress: () => void;
  onFollow: () => void;
  onDelete: () => void;
}

export function UserItineraryCard({
  itinerary,
  onPress,
  onFollow,
  onDelete,
}: UserItineraryCardProps) {
  const stepCount = itinerary.stepCount ?? itinerary.poiIds?.length ?? 0;
  const duration = formatDurationMinutes(itinerary.estimatedDurationMinutes);
  const meta = [formatStepCount(stepCount), duration].filter(Boolean).join(' · ');
  const incomplete = stepCount < 2;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${itinerary.title}, ${meta}`}
    >
      <View style={styles.textBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {itinerary.title}
          </Text>
          {incomplete ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {USER_ITINERARIES_COPY.incompleteBadge}
              </Text>
            </View>
          ) : null}
        </View>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>

      <View style={styles.actions}>
        {!incomplete ? (
          <Pressable
            style={({ pressed }) => [styles.followBtn, pressed && styles.followPressed]}
            onPress={onFollow}
            accessibilityRole="button"
            accessibilityLabel={USER_ITINERARIES_COPY.follow}
          >
            <Text style={styles.followText}>{USER_ITINERARIES_COPY.follow}</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onDelete}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel={USER_ITINERARIES_COPY.delete}
        >
          <Ionicons name="trash-outline" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surfaceCardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.canvas,
  },
  cardPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  textBlock: {
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
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
  },
  badgeText: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  meta: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  followBtn: {
    minHeight: componentSizes.buttonPrimaryHeight - 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followPressed: {
    backgroundColor: colors.primaryActive,
  },
  followText: {
    ...textStyle('buttonSm'),
    color: colors.onPrimary,
  },
  iconBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
