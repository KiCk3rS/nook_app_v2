import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function handleClose() {
    router.back();
  }

  async function handleSubmit() {
    if (!isValidEmail(email)) {
      setFieldError(AUTH_COPY.invalidEmail);
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
      <AuthScreenLayout title={AUTH_COPY.resetTitle} onClose={handleClose}>
        <Text style={styles.body}>{AUTH_COPY.resetSent}</Text>
        <Link href="/auth/login" asChild>
          <Pressable style={styles.primaryBtn} accessibilityRole="button">
            <Text style={styles.primaryText}>{AUTH_COPY.backToLogin}</Text>
          </Pressable>
        </Link>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title={AUTH_COPY.resetTitle}
      subtitle={AUTH_COPY.resetSubtitle}
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
        accessibilityLabel={AUTH_COPY.resetCta}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.primaryText}>{AUTH_COPY.resetCta}</Text>
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
