import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { TouristPassItem } from '../../constants/mockCities';
import { HUB_COPY } from '../../constants/hubCopy';
import {
  colors,
  elevation,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';

interface TouristPassCardProps {
  item: TouristPassItem;
  onPress: () => void;
}

const CARD_WIDTH = 220;
const IMAGE_HEIGHT = 120;

export function TouristPassCard({ item, onPress }: TouristPassCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Pass touristique ${item.title} — ${item.partnerName}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{HUB_COPY.partnerBadge}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>À partir de {item.priceFrom}</Text>
        {item.validityLabel ? (
          <Text style={styles.validity}>{item.validityLabel}</Text>
        ) : null}
        {item.savingsHint ? (
          <Text style={styles.savings}>{item.savingsHint}</Text>
        ) : null}
        <Text style={styles.footer}>{HUB_COPY.touristPassFooter(item.partnerName)}</Text>
      </View>
    </Pressable>
  );
}

export const touristPassCardWidth = CARD_WIDTH;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
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
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    ...elevation.control,
  },
  badgeText: {
    ...textStyle('captionSm'),
    color: colors.muted,
    fontWeight: '600',
  },
  body: {
    padding: spacing.md,
    gap: spacing.xxs,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  price: {
    ...textStyle('bodySm'),
    color: colors.ink,
    fontWeight: '600',
  },
  validity: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  savings: {
    ...textStyle('captionSm'),
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    ...textStyle('captionSm'),
    color: colors.mutedSoft,
    marginTop: spacing.xxs,
  },
});
