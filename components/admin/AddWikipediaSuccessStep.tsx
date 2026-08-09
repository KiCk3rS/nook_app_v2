import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface AddWikipediaSuccessStepProps {
  placeTitle: string;
  missingCoords: boolean;
  onGenerateAudio: () => void;
  onViewPlace: () => void;
}

export function AddWikipediaSuccessStep({
  placeTitle,
  missingCoords,
  onGenerateAudio,
  onViewPlace,
}: AddWikipediaSuccessStepProps) {
  const { t } = useTranslation(['adminAddPlace']);

  return (
    <View style={styles.root}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {t('adminAddPlace:successTitle')}
      </Text>
      <Text style={styles.placeTitle}>{placeTitle}</Text>
      <Text style={styles.body}>{t('adminAddPlace:successBody')}</Text>
      {missingCoords ? (
        <Text style={styles.note}>{t('adminAddPlace:noCoordsAlertBody')}</Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          pressed && styles.ctaPressed,
        ]}
        onPress={onGenerateAudio}
        accessibilityRole="button"
        accessibilityLabel={t('adminAddPlace:ctaGenerateAudio')}
      >
        <Text style={styles.ctaLabel}>{t('adminAddPlace:ctaGenerateAudio')}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.secondary,
          pressed && styles.secondaryPressed,
        ]}
        onPress={onViewPlace}
        accessibilityRole="button"
        accessibilityLabel={t('adminAddPlace:ctaViewPlace')}
      >
        <Text style={styles.secondaryLabel}>
          {t('adminAddPlace:ctaViewPlace')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  title: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  placeTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  note: {
    ...textStyle('bodySm'),
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  cta: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    height: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    backgroundColor: colors.primaryActive,
  },
  ctaLabel: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  secondary: {
    alignSelf: 'stretch',
    height: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  secondaryPressed: {
    opacity: 0.85,
  },
  secondaryLabel: {
    ...textStyle('buttonMd'),
    color: colors.ink,
  },
});
