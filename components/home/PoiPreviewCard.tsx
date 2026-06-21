import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFavorites } from '../../contexts/FavoritesContext';
import { getCategoryLabel, type MockPlace } from '../../constants/mockPlaces';
import { getPlaceHref } from '../../lib/placeNavigation';
import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface PoiPreviewCardProps {
  place: MockPlace;
  onClose: () => void;
}

export function PoiPreviewCard({ place, onClose }: PoiPreviewCardProps) {
  const router = useRouter();
  const { isPlaceFavorite, togglePlaceFavorite } = useFavorites();
  const isFavorite = isPlaceFavorite(place.id);
  const categoryLabel = getCategoryLabel(place.categoryId);
  const readyGuideCount = place.audioGuides.filter((g) => g.status === 'ready').length;

  function handleOpenDetail() {
    router.push(getPlaceHref(place));
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handleOpenDetail}
      accessibilityRole="button"
      accessibilityLabel={`Voir la fiche — ${place.name}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.badge} pointerEvents="none">
          <Text style={styles.badgeText}>{categoryLabel}</Text>
        </View>
        <View style={styles.actions} pointerEvents="box-none">
          <Pressable
            style={styles.iconButton}
            onPress={(e) => {
              e.stopPropagation();
              togglePlaceFavorite(place.id);
            }}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'
            }
            hitSlop={8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.primary : colors.ink}
            />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={(e) => {
              e.stopPropagation();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Fermer l'aperçu"
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {place.name}
          </Text>
          {readyGuideCount > 0 ? (
            <View
              style={styles.audioCountBadge}
              accessibilityElementsHidden
            >
              <Ionicons
                name="headset-outline"
                size={15}
                color={colors.ink}
              />
              <Text style={styles.audioCountText}>{readyGuideCount}</Text>
            </View>
          ) : null}
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.mutedSoft}
            accessibilityElementsHidden
          />
        </View>
        <View style={styles.addressRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.muted}
            accessibilityElementsHidden
          />
          <Text style={styles.address} numberOfLines={2}>
            {place.address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const IMAGE_HEIGHT = 148;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...elevation.card,
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
    top: spacing.md,
    left: spacing.md,
    minHeight: componentSizes.iconControlSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.canvas,
    borderRadius: radius.full,
    ...elevation.control,
  },
  badgeText: {
    ...textStyle('buttonSm'),
    color: colors.ink,
  },
  actions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.control,
  },
  body: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  audioCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.canvas,
    flexShrink: 0,
  },
  audioCountText: {
    ...textStyle('bodySm'),
    color: colors.ink,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  address: {
    flex: 1,
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
