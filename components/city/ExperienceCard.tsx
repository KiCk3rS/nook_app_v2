import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AffiliateExperienceItem } from '../../constants/mockCities';
import { HUB_COPY } from '../../constants/hubCopy';
import {
  colors,
  elevation,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';

interface ExperienceCardProps {
  item: AffiliateExperienceItem;
  onPress: () => void;
}

const CARD_WIDTH = 220;
const IMAGE_HEIGHT = 120;

export function ExperienceCard({ item, onPress }: ExperienceCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Expérience ${item.title} — réservation externe`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        {item.rating !== undefined ? (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={colors.primary} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>À partir de {item.priceFrom}</Text>
        {item.duration ? (
          <Text style={styles.duration}>{item.duration}</Text>
        ) : null}
        <Text style={styles.footer}>{HUB_COPY.experienceFooter(item.provider)}</Text>
      </View>
    </Pressable>
  );
}

export const experienceCardWidth = CARD_WIDTH;

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
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    ...elevation.control,
  },
  ratingText: {
    ...textStyle('captionSm'),
    color: colors.ink,
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
  duration: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  footer: {
    ...textStyle('captionSm'),
    color: colors.mutedSoft,
    marginTop: spacing.xxs,
  },
});
