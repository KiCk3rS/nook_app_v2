import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PAYWALL_COPY } from '../../constants/hubCopy';
import type { EditorialItinerary } from '../../constants/mockItineraries';
import { usePremium } from '../../contexts/PremiumContext';
import {
  trackPremiumOfferSelected,
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

type OfferType = 'unit' | 'subscription';

interface PaywallSheetProps {
  visible: boolean;
  itinerary: EditorialItinerary | null;
  sourceScreen: string;
  onClose: () => void;
  onUnlocked: () => void;
}

export function PaywallSheet({
  visible,
  itinerary,
  sourceScreen,
  onClose,
  onUnlocked,
}: PaywallSheetProps) {
  const insets = useSafeAreaInsets();
  const { unlockItinerary, unlockSubscription, restorePurchases } = usePremium();
  const [selectedOffer, setSelectedOffer] = useState<OfferType>('subscription');
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (visible && itinerary) {
      trackPremiumPaywallViewed(itinerary.id, sourceScreen);
    }
  }, [visible, itinerary, sourceScreen]);

  if (!itinerary) return null;

  const unitPrice = itinerary.priceLabel ?? '4,99 €';
  const subscriptionPrice = '9,99 €';

  async function handlePurchase() {
    if (!itinerary || isPurchasing) return;
    trackPremiumOfferSelected(selectedOffer, itinerary.id);
    trackPremiumPurchaseStarted(selectedOffer, itinerary.id);
    setIsPurchasing(true);

    await new Promise((r) => setTimeout(r, 600));

    if (selectedOffer === 'unit') {
      unlockItinerary(itinerary.id);
    } else {
      unlockSubscription();
    }

    trackPremiumPurchaseSuccess(selectedOffer, itinerary.id);
    setIsPurchasing(false);
    onUnlocked();
    onClose();
  }

  function handleRestore() {
    trackPremiumRestoreTapped();
    restorePurchases();
    onUnlocked();
    onClose();
  }

  function handleDismiss() {
    trackPremiumPaywallDismissed(itinerary?.id);
    onClose();
  }

  const ctaLabel =
    selectedOffer === 'unit'
      ? PAYWALL_COPY.buyCta(unitPrice)
      : PAYWALL_COPY.subscribeCta(subscriptionPrice);

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
            accessibilityLabel={PAYWALL_COPY.close}
          >
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Image
            source={{ uri: itinerary.coverImageUrl }}
            style={styles.hero}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.title}>{PAYWALL_COPY.title}</Text>
          <Text style={styles.itineraryName}>{itinerary.title}</Text>

          <View style={styles.benefits}>
            <Benefit text={PAYWALL_COPY.benefit1} />
            <Benefit text={PAYWALL_COPY.benefit2} />
            <Benefit text={PAYWALL_COPY.benefit3} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.offerCard,
              selectedOffer === 'subscription' && styles.offerSelected,
              pressed && styles.offerPressed,
            ]}
            onPress={() => setSelectedOffer('subscription')}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedOffer === 'subscription' }}
          >
            <View style={styles.offerHeader}>
              <Text style={styles.offerTitle}>{PAYWALL_COPY.subscriptionTitle}</Text>
              <View style={styles.bestValue}>
                <Text style={styles.bestValueText}>{PAYWALL_COPY.bestValue}</Text>
              </View>
            </View>
            <Text style={styles.offerDesc}>{PAYWALL_COPY.subscriptionLabel}</Text>
            <Text style={styles.offerPrice}>{PAYWALL_COPY.subscribeCta(subscriptionPrice)}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.offerCard,
              selectedOffer === 'unit' && styles.offerSelected,
              pressed && styles.offerPressed,
            ]}
            onPress={() => setSelectedOffer('unit')}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedOffer === 'unit' }}
          >
            <Text style={styles.offerTitle}>{itinerary.title}</Text>
            <Text style={styles.offerDesc}>{PAYWALL_COPY.unitLabel}</Text>
            <Text style={styles.offerPrice}>{PAYWALL_COPY.buyCta(unitPrice)}</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              pressed && styles.ctaPressed,
              isPurchasing && styles.ctaDisabled,
            ]}
            onPress={() => void handlePurchase()}
            disabled={isPurchasing}
            accessibilityRole="button"
            accessibilityLabel={ctaLabel}
          >
            <Text style={styles.ctaText}>{isPurchasing ? '…' : ctaLabel}</Text>
          </Pressable>
          <Pressable
            onPress={handleRestore}
            accessibilityRole="button"
            accessibilityLabel={PAYWALL_COPY.restore}
          >
            <Text style={styles.restore}>{PAYWALL_COPY.restore}</Text>
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
  hero: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
  },
  title: {
    ...textStyle('displayMd'),
    color: colors.ink,
  },
  itineraryName: {
    ...textStyle('bodyMd'),
    color: colors.muted,
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
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceCard,
    gap: spacing.xs,
  },
  offerSelected: {
    borderColor: colors.primary,
  },
  offerPressed: {
    opacity: 0.94,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  offerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
  },
  bestValue: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
  },
  bestValueText: {
    ...textStyle('captionSm'),
    color: colors.primary,
    fontWeight: '600',
  },
  offerDesc: {
    ...textStyle('bodySm'),
    color: colors.muted,
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
