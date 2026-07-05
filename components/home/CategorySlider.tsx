import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, componentSizes, radius, spacing, textStyle } from '../../constants/theme';
import { useCategories } from '../../hooks/usePoisInBbox';

interface CategorySliderProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategorySlider({ selectedCategoryId, onSelectCategory }: CategorySliderProps) {
  const { t } = useTranslation('categories');
  const { categories } = useCategories();

  const chips = [
    { id: 'all', slug: 'all', label: t('place.all') },
    ...categories.map((c) => ({ id: c.slug, slug: c.slug, label: c.label })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {chips.map((category) => {
        const isActive = category.slug === selectedCategoryId;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelectCategory(category.slug)}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={category.label}
          >
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={isActive ? colors.onPrimary : colors.muted}
            />
            <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: componentSizes.iconControlSize,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipText: {
    ...textStyle('buttonSm'),
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
  chipTextInactive: {
    color: colors.muted,
  },
});
