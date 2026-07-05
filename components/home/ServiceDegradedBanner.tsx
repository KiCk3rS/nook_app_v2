import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import type { ServiceHealthFailure } from '../../lib/serviceHealth/classifyHealthError';

interface ServiceDegradedBannerProps {
  failure: ServiceHealthFailure;
  isChecking: boolean;
  onRetry: () => void;
  onContinueLimited: () => void;
}

export function ServiceDegradedBanner({
  failure,
  isChecking,
  onRetry,
  onContinueLimited,
}: ServiceDegradedBannerProps) {
  const { t } = useTranslation('hub');

  const title =
    failure === 'offline'
      ? t('serviceOfflineTitle')
      : t('serviceUnavailableTitle');
  const body =
    failure === 'offline'
      ? t('serviceOfflineBody')
      : t('serviceUnavailableBody');

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View style={styles.iconWrap}>
        <Ionicons
          name={failure === 'offline' ? 'cloud-offline-outline' : 'server-outline'}
          size={22}
          color={colors.error}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              (pressed || isChecking) && styles.primaryPressed,
              isChecking && styles.disabled,
            ]}
            onPress={onRetry}
            disabled={isChecking}
            accessibilityRole="button"
            accessibilityLabel={t('serviceRetry')}
          >
            {isChecking ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <Text style={styles.primaryText}>{t('serviceRetry')}</Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryPressed]}
            onPress={onContinueLimited}
            accessibilityRole="button"
            accessibilityLabel={t('serviceContinueLimited')}
          >
            <Text style={styles.secondaryText}>{t('serviceContinueLimited')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  body: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  disabled: {
    opacity: 0.7,
  },
  primaryText: {
    ...textStyle('buttonSm'),
    color: colors.onPrimary,
  },
  secondaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  secondaryText: {
    ...textStyle('buttonSm'),
    color: colors.ink,
  },
});
