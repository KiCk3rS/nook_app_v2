import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { ioniconForCategoryIconKey } from '../../lib/categoryIcons';
import { colors, componentSizes, radius, spacing, textStyle } from '../../constants/theme';
import { useCategories } from '../../hooks/usePoisInBbox';

interface CategorySliderProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategorySlider({ selectedCategoryId, onSelectCategory }: CategorySliderProps) {
  const { t } = useTranslation('categories');
  const { categories } = useCategories();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Chip
        label={t('place.all')}
        selected={selectedCategoryId === 'all'}
        tint={colors.primary}
        iconName="pricetag-outline"
        onPress={() => onSelectCategory('all')}
      />
      {categories.map((category) => (
        <Chip
          key={category.slug}
          label={category.label}
          selected={category.slug === selectedCategoryId}
          tint={category.colorHex}
          iconName={ioniconForCategoryIconKey(category.iconKey)}
          onPress={() => onSelectCategory(category.slug)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  tint,
  iconName,
  onPress,
}: {
  label: string;
  selected: boolean;
  tint: string;
  iconName: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: tint }
          : [styles.chipInactive, { borderColor: tint }],
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Ionicons
        name={iconName}
        size={14}
        color={selected ? colors.onPrimary : tint}
      />
      <Text
        style={[
          styles.chipText,
          selected ? styles.chipTextActive : { color: tint },
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  chipInactive: {
    backgroundColor: colors.canvas,
    borderWidth: 1,
  },
  chipText: {
    ...textStyle('buttonSm'),
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
});
