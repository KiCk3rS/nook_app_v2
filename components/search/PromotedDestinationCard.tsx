import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategoryLabel, type MockPlace } from '../../constants/mockPlaces';
import {
  colors,
  elevation,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';

interface PromotedDestinationCardProps {
  place: MockPlace;
  distanceLabel?: string | null;
  onPress: () => void;
}

const IMAGE_HEIGHT = 168;

export function PromotedDestinationCard({
  place,
  distanceLabel,
  onPress,
}: PromotedDestinationCardProps) {
  const categoryLabel = getCategoryLabel(place.categoryId);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={place.name}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        {distanceLabel ? (
          <View style={styles.distanceBadge} pointerEvents="none">
            <Text style={styles.distanceText}>{distanceLabel}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {place.name}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text style={styles.meta} numberOfLines={1}>
            {categoryLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    ...surfaceCardBorder,
  },
  cardPressed: {
    opacity: 0.94,
  },
  imageWrap: {
    height: IMAGE_HEIGHT,
    backgroundColor: colors.surfaceStrong,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    ...elevation.control,
  },
  distanceText: {
    ...textStyle('captionSm'),
    color: colors.ink,
    fontWeight: '600',
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    flex: 1,
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
