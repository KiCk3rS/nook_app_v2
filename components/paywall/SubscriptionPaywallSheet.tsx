import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePremium } from '../../contexts/PremiumContext';
import {
  trackPremiumPaywallDismissed,
  trackPremiumPaywallViewed,
  trackPremiumPurchaseStarted,
  trackPremiumPurchaseSuccess,
  trackPremiumRestoreTapped,
} from '../../lib/analytics';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface SubscriptionPaywallSheetProps {
  visible: boolean;
  sourceScreen: string;
  onClose: () => void;
  onSubscribed?: () => void;
}

export function SubscriptionPaywallSheet({
  visible,
  sourceScreen,
  onClose,
  onSubscribed,
}: SubscriptionPaywallSheetProps) {
  const { t } = useTranslation(['hub', 'common']);
  const insets = useSafeAreaInsets();
  const { unlockSubscription, restorePurchases } = usePremium();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const subscriptionPrice = '9,99 €';

  useEffect(() => {
    if (visible) {
      trackPremiumPaywallViewed('subscription', sourceScreen);
    }
  }, [visible, sourceScreen]);

  async function handleSubscribe() {
    if (isPurchasing) return;
    trackPremiumPurchaseStarted('subscription', 'subscription');
    setIsPurchasing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    unlockSubscription();
    trackPremiumPurchaseSuccess('subscription', 'subscription');
    setIsPurchasing(false);
    onSubscribed?.();
    onClose();
  }

  function handleDismiss() {
    trackPremiumPaywallDismissed('subscription');
    onClose();
  }

  function handleRestore() {
    trackPremiumRestoreTapped();
    restorePurchases();
    onSubscribed?.();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
      accessibilityViewIsModal
    >
      <View style={[styles.sheet, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable
            onPress={handleDismiss}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel={t('common:close')}
            disabled={isPurchasing}
          >
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.iconHero}>
            <Ionicons name="star" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('hub:paywallTitle')}</Text>
          <Text style={styles.subtitle}>{t('hub:paywallSubscriptionLabel')}</Text>

          <View style={styles.benefits}>
            <Benefit text={t('hub:paywallBenefit1')} />
            <Benefit text={t('hub:paywallBenefit2')} />
            <Benefit text={t('hub:paywallBenefit3')} />
          </View>

          <View style={styles.offerCard}>
            <Text style={styles.offerTitle}>{t('hub:paywallSubscriptionTitle')}</Text>
            <Text style={styles.offerPrice}>
              {t('hub:paywallSubscribeCta', { price: subscriptionPrice })}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              pressed && styles.ctaPressed,
              isPurchasing && styles.ctaDisabled,
            ]}
            onPress={() => void handleSubscribe()}
            disabled={isPurchasing}
            accessibilityRole="button"
            accessibilityLabel={t('hub:paywallSubscribeCta', { price: subscriptionPrice })}
          >
            {isPurchasing ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.ctaText}>
                {t('hub:paywallSubscribeCta', { price: subscriptionPrice })}
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={handleRestore}
            accessibilityRole="button"
            accessibilityLabel={t('hub:paywallRestore')}
          >
            <Text style={styles.restore}>{t('hub:paywallRestore')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.base,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconHero: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  benefits: {
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitText: {
    ...textStyle('bodyMd'),
    color: colors.body,
    flex: 1,
  },
  offerCard: {
    padding: spacing.base,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceCard,
    gap: spacing.xs,
  },
  offerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  offerPrice: {
    ...textStyle('bodySm'),
    color: colors.ink,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  cta: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    backgroundColor: colors.primaryActive,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  restore: {
    ...textStyle('buttonSm'),
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});
