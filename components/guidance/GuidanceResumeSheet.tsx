import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface GuidanceResumeSheetProps {
  visible: boolean;
  stepNumber: number;
  stepName: string;
  onResume: () => void;
  onRestart: () => void;
}

export function GuidanceResumeSheet({
  visible,
  stepNumber,
  stepName,
  onResume,
  onRestart,
}: GuidanceResumeSheetProps) {
  const { t } = useTranslation('guidance');
  const insets = useSafeAreaInsets();
  const resumeLabel = t('resumeCta', { step: stepNumber, name: stepName });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.title}>{t('resumeTitle')}</Text>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
            onPress={onResume}
            accessibilityRole="button"
            accessibilityLabel={resumeLabel}
          >
            <Text style={styles.primaryText}>{resumeLabel}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryPressed]}
            onPress={onRestart}
            accessibilityRole="button"
            accessibilityLabel={t('restartCta')}
          >
            <Text style={styles.secondaryText}>{t('restartCta')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  secondaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryPressed: {
    opacity: 0.85,
  },
  secondaryText: {
    ...textStyle('buttonMd'),
    color: colors.primary,
  },
});
