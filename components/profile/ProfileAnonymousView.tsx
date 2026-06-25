import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';

interface ProfileAnonymousViewProps {
  onLogin: () => void;
  onRegister: () => void;
  onDemoLogin?: () => void;
  showDemoLogin?: boolean;
}

export function ProfileAnonymousView({
  onLogin,
  onRegister,
  onDemoLogin,
  showDemoLogin = false,
}: ProfileAnonymousViewProps) {
  const router = useRouter();
  const { t } = useTranslation('profile');

  const benefits = useMemo(
    () => [
      { icon: 'map-outline' as const, text: t('benefitRoutes') },
      { icon: 'cloud-outline' as const, text: t('benefitSync') },
    ],
    [t],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle} accessibilityRole="header">
          {t('title')}
        </Text>

        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="person-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.heroBody}>{t('welcomeAnonymous')}</Text>
        </View>

        <View style={styles.tipsCard}>
          {benefits.map((item) => (
            <View key={item.text} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.tipText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaGroup}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
            onPress={onLogin}
            accessibilityRole="button"
            accessibilityLabel={t('loginCta')}
          >
            <Text style={styles.primaryText}>{t('loginCta')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.secondaryPressed,
            ]}
            onPress={onRegister}
            accessibilityRole="button"
            accessibilityLabel={t('registerCta')}
          >
            <Text style={styles.secondaryText}>{t('registerCta')}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel={t('continueWithoutAccount')}
          >
            <Text style={styles.link}>{t('continueWithoutAccount')}</Text>
          </Pressable>

          {showDemoLogin && onDemoLogin ? (
            <Pressable
              style={({ pressed }) => [
                styles.demoBtn,
                pressed && styles.demoBtnPressed,
              ]}
              onPress={onDemoLogin}
              accessibilityRole="button"
              accessibilityLabel={t('demoLoginCta')}
            >
              <Ionicons name="flask-outline" size={18} color={colors.primary} />
              <Text style={styles.demoBtnText}>{t('demoLoginCta')}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  pageTitle: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroBody: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  tipsCard: {
    ...surfaceCardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    ...textStyle('bodySm'),
    color: colors.body,
    flex: 1,
  },
  ctaGroup: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
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
    width: '100%',
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  secondaryText: {
    ...textStyle('buttonMd'),
    color: colors.ink,
  },
  link: {
    ...textStyle('bodyMd'),
    color: colors.legalLink,
    paddingVertical: spacing.sm,
  },
  demoBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryDisabled,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  demoBtnPressed: {
    backgroundColor: colors.surfaceStrong,
  },
  demoBtnText: {
    ...textStyle('buttonMd'),
    color: colors.primary,
  },
});
