import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SettingsGroup,
  SettingsRow,
  SettingsToggleRow,
} from '../../components/settings/SettingsRow';
import { SettingsLanguagePicker } from '../../components/settings/SettingsLanguagePicker';
import { SubscriptionPaywallSheet } from '../../components/paywall/SubscriptionPaywallSheet';
import { colors, spacing, textStyle } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { usePremium } from '../../contexts/PremiumContext';
import { useAppLanguage } from '../../hooks/useAppLanguage';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import {
  trackSettingsLanguageChanged,
  trackSettingsLegalLinkTapped,
  trackSettingsLogoutConfirmed,
  trackSettingsLogoutTapped,
  trackSettingsNotificationToggled,
  trackSettingsOsSettingsOpened,
  trackSettingsPremiumTapped,
  trackSettingsViewed,
} from '../../lib/analytics';
import { getAppVersion } from '../../lib/config';
import { maskEmail } from '../../lib/userDisplay';
import type { AppLocale } from '../../lib/i18n';
import { normalizeLocale } from '../../lib/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['settings', 'common']);
  const { isReady } = useRequireAuth('/settings');
  const { user, preferences, logout, updatePreferences, refreshProfile } = useAuth();
  const { hasSubscription } = usePremium();
  const { setLanguage } = useAppLanguage();
  const {
    status: notificationPermission,
    requestPermission,
    isGranted: notificationsGranted,
  } = useNotificationPermission();

  const [locationStatus, setLocationStatus] = useState('');
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const refreshLocationStatus = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationStatus(
      status === Location.PermissionStatus.GRANTED
        ? t('settings:locationGranted')
        : t('settings:locationDenied'),
    );
  }, [t]);

  const loadSettings = useCallback(async () => {
    setLoadError(null);
    try {
      await refreshProfile();
    } catch {
      setLoadError(t('settings:loadError'));
    }
  }, [refreshProfile, t]);

  useEffect(() => {
    if (!isReady) return;
    trackSettingsViewed();
    void loadSettings();
    void refreshLocationStatus();
  }, [isReady, loadSettings, refreshLocationStatus]);

  useEffect(() => {
    if (!isReady) return;
    function handleAppState(nextState: string) {
      if (nextState === 'active') void refreshLocationStatus();
    }
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isReady, refreshLocationStatus]);

  function openOsSettings(reason: 'location' | 'notifications') {
    trackSettingsOsSettingsOpened(reason);
    void Linking.openSettings();
  }

  function promptOpenNotificationSettings() {
    Alert.alert('', t('settings:permissionDenied'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('settings:openSettings'),
        onPress: () => openOsSettings('notifications'),
      },
    ]);
  }

  function confirmLogout() {
    trackSettingsLogoutTapped();
    Alert.alert(t('settings:logoutTitle'), t('settings:logoutBody'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('settings:logoutConfirm'),
        style: 'destructive',
        onPress: () => {
          trackSettingsLogoutConfirmed();
          void logout().then(() => router.replace('/(tabs)/profil'));
        },
      },
    ]);
  }

  async function handleLanguageChange(language: AppLocale) {
    if (preferences.language === language) return;
    setIsSavingPref(true);
    try {
      await setLanguage(language);
      trackSettingsLanguageChanged(language);
    } catch {
      Alert.alert('', t('settings:saveError'));
    } finally {
      setIsSavingPref(false);
    }
  }

  async function handlePushToggle(enabled: boolean) {
    if (enabled) {
      if (notificationPermission !== 'loading' && !notificationsGranted) {
        const result = await requestPermission();
        if (result !== 'granted') {
          promptOpenNotificationSettings();
          return;
        }
      }
    }

    setIsSavingPref(true);
    try {
      await updatePreferences({
        notifications: { ...preferences.notifications, pushEnabled: enabled },
      });
      trackSettingsNotificationToggled('pushEnabled', enabled);
    } catch {
      Alert.alert('', t('settings:saveError'));
    } finally {
      setIsSavingPref(false);
    }
  }

  function handlePremiumPress() {
    trackSettingsPremiumTapped(hasSubscription ? 'active' : 'inactive');
    setPaywallVisible(true);
  }

  if (!isReady || !user) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pushEnabled = preferences.notifications?.pushEnabled ?? false;
  const currentLanguage = normalizeLocale(preferences.language);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {t('settings:title')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loadError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{loadError}</Text>
            <Pressable
              onPress={() => void loadSettings()}
              accessibilityRole="button"
            >
              <Text style={styles.retry}>{t('common:retry')}</Text>
            </Pressable>
          </View>
        ) : null}

        <SettingsGroup title={t('settings:sectionPreferences')}>
          <SettingsLanguagePicker
            value={currentLanguage}
            onChange={(locale) => void handleLanguageChange(locale)}
            disabled={isSavingPref}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings:sectionNotifications')}>
          <SettingsToggleRow
            label={t('settings:push')}
            description={t('settings:pushDescription')}
            value={pushEnabled}
            onValueChange={(next) => void handlePushToggle(next)}
            disabled={isSavingPref || notificationPermission === 'loading'}
          />
          {!notificationsGranted && pushEnabled ? (
            <Pressable
              style={styles.permissionHint}
              onPress={() => openOsSettings('notifications')}
              accessibilityRole="button"
            >
              <Text style={styles.permissionHintText}>
                {t('settings:permissionDenied')}
              </Text>
              <Text style={styles.permissionHintLink}>
                {t('settings:openSettings')}
              </Text>
            </Pressable>
          ) : null}
        </SettingsGroup>

        <SettingsGroup title={t('settings:sectionAccount')}>
          <SettingsRow
            label={t('settings:email')}
            value={maskEmail(user.email)}
            showChevron={false}
          />
          <SettingsRow
            label={t('settings:password')}
            value={t('settings:changePasswordSoon')}
            showChevron={false}
            disabled
          />
          <SettingsRow
            label={t('settings:premium')}
            value={
              hasSubscription
                ? t('settings:premiumActive')
                : t('settings:premiumInactive')
            }
            onPress={handlePremiumPress}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings:sectionLegal')}>
          <SettingsRow
            label={t('settings:privacy')}
            onPress={() => {
              trackSettingsLegalLinkTapped('privacy');
              router.push('/confidentialite');
            }}
          />
          <SettingsRow
            label={t('settings:terms')}
            onPress={() => {
              trackSettingsLegalLinkTapped('terms');
              router.push('/cgu');
            }}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings:sectionApp')}>
          <SettingsRow
            label={t('settings:location')}
            value={locationStatus}
            onPress={() => openOsSettings('location')}
          />
          <SettingsRow
            label={t('settings:versionLabel')}
            value={getAppVersion()}
            showChevron={false}
          />
        </SettingsGroup>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
          onPress={confirmLogout}
          accessibilityRole="button"
          accessibilityLabel={t('settings:logout')}
        >
          <Text style={styles.logoutText}>{t('settings:logout')}</Text>
        </Pressable>
      </ScrollView>

      <SubscriptionPaywallSheet
        visible={paywallVisible}
        sourceScreen="settings"
        onClose={() => setPaywallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  errorBanner: {
    marginHorizontal: spacing.base,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    padding: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    ...textStyle('bodySm'),
    color: colors.error,
  },
  retry: {
    ...textStyle('buttonSm'),
    color: colors.legalLink,
  },
  permissionHint: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    backgroundColor: colors.surfaceSoft,
  },
  permissionHintText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  permissionHintLink: {
    ...textStyle('buttonSm'),
    color: colors.legalLink,
  },
  logoutBtn: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.base,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutText: {
    ...textStyle('buttonMd'),
    color: colors.error,
  },
});
