import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { USER_ITINERARIES_COPY } from '../../constants/userItinerariesCopy';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

export function UserItinerariesEmptyState() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="map-outline" size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{USER_ITINERARIES_COPY.emptyTitle}</Text>
      <Text style={styles.body}>{USER_ITINERARIES_COPY.emptyBody}</Text>
      <View style={styles.ctaGroup}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={() => router.push('/(tabs)')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>{USER_ITINERARIES_COPY.emptyExplore}</Text>
        </Pressable>
        <Text style={styles.soon}>{USER_ITINERARIES_COPY.createSoon}</Text>
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
  soon: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
    textAlign: 'center',
  },
});
