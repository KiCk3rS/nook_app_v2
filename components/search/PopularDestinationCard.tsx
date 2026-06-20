import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { getCategoryLabel, type MockPlace } from '../../constants/mockPlaces';
import {
  colors,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
  typography,
} from '../../constants/theme';

interface PopularDestinationCardProps {
  place: MockPlace;
  onPress: () => void;
}

const CARD_WIDTH = 148;
const IMAGE_HEIGHT = 112;
const TITLE_LINE_HEIGHT = typography.titleMd.fontSize * typography.titleMd.lineHeight;
const TITLE_MIN_HEIGHT = TITLE_LINE_HEIGHT * 2;

export function PopularDestinationCard({ place, onPress }: PopularDestinationCardProps) {
  const categoryLabel = getCategoryLabel(place.categoryId);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Destination populaire — ${place.name}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {place.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {categoryLabel}
        </Text>
      </View>
    </Pressable>
  );
}

export const popularCardWidth = CARD_WIDTH;

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
  category: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
