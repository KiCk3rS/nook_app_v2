import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { EditorialItinerary } from '../../constants/mockItineraries';
import { formatItineraryDuration } from '../../constants/mockItineraries';
import { formatItineraryStepMeta } from '../../lib/i18n/formatters';
import {
  colors,
  elevation,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';

interface PremiumItineraryCardProps {
  itinerary: EditorialItinerary;
  isLocked: boolean;
  onPress: () => void;
}

const IMAGE_HEIGHT = 180;

export function PremiumItineraryCard({
  itinerary,
  isLocked,
  onPress,
}: PremiumItineraryCardProps) {
  const { t } = useTranslation('hub');
  const duration = formatItineraryDuration(itinerary.durationMinutes);
  const stepsMeta = formatItineraryStepMeta(duration, itinerary.stepPoiIds.length);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Itinéraire premium ${itinerary.title}${isLocked ? ' — verrouillé' : ''}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: itinerary.coverImageUrl }}
          style={[styles.image, isLocked && styles.imageLocked]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.badgeRow}>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>{t('premiumBadge')}</Text>
          </View>
          {isLocked ? (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color={colors.ink} />
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {itinerary.title}
        </Text>
        <Text style={styles.meta}>
          {stepsMeta}
          {isLocked && itinerary.priceLabel ? ` · ${itinerary.priceLabel}` : ''}
        </Text>
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
  imageLocked: {
    opacity: 0.85,
  },
  badgeRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  premiumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  premiumText: {
    ...textStyle('captionSm'),
    color: colors.onPrimary,
    fontWeight: '600',
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.control,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  meta: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
