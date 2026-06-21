import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LISTEN_HISTORY_COPY } from '../../constants/listenHistoryCopy';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

export function ListenHistoryEmptyState() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="headset-outline" size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{LISTEN_HISTORY_COPY.emptyTitle}</Text>
      <Text style={styles.body}>{LISTEN_HISTORY_COPY.emptyBody}</Text>
      <View style={styles.ctaGroup}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={() => router.push('/(tabs)')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>{LISTEN_HISTORY_COPY.emptyExplore}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryPressed]}
          onPress={() => router.push('/(tabs)/decouvrir')}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>{LISTEN_HISTORY_COPY.emptyDiscover}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  ctaGroup: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
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
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  secondaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.canvas,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  secondaryText: {
    ...textStyle('buttonMd'),
    color: colors.ink,
  },
});
