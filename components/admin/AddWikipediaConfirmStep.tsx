import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import type { WikipediaSearchItem } from '../../lib/api/adminWikipedia';
import type { AdminWikipediaErrorKey } from '../../lib/mappers/adminWikipediaError';

interface AddWikipediaConfirmStepProps {
  item: WikipediaSearchItem;
  isCreating: boolean;
  errorKey: AdminWikipediaErrorKey | null;
  onCreate: () => void;
}

export function AddWikipediaConfirmStep({
  item,
  isCreating,
  errorKey,
  onCreate,
}: AddWikipediaConfirmStepProps) {
  const { t } = useTranslation('adminAddPlace');

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
      <Text style={styles.note}>{t('confirmDraftNote')}</Text>
      <Text style={styles.note}>{t('confirmPositionNote')}</Text>

      {errorKey ? (
        <View style={styles.errorBlock}>
          <Text style={styles.errorText}>{t(errorKey)}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={onCreate}
            accessibilityRole="button"
            accessibilityLabel={t('retry')}
            disabled={isCreating}
          >
            <Text style={styles.retryLabel}>{t('retry')}</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          (isCreating || pressed) && styles.ctaPressed,
          isCreating && styles.ctaDisabled,
        ]}
        onPress={onCreate}
        disabled={isCreating}
        accessibilityRole="button"
        accessibilityLabel={t('ctaCreate')}
        accessibilityState={{ disabled: isCreating, busy: isCreating }}
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
