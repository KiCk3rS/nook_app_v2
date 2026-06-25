import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalAudioChrome } from '../components/audio/GlobalAudioChrome';
import { I18nSync } from '../components/I18nSync';
import { AudioPlaybackProvider } from '../contexts/AudioPlaybackContext';
import { AuthProvider } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { PremiumProvider } from '../contexts/PremiumContext';
import { colors, fontFamilyForWeight, typography } from '../constants/theme';
import '../lib/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation('common');
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AudioPlaybackProvider>
          <AuthProvider>
          <I18nSync />
          <FavoritesProvider>
          <PremiumProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.canvas },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="itineraries"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="listen-history"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="itinerary"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="city/[slug]"
              options={{
                headerShown: false,
                presentation: 'card',
                contentStyle: { backgroundColor: colors.canvas },
              }}
            />
            <Stack.Screen
              name="place/[id]"
              options={{
                headerShown: false,
                presentation: 'card',
                contentStyle: { backgroundColor: colors.canvas },
              }}
            />
            <Stack.Screen
              name="confidentialite"
              options={{
                headerShown: true,
                title: t('privacyTitle'),
                presentation: 'card',
                headerStyle: { backgroundColor: colors.canvas },
                headerTintColor: colors.ink,
                headerTitleStyle: {
                  fontFamily: fontFamilyForWeight(typography.weight.semibold),
                  fontSize: typography.titleMd.fontSize,
                  fontWeight: typography.weight.semibold,
                  color: colors.ink,
                },
                contentStyle: { backgroundColor: colors.canvas },
              }}
            />
            <Stack.Screen
              name="cgu"
              options={{
                headerShown: true,
                title: t('termsTitle'),
                presentation: 'card',
                headerStyle: { backgroundColor: colors.canvas },
                headerTintColor: colors.ink,
                headerTitleStyle: {
                  fontFamily: fontFamilyForWeight(typography.weight.semibold),
                  fontSize: typography.titleMd.fontSize,
                  fontWeight: typography.weight.semibold,
                  color: colors.ink,
                },
                contentStyle: { backgroundColor: colors.canvas },
              }}
            />
          </Stack>
          <GlobalAudioChrome />
          </PremiumProvider>
          </FavoritesProvider>
          </AuthProvider>
        </AudioPlaybackProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
