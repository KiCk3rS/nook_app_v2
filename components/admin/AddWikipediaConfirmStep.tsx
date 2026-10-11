import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { ioniconForCategoryIconKey } from '../../lib/categoryIcons';
import type { WikipediaSearchItem } from '../../lib/api/adminWikipedia';
import type { AdminWikipediaErrorKey } from '../../lib/mappers/adminWikipediaError';
import type { CatalogueCategory } from '../../types/catalogue';

interface AddWikipediaConfirmStepProps {
  item: WikipediaSearchItem;
  hasMapAnchor?: boolean;
  categories: CatalogueCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  isCreating: boolean;
  errorKey: AdminWikipediaErrorKey | null;
  onCreate: () => void;
}

export function AddWikipediaConfirmStep({
  item,
  hasMapAnchor = false,
  categories,
  selectedCategoryId,
  onSelectCategory,
  isCreating,
  errorKey,
  onCreate,
}: AddWikipediaConfirmStepProps) {
  const { t } = useTranslation('adminAddPlace');
  const canCreate = selectedCategoryId != null && !isCreating;

  return (
    <View style={styles.root}>
      <Text style={styles.eyebrow}>{t('selectedLabel')}</Text>
      <Text style={styles.title}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}
      <Text style={styles.url} numberOfLines={2}>
        {item.wikipediaUrl}
      </Text>

      <Text style={styles.categoryLabel}>{t('categoryLabel')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((category) => {
          const selected = category.id === selectedCategoryId;
          return (
            <CategoryChip
              key={category.id}
              label={category.label}
              tint={category.colorHex}
              iconName={ioniconForCategoryIconKey(category.iconKey)}
              selected={selected}
              disabled={isCreating}
              onPress={() => onSelectCategory(category.id)}
            />
          );
        })}
      </ScrollView>
      {!selectedCategoryId ? (
        <Text style={styles.categoryHint}>{t('categoryRequired')}</Text>
      ) : hasMapAnchor ? (
        <Text style={styles.note}>{t('confirmMapPreview')}</Text>
      ) : null}

      <Text style={styles.note}>{t('confirmDraftNote')}</Text>
      <Text style={styles.note}>
        {hasMapAnchor ? t('confirmMapPosition') : t('confirmPositionNote')}
      </Text>

      {errorKey ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{t(errorKey)}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={onCreate}
            accessibilityRole="button"
            accessibilityLabel={t('retry')}
            disabled={!canCreate}
          >
            <Text style={styles.retryLabel}>{t('retry')}</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          (isCreating || pressed) && styles.ctaPressed,
          !canCreate && styles.ctaDisabled,
        ]}
        onPress={onCreate}
        disabled={!canCreate}
        accessibilityRole="button"
        accessibilityLabel={t('ctaCreate')}
        accessibilityState={{ disabled: !canCreate, busy: isCreating }}
      >
        {isCreating ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.ctaLabel}>{t('ctaCreate')}</Text>
        )}
      </Pressable>
      {isCreating ? (
        <Text style={styles.creatingHint}>{t('creating')}</Text>
      ) : null}
    </View>
  );
}

function CategoryChip({
  label,
  tint,
  iconName,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  tint: string;
  iconName: ComponentProps<typeof Ionicons>['name'];
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: tint }
          : [styles.chipInactive, { borderColor: tint }],
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
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
  root: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  eyebrow: {
    ...textStyle('microLabel'),
    color: colors.muted,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  description: {
    ...textStyle('bodyMd'),
    color: colors.body,
  },
  url: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
  },
  categoryLabel: {
    ...textStyle('microLabel'),
    color: colors.muted,
    marginTop: spacing.sm,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categoryHint: {
    ...textStyle('bodySm'),
    color: colors.warning,
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
  note: {
    ...textStyle('bodySm'),
    color: colors.muted,
    marginTop: spacing.xs,
  },
  errorBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  errorText: {
    ...textStyle('bodyMd'),
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceSoft,
  },
  retryLabel: {
    ...textStyle('buttonSm'),
    color: colors.ink,
  },
  cta: {
    marginTop: 'auto',
    height: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    backgroundColor: colors.primaryActive,
  },
  ctaDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  ctaLabel: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  creatingHint: {
    ...textStyle('bodySm'),
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
