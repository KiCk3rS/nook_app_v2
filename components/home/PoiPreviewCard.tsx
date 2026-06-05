import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getCategoryLabel, type MockPlace } from '../../constants/mockPlaces';
import { colors, elevation, radius, spacing, typography } from '../../constants/theme';

interface PoiPreviewCardProps {
  place: MockPlace;
  onClose: () => void;
}

export function PoiPreviewCard({ place, onClose }: PoiPreviewCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const categoryLabel = getCategoryLabel(place.categoryId);

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{categoryLabel}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setIsFavorite((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
            }
            hitSlop={8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.error : colors.textPrimary}
            />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fermer la fiche"
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {place.name}
        </Text>
        <View style={styles.addressRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textSecondary}
            accessibilityElementsHidden
          />
          <Text style={styles.address} numberOfLines={2}>
            {place.address}
          </Text>
        </View>
      </View>
    </View>
  );
}

const IMAGE_HEIGHT = 148;
const overlayChipSize = 36;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...elevation.card,
  },
  imageWrap: {
    height: IMAGE_HEIGHT,
    backgroundColor: colors.surfaceSunken,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    height: overlayChipSize,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  actions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: overlayChipSize,
    height: overlayChipSize,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceElevated,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    lineHeight: typography.size.lg * typography.lineHeight.tight,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  address: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
});
