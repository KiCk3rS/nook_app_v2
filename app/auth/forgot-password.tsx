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
import { requestForgotPassword } from '../../lib/api/auth';
import { isApiConfigured } from '../../lib/config';
import { ApiError } from '../../types/api';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function resolveError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.statusCode === 0) return t('auth:errorApiNotConfigured');
      if (ApiError.isRateLimited(error)) return t('auth:error429');
      if (error.details?.email?.[0]) return error.details.email[0];
      return error.message || t('common:errorGeneric');
    }
    return t('auth:errorNetwork');
  }

  function handleClose() {
    router.back();
  }

  async function handleSubmit() {
    setFormError(null);
    if (!isValidEmail(email)) {
      setFieldError(t('auth:invalidEmail'));
      return;
    }
    setFieldError(null);

    if (!isApiConfigured()) {
      setFormError(t('auth:errorApiNotConfigured'));
      return;
    }

    setIsSubmitting(true);
    try {
      await requestForgotPassword({ email: email.trim() });
      setSent(true);
    } catch (error) {
      setFormError(resolveError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthScreenLayout title={t('auth:resetTitle')} onClose={handleClose}>
        <Text style={styles.body}>{t('auth:resetSent')}</Text>
        <Link href="/auth/login" asChild>
          <Pressable style={styles.primaryBtn} accessibilityRole="button">
            <Text style={styles.primaryText}>{t('auth:backToLogin')}</Text>
          </Pressable>
        </Link>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title={t('auth:resetTitle')}
      subtitle={t('auth:resetSubtitle')}
      onClose={handleClose}
    >
      <AuthFormField
        label={t('auth:emailLabel')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={fieldError}
      />

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          (pressed || isSubmitting) && styles.primaryPressed,
          isSubmitting && styles.disabled,
        ]}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={t('auth:resetCta')}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.primaryText}>{t('auth:resetCta')}</Text>
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
  formError: {
    ...textStyle('bodySm'),
    color: colors.error,
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
