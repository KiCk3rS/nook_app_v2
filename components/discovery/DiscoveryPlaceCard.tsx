import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
  typography,
} from '../../constants/theme';
import type { DiscoveryCardItem } from '../../lib/mappers/discovery';

interface DiscoveryPlaceCardProps {
  item: DiscoveryCardItem;
  onPress: () => void;
}

const CARD_WIDTH = 148;
const IMAGE_HEIGHT = 112;
const TITLE_LINE_HEIGHT = typography.titleMd.fontSize * typography.titleMd.lineHeight;
const TITLE_MIN_HEIGHT = TITLE_LINE_HEIGHT * 2;

export function DiscoveryPlaceCard({ item, onPress }: DiscoveryPlaceCardProps) {
  const showImage = item.imageUrl != null && !item.usesPlaceholder;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} — ${item.subtitle}`}
    >
      <View style={styles.imageWrap}>
        {showImage ? (
          <Image
            source={{ uri: item.imageUrl! }}
            style={styles.image}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View
            style={[styles.image, styles.imagePlaceholder]}
            accessibilityLabel={item.title}
          />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.categoryLabel} · {item.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

export const discoveryPlaceCardWidth = CARD_WIDTH;

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
  imagePlaceholder: {
    backgroundColor: colors.surfaceStrong,
  },
  body: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.xxs,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
    minHeight: TITLE_MIN_HEIGHT,
  },
  meta: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
