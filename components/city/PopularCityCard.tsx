import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { MockCity } from '../../constants/mockCities';
import {
  colors,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
  typography,
} from '../../constants/theme';

interface PopularCityCardProps {
  city: MockCity;
  onPress: () => void;
}

const CARD_WIDTH = 148;
const IMAGE_HEIGHT = 112;
const TITLE_LINE_HEIGHT = typography.titleMd.fontSize * typography.titleMd.lineHeight;
const TITLE_MIN_HEIGHT = TITLE_LINE_HEIGHT * 2;

export function PopularCityCard({ city, onPress }: PopularCityCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Destination populaire — ${city.name}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: city.coverImageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {city.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {city.subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

export const popularCityCardWidth = CARD_WIDTH;

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
  subtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
