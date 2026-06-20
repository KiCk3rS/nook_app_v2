import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ITINERARY_COPY } from '../../constants/hubCopy';
import type { MockPlace } from '../../constants/mockPlaces';
import { getCategoryLabel } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface ItineraryStepRowProps {
  order: number;
  place?: MockPlace;
  isLocked: boolean;
  onPress: () => void;
}

export function ItineraryStepRow({
  order,
  place,
  isLocked,
  onPress,
}: ItineraryStepRowProps) {
  const label = isLocked
    ? ITINERARY_COPY.lockedStep
    : (place?.name ?? ITINERARY_COPY.lockedStep);
  const category = place ? getCategoryLabel(place.categoryId) : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && !isLocked && styles.rowPressed]}
      onPress={onPress}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={`Étape ${order}${place ? `, ${place.name}` : ''}${isLocked ? ', verrouillée' : ''}`}
    >
      <View style={styles.orderBadge}>
        <Text style={styles.orderText}>{order}</Text>
      </View>
      {place && !isLocked ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailLocked]}>
          <Ionicons name="lock-closed" size={20} color={colors.mutedSoft} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, isLocked && styles.titleLocked]} numberOfLines={2}>
          {label}
        </Text>
        {category && !isLocked ? (
          <Text style={styles.category}>{category}</Text>
        ) : null}
      </View>
      {!isLocked ? (
        <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: componentSizes.iconControlSize + spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSoft,
    marginHorizontal: -spacing.base,
    paddingHorizontal: spacing.base,
    borderRadius: radius.sm,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    ...textStyle('captionSm'),
    color: colors.onPrimary,
    fontWeight: '700',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  thumbnailLocked: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  titleLocked: {
    color: colors.mutedSoft,
  },
  category: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
