import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, tabBarHeight, textStyle } from '../../constants/theme';

function TabBarBackground() {
  return <View style={[StyleSheet.absoluteFill, styles.tabBarBackground]} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedSoft,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: colors.canvas,
          borderTopColor: colors.hairlineSoft,
          borderTopWidth: 1,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom,
          height: tabBarHeight + insets.bottom,
          ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
        },
        tabBarLabelStyle: {
          ...textStyle('buttonSm'),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="decouvrir"
        options={{
          title: 'Découvrir',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoris"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    backgroundColor: colors.canvas,
  },
});
