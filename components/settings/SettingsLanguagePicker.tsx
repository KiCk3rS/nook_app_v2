import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, componentSizes, spacing, textStyle } from '../../constants/theme';
import { APP_LANGUAGE_OPTIONS } from '../../lib/i18n/languages';
import type { AppLocale } from '../../lib/i18n';

interface SettingsLanguagePickerProps {
  value: AppLocale;
  onChange: (locale: AppLocale) => void;
  disabled?: boolean;
}

export function SettingsLanguagePicker({
  value,
  onChange,
  disabled = false,
}: SettingsLanguagePickerProps) {
  const { t } = useTranslation('settings');
  const [expanded, setExpanded] = useState(false);

  const selectedLabel = t(`languages.${value}`);

  function handleSelect(locale: AppLocale) {
    if (locale === value) {
      setExpanded(false);
      return;
    }
    onChange(locale);
    setExpanded(false);
  }

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          pressed && !disabled && styles.triggerPressed,
          disabled && styles.disabled,
        ]}
        onPress={() => setExpanded((open) => !open)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('language')}
        accessibilityHint={t('languagePickerA11y')}
        accessibilityState={{ expanded, disabled }}
      >
        <Text style={styles.triggerLabel}>{t('language')}</Text>
        <View style={styles.triggerRight}>
          {disabled ? (
            <ActivityIndicator size="small" color={colors.muted} />
          ) : (
            <Text style={styles.triggerValue}>{selectedLabel}</Text>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.mutedSoft}
          />
        </View>
      </Pressable>

      {expanded && !disabled ? (
        <View style={styles.list} accessibilityRole="list">
          {APP_LANGUAGE_OPTIONS.map((option, index) => {
            const isSelected = option.code === value;
            const isLast = index === APP_LANGUAGE_OPTIONS.length - 1;
            const label = t(option.labelKey);

            return (
              <Pressable
                key={option.code}
                style={({ pressed }) => [
                  styles.option,
                  !isLast && styles.optionBorder,
                  pressed && styles.optionPressed,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => handleSelect(option.code)}
                accessibilityRole="menuitem"
                accessibilityLabel={label}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {label}
                </Text>
                {isSelected ? (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: componentSizes.buttonPrimaryHeight + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    backgroundColor: colors.canvas,
  },
  triggerPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  disabled: {
    opacity: 0.6,
  },
  triggerLabel: {
    ...textStyle('bodyMd'),
    color: colors.ink,
    flex: 1,
  },
  triggerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  triggerValue: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  list: {
    backgroundColor: colors.surfaceSoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  option: {
    minHeight: componentSizes.buttonPrimaryHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    backgroundColor: colors.surfaceSoft,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  optionPressed: {
    backgroundColor: colors.surfaceStrong,
  },
  optionSelected: {
    backgroundColor: colors.canvas,
  },
  optionLabel: {
    ...textStyle('bodyMd'),
    color: colors.ink,
    flex: 1,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
