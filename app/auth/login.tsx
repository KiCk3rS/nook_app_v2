import { Link, useLocalSearchParams, useRouter } from 'expo-router';
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
import { useAuth } from '../../contexts/AuthContext';
import { isApiConfigured } from '../../lib/config';
import { ApiError } from '../../types/api';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation(['auth', 'common']);
  const { returnTo, source } = useLocalSearchParams<{
    returnTo?: string;
    source?: string;
  }>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = typeof returnTo === 'string' && returnTo.length > 0
    ? returnTo
    : '/(tabs)/profil';

  function resolveAuthError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.statusCode === 0) return t('auth:errorApiNotConfigured');
      if (ApiError.isUnauthorized(error)) return t('auth:error401');
      if (ApiError.isRateLimited(error)) return t('auth:error429');
      if (error.details?.email?.[0]) return error.details.email[0];
      if (error.details?.password?.[0]) return error.details.password[0];
      return error.message || t('common:errorGeneric');
    }
    return t('auth:errorNetwork');
  }

  function handleClose() {
    router.back();
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!isValidEmail(email)) next.email = t('auth:invalidEmail');
    if (password.length < 8) next.password = t('auth:passwordTooShort');
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;
    if (!isApiConfigured()) {
      setFormError(t('auth:errorApiNotConfigured'));
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace(destination as never);
    } catch (error) {
      setFormError(resolveAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      title={t('auth:loginTitle')}
      subtitle={t('auth:loginSubtitle')}
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
        error={fieldErrors.email}
      />
      <AuthFormField
        label={t('auth:passwordLabel')}
        value={password}
        onChangeText={setPassword}
        secureToggle
        autoComplete="password"
        textContentType="password"
        error={fieldErrors.password}
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
        accessibilityLabel={t('auth:loginCta')}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.primaryText}>{t('auth:loginCta')}</Text>
        )}
      </Pressable>

      <Link href={{ pathname: '/auth/forgot-password' }} asChild>
        <Pressable accessibilityRole="link">
          <Text style={styles.link}>{t('auth:forgotPassword')}</Text>
        </Pressable>
      </Link>

      <Link
        href={{
          pathname: '/auth/register',
          params: { returnTo: destination, source: source ?? 'login_link' },
        }}
        asChild
      >
        <Pressable accessibilityRole="link">
          <Text style={styles.link}>{t('auth:goRegister')}</Text>
        </Pressable>
      </Link>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  link: {
    ...textStyle('bodyMd'),
    color: colors.legalLink,
    textAlign: 'center',
  },
});
