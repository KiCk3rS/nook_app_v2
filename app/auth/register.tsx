import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthFormField } from '../../components/auth/AuthFormField';
import { AuthScreenLayout } from '../../components/auth/AuthScreenLayout';
import { AUTH_COPY } from '../../constants/authCopy';
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

function resolveRegisterError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 0) return AUTH_COPY.errorApiNotConfigured;
    if (ApiError.isConflict(error)) return AUTH_COPY.error409;
    if (ApiError.isRateLimited(error)) return AUTH_COPY.error429;
    if (error.details?.email?.[0]) return error.details.email[0];
    if (error.details?.password?.[0]) return error.details.password[0];
    return error.message || AUTH_COPY.errorGeneric;
  }
  return AUTH_COPY.errorNetwork;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = typeof returnTo === 'string' && returnTo.length > 0
    ? returnTo
    : '/(tabs)/profil';

  function handleClose() {
    router.back();
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!isValidEmail(email)) next.email = AUTH_COPY.invalidEmail;
    if (password.length < 8) next.password = AUTH_COPY.passwordTooShort;
    if (password !== passwordConfirm) {
      next.passwordConfirm = AUTH_COPY.passwordMismatch;
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;
    if (!isApiConfigured()) {
      setFormError(AUTH_COPY.errorApiNotConfigured);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, password, {
        displayName: displayName.trim() || undefined,
      });
      router.replace(destination as never);
    } catch (error) {
      setFormError(resolveRegisterError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      title={AUTH_COPY.registerTitle}
      subtitle={AUTH_COPY.registerSubtitle}
      onClose={handleClose}
    >
      <AuthFormField
        label={AUTH_COPY.emailLabel}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={fieldErrors.email}
      />
      <AuthFormField
        label={AUTH_COPY.displayNameLabel}
        value={displayName}
        onChangeText={setDisplayName}
        autoComplete="name"
      />
      <AuthFormField
        label={AUTH_COPY.passwordLabel}
        value={password}
        onChangeText={setPassword}
        secureToggle
        autoComplete="new-password"
        textContentType="newPassword"
        error={fieldErrors.password}
      />
      <AuthFormField
        label={AUTH_COPY.confirmPasswordLabel}
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureToggle
        autoComplete="new-password"
        textContentType="newPassword"
        error={fieldErrors.passwordConfirm}
      />

      <Text style={styles.terms}>
        {AUTH_COPY.termsPrefix}
        <Link href="/cgu" style={styles.termsLink}>
          {AUTH_COPY.termsLink}
        </Link>
        .
      </Text>

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
        accessibilityLabel={AUTH_COPY.registerCta}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.primaryText}>{AUTH_COPY.registerCta}</Text>
        )}
      </Pressable>

      <Link
        href={{
          pathname: '/auth/login',
          params: { returnTo: destination },
        }}
        asChild
      >
        <Pressable accessibilityRole="link">
          <Text style={styles.link}>{AUTH_COPY.goLogin}</Text>
        </Pressable>
      </Link>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  terms: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  termsLink: {
    color: colors.legalLink,
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
  link: {
    ...textStyle('bodyMd'),
    color: colors.legalLink,
    textAlign: 'center',
  },
});
