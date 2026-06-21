import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FAVORITES_COPY } from '../../constants/favoritesCopy';
import { getCategoryLabel, type MockPlace } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface FavoritePlaceRowProps {
  place: MockPlace;
  isPendingRemoval?: boolean;
  onPress: () => void;
  onRemove: () => void;
}

const THUMB_SIZE = 72;

export function FavoritePlaceRow({
  place,
  isPendingRemoval = false,
  onPress,
  onRemove,
}: FavoritePlaceRowProps) {
  const categoryLabel = getCategoryLabel(place.categoryId);

  return (
    <View style={[styles.row, isPendingRemoval && styles.rowPending]}>
      <Pressable
        style={({ pressed }) => [styles.main, pressed && !isPendingRemoval && styles.mainPressed]}
        onPress={onPress}
        disabled={isPendingRemoval}
        accessibilityRole="button"
        accessibilityLabel={FAVORITES_COPY.openPlace(place.name)}
        accessibilityState={{ disabled: isPendingRemoval }}
      >
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {place.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {categoryLabel}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
      </Pressable>
      <Pressable
        onPress={onRemove}
        style={({ pressed }) => [styles.heartBtn, pressed && styles.heartBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel={
          isPendingRemoval ? FAVORITES_COPY.undo : FAVORITES_COPY.removePlace
        }
        hitSlop={8}
      >
        <Ionicons
          name={isPendingRemoval ? 'heart-outline' : 'heart'}
          size={20}
          color={isPendingRemoval ? colors.muted : colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowPending: {
    opacity: 0.55,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: componentSizes.iconControlSize + spacing.md * 2,
  },
  mainPressed: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.sm,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  meta: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  heartBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  heartBtnPressed: {
    backgroundColor: colors.surfaceSoft,
  },
});
