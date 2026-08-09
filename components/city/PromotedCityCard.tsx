import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';
import type { CityView } from '../../lib/mappers/cities';

interface PromotedCityCardProps {
  city: CityView;
  onPress: () => void;
}

const IMAGE_HEIGHT = 168;

export function PromotedCityCard({ city, onPress }: PromotedCityCardProps) {
  const { t } = useTranslation('hub');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('a11yPromotedCity', { name: city.name })}
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
  body: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  subtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
