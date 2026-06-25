import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
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
import { colors, spacing, textStyle } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { usePremium } from '../../contexts/PremiumContext';
import { useAppLanguage } from '../../hooks/useAppLanguage';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getAppVersion } from '../../lib/config';
import { maskEmail } from '../../lib/userDisplay';
import type { AppLocale } from '../../lib/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(['settings', 'common']);
  const { isReady } = useRequireAuth('/settings');
  const { user, preferences, logout, updatePreferences } = useAuth();
  const { hasSubscription } = usePremium();
  const { setLanguage } = useAppLanguage();

  const [locationStatus, setLocationStatus] = useState('');
  const [isSavingPref, setIsSavingPref] = useState(false);

  const refreshLocationStatus = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationStatus(
      status === Location.PermissionStatus.GRANTED
        ? t('settings:locationGranted')
        : t('settings:locationDenied'),
    );
  }, [t]);

  useEffect(() => {
    if (isReady) void refreshLocationStatus();
  }, [isReady, refreshLocationStatus]);

  function confirmLogout() {
    Alert.alert(t('settings:logoutTitle'), t('settings:logoutBody'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('settings:logoutConfirm'),
        style: 'destructive',
        onPress: () => {
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
    } catch {
      Alert.alert('', t('settings:saveError'));
    } finally {
      setIsSavingPref(false);
    }
  }

  async function handlePushToggle(enabled: boolean) {
    setIsSavingPref(true);
    try {
      await updatePreferences({
        notifications: { ...preferences.notifications, pushEnabled: enabled },
      });
    } catch {
      Alert.alert('', t('settings:saveError'));
    } finally {
      setIsSavingPref(false);
    }
  }

  if (!isReady || !user) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const pushEnabled = preferences.notifications?.pushEnabled ?? false;
  const currentLanguage = preferences.language ?? 'fr';

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
        <SettingsGroup title={t('settings:sectionPreferences')}>
          <SettingsRow
            label={t('settings:language')}
            value={
              currentLanguage === 'en'
                ? t('settings:languageEn')
                : t('settings:languageFr')
            }
            onPress={() =>
              void handleLanguageChange(currentLanguage === 'fr' ? 'en' : 'fr')
            }
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings:sectionNotifications')}>
          <SettingsToggleRow
            label={t('settings:push')}
            description={t('settings:pushDescription')}
            value={pushEnabled}
            onValueChange={(next) => void handlePushToggle(next)}
            disabled={isSavingPref}
          />
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
            onPress={() => router.push('/(tabs)/decouvrir')}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings:sectionLegal')}>
          <SettingsRow
            label={t('settings:privacy')}
            onPress={() => router.push('/confidentialite')}
          />
          <SettingsRow
            label={t('settings:terms')}
            onPress={() => router.push('/cgu')}
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings:sectionApp')}>
          <SettingsRow
            label={t('settings:location')}
            value={locationStatus}
            onPress={() => void Linking.openSettings()}
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
