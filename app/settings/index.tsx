import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { SETTINGS_COPY } from '../../constants/settingsCopy';
import { colors, spacing, textStyle } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { usePremium } from '../../contexts/PremiumContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { getAppVersion } from '../../lib/config';
import { maskEmail } from '../../lib/userDisplay';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isReady } = useRequireAuth('/settings');
  const { user, preferences, logout, updatePreferences } = useAuth();
  const { hasSubscription } = usePremium();

  const [locationStatus, setLocationStatus] = useState<string>(
    SETTINGS_COPY.locationDenied,
  );
  const [isSavingPref, setIsSavingPref] = useState(false);

  const refreshLocationStatus = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationStatus(
      status === Location.PermissionStatus.GRANTED
        ? SETTINGS_COPY.locationGranted
        : SETTINGS_COPY.locationDenied,
    );
  }, []);

  useEffect(() => {
    if (isReady) void refreshLocationStatus();
  }, [isReady, refreshLocationStatus]);

  function confirmLogout() {
    Alert.alert(SETTINGS_COPY.logoutTitle, SETTINGS_COPY.logoutBody, [
      { text: SETTINGS_COPY.cancel, style: 'cancel' },
      {
        text: SETTINGS_COPY.logoutConfirm,
        style: 'destructive',
        onPress: () => {
          void logout().then(() => router.replace('/(tabs)/profil'));
        },
      },
    ]);
  }

  async function handleLanguageChange(language: 'fr' | 'en') {
    if (preferences.language === language) return;
    setIsSavingPref(true);
    try {
      await updatePreferences({ language });
    } catch {
      Alert.alert('', SETTINGS_COPY.saveError);
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
      Alert.alert('', SETTINGS_COPY.saveError);
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {SETTINGS_COPY.title}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SettingsGroup title={SETTINGS_COPY.sectionPreferences}>
          <SettingsRow
            label={SETTINGS_COPY.language}
            value={
              preferences.language === 'en'
                ? SETTINGS_COPY.languageEn
                : SETTINGS_COPY.languageFr
            }
            onPress={() =>
              void handleLanguageChange(preferences.language === 'fr' ? 'en' : 'fr')
            }
          />
        </SettingsGroup>

        <SettingsGroup title={SETTINGS_COPY.sectionNotifications}>
          <SettingsToggleRow
            label={SETTINGS_COPY.push}
            description={SETTINGS_COPY.pushDescription}
            value={pushEnabled}
            onValueChange={(next) => void handlePushToggle(next)}
            disabled={isSavingPref}
          />
        </SettingsGroup>

        <SettingsGroup title={SETTINGS_COPY.sectionAccount}>
          <SettingsRow
            label={SETTINGS_COPY.email}
            value={maskEmail(user.email)}
            showChevron={false}
          />
          <SettingsRow
            label={SETTINGS_COPY.password}
            value={SETTINGS_COPY.changePasswordSoon}
            showChevron={false}
            disabled
          />
          <SettingsRow
            label={SETTINGS_COPY.premium}
            value={
              hasSubscription
                ? SETTINGS_COPY.premiumActive
                : SETTINGS_COPY.premiumInactive
            }
            onPress={() => router.push('/(tabs)/decouvrir')}
          />
        </SettingsGroup>

        <SettingsGroup title={SETTINGS_COPY.sectionLegal}>
          <SettingsRow
            label={SETTINGS_COPY.privacy}
            onPress={() => router.push('/confidentialite')}
          />
          <SettingsRow
            label={SETTINGS_COPY.terms}
            onPress={() => router.push('/cgu')}
          />
        </SettingsGroup>

        <SettingsGroup title={SETTINGS_COPY.sectionApp}>
          <SettingsRow
            label={SETTINGS_COPY.location}
            value={locationStatus}
            onPress={() => void Linking.openSettings()}
          />
          <SettingsRow
            label="Version"
            value={getAppVersion()}
            showChevron={false}
          />
        </SettingsGroup>

        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
          onPress={confirmLogout}
          accessibilityRole="button"
          accessibilityLabel={SETTINGS_COPY.logout}
        >
          <Text style={styles.logoutText}>{SETTINGS_COPY.logout}</Text>
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
