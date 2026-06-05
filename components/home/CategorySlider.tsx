import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { categories } from '../../constants/mockPlaces';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface CategorySliderProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategorySlider({ selectedCategoryId, onSelectCategory }: CategorySliderProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => {
        const isActive = category.id === selectedCategoryId;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelectCategory(category.id)}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={category.label}
          >
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={isActive ? colors.textInverse : colors.textSecondary}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
  },
  chipActive: {
    backgroundColor: colors.brand,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  chipTextInactive: {
    color: colors.textPrimary,
  },
});
