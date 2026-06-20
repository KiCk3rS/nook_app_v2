import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AffiliateMapItem } from '../../constants/mockCities';
import { HUB_COPY } from '../../constants/hubCopy';
import {
  colors,
  elevation,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';

interface AffiliateMapCardProps {
  item: AffiliateMapItem;
  onPress: () => void;
}

const CARD_WIDTH = 200;
const IMAGE_HEIGHT = 120;

export function AffiliateMapCard({ item, onPress }: AffiliateMapCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Carte partenaire ${item.title}`}
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
        <Text style={styles.partner} numberOfLines={1}>
          {item.partnerName}
        </Text>
      </View>
    </Pressable>
  );
}

export const affiliateMapCardWidth = CARD_WIDTH;

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
  partner: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
});
