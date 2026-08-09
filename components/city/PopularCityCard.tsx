import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
  typography,
} from '../../constants/theme';
import type { CityView } from '../../lib/mappers/cities';

interface PopularCityCardProps {
  city: CityView;
  onPress: () => void;
}

const CARD_WIDTH = 148;
const IMAGE_HEIGHT = 112;
const TITLE_LINE_HEIGHT = typography.titleMd.fontSize * typography.titleMd.lineHeight;
const TITLE_MIN_HEIGHT = TITLE_LINE_HEIGHT * 2;

export function PopularCityCard({ city, onPress }: PopularCityCardProps) {
  const { t } = useTranslation('hub');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('a11yPopularCity', { name: city.name })}
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
        {city.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {city.subtitle}
          </Text>
        ) : null}
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
