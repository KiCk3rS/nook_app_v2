import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ItineraryCategory } from '../../constants/itineraryCategories';
import { CATEGORY_ICONS } from '../../constants/itineraryCategories';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';

interface CategoryTileProps {
  category: ItineraryCategory;
  itineraryCount?: number;
  onPress: () => void;
}

export function CategoryTile({ category, itineraryCount, onPress }: CategoryTileProps) {
  const iconName = CATEGORY_ICONS[category.icon] as keyof typeof Ionicons.glyphMap;
  const countLabel =
    itineraryCount !== undefined && itineraryCount > 0
      ? `${itineraryCount} parcours`
      : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Catégorie ${category.label}${countLabel ? ` — ${countLabel}` : ''}`}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={22} color={colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {category.label}
      </Text>
      {countLabel ? (
        <Text style={styles.count} numberOfLines={1}>
          {countLabel}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '48%',
    padding: spacing.base,
    borderRadius: radius.md,
    gap: spacing.sm,
    minHeight: componentSizes.iconControlSize * 2.5,
    ...surfaceCardBorder,
  },
  tilePressed: {
    opacity: 0.94,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  count: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
});
