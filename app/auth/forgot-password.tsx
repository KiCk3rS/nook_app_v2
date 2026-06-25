import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { AuthFormField } from '../../components/auth/AuthFormField';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleClose() {
    router.back();
  }

  async function handleSubmit() {
    if (!isValidEmail(email)) {
      setFieldError(t('invalidEmail'));
      return;
    }
    setFieldError(null);
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthScreenLayout title={t('resetTitle')} onClose={handleClose}>
        <Text style={styles.body}>{t('resetSent')}</Text>
        <Link href="/auth/login" asChild>
          <Pressable style={styles.primaryBtn} accessibilityRole="button">
            <Text style={styles.primaryText}>{t('backToLogin')}</Text>
          </Pressable>
        </Link>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title={t('resetTitle')}
      subtitle={t('resetSubtitle')}
      onClose={handleClose}
    >
      <AuthFormField
        label={t('emailLabel')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={fieldError}
      />

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          (pressed || isSubmitting) && styles.primaryPressed,
          isSubmitting && styles.disabled,
        ]}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={t('resetCta')}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.primaryText}>{t('resetCta')}</Text>
        )}
      </Pressable>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    ...textStyle('bodyMd'),
    color: colors.muted,
  },
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  disabled: {
    opacity: 0.7,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
});
