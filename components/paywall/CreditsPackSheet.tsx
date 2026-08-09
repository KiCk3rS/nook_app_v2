import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useCredits } from '../../contexts/CreditsContext';
import { usePremium } from '../../contexts/PremiumContext';
import {
  trackCreditsPackPurchaseCancel,
  trackCreditsPackPurchaseSuccess,
  trackCreditsPackSelected,
  trackCreditsPackSheetOpen,
  type CreditsPackSource,
} from '../../lib/analytics';

interface CreditsPackSheetProps {
  visible: boolean;
  sourceScreen: CreditsPackSource;
  requiredCredits?: number;
  onClose: () => void;
  onPurchaseSuccess: (creditsAdded: number) => void;
  onOpenSubscription?: () => void;
}

export function CreditsPackSheet({
  visible,
  sourceScreen,
  requiredCredits,
  onClose,
  onPurchaseSuccess,
  onOpenSubscription,
}: CreditsPackSheetProps) {
  const { t } = useTranslation(['creditsPack', 'common']);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const {
    balance,
    packs,
    isLoadingPacks,
    packsError,
    purchasePack,
    refreshBalance,
    loadPacks,
  } = useCredits();
  const { hasSubscription, restorePurchases } = usePremium();
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const selectedPack = packs[selectedIndex] ?? packs[0];

  const handleClose = useCallback(() => {
    if (isPurchasing) return;
    onClose();
  }, [isPurchasing, onClose]);

  useEffect(() => {
    if (!visible) return;
    trackCreditsPackSheetOpen(sourceScreen, requiredCredits);
    void refreshBalance();
    void loadPacks();
  }, [visible, requiredCredits, refreshBalance, loadPacks, sourceScreen]);

  useEffect(() => {
    if (!visible || packs.length === 0) return;
    if (requiredCredits) {
      const recommendedIndex = packs.findIndex((pack) => pack.credits >= requiredCredits);
      setSelectedIndex(recommendedIndex >= 0 ? recommendedIndex : 0);
    } else {
      setSelectedIndex(Math.min(1, packs.length - 1));
    }
  }, [visible, packs, requiredCredits]);

  function handleSelectPack(index: number) {
    setSelectedIndex(index);
    const pack = packs[index];
    if (pack) {
      trackCreditsPackSelected(pack.productId, pack.credits);
    }
  }

  function handleSignIn() {
    router.push({
      pathname: '/auth/login',
      params: { returnTo: pathname, source: 'credits_pack' },
    });
  }

  async function handlePurchase() {
    if (isPurchasing || !selectedPack) return;

    if (!isAuthenticated) {
      handleSignIn();
      return;
    }

    setIsPurchasing(true);
    try {
      await purchasePack(selectedPack.productId);
      trackCreditsPackPurchaseSuccess(selectedPack.productId, selectedPack.credits);
      onPurchaseSuccess(selectedPack.credits);
      onClose();
    } catch {
      trackCreditsPackPurchaseCancel();
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.dismissArea}
          onPress={handleClose}
          accessibilityLabel={t('common:close')}
          disabled={isPurchasing}
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.base) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('creditsPack:sheetTitle')}</Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel={t('common:close')}
              disabled={isPurchasing}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          {balance ? (
            <Text style={styles.balance}>
              {t('creditsPack:currentBalance', { count: balance.creditsBalance })}
            </Text>
          ) : null}

          {requiredCredits ? (
            <Text style={styles.required}>
              {t('creditsPack:requiredCredits', { count: requiredCredits })}
            </Text>
          ) : null}

          <Text style={styles.reminder}>{t('creditsPack:tierReminder')}</Text>

          {packsError ? <Text style={styles.loadError}>{t('common:errorGeneric')}</Text> : null}

          {isLoadingPacks ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={styles.packList}>
              {packs.map((pack, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <Pressable
                    key={pack.productId}
                    onPress={() => handleSelectPack(index)}
                    style={({ pressed }) => [
                      styles.packCard,
                      isSelected && styles.packCardSelected,
                      pressed && styles.packCardPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={t('creditsPack:packAccessibility', {
                      credits: pack.credits,
                      price: pack.priceLabel,
                    })}
                  >
                    <Text style={styles.packCredits}>
                      {t('creditsPack:packCredits', { count: pack.credits })}
                    </Text>
                    <Text style={styles.packPrice}>{pack.priceLabel}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Pressable
            onPress={() => void handlePurchase()}
            disabled={isPurchasing || isLoadingPacks || !selectedPack}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && !isPurchasing && styles.primaryBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('creditsPack:ctaContinue', {
              price: selectedPack?.priceLabel ?? '',
            })}
          >
            {isPurchasing ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {t('creditsPack:ctaContinue', {
                  price: selectedPack?.priceLabel ?? '',
                })}
              </Text>
            )}
          </Pressable>

          {!hasSubscription ? (
            <View style={styles.subscriptionCard}>
              <Text style={styles.subscriptionText}>
                {t('creditsPack:subscriptionUpsell')}
              </Text>
              <Pressable
                onPress={() => onOpenSubscription?.()}
                accessibilityRole="button"
                accessibilityLabel={t('creditsPack:subscriptionLink')}
              >
                <Text style={styles.subscriptionLink}>{t('creditsPack:subscriptionLink')}</Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable
            onPress={() => restorePurchases()}
            style={styles.restoreBtn}
            accessibilityRole="button"
            accessibilityLabel={t('creditsPack:restorePurchases')}
          >
            <Text style={styles.restoreText}>{t('creditsPack:restorePurchases')}</Text>
          </Pressable>

          {isPurchasing ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t('creditsPack:purchasing')}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    gap: spacing.md,
    ...elevation.sheet,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...textStyle('displayMd'),
    color: colors.ink,
  },
  closeBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    ...textStyle('bodyMd'),
    color: colors.ink,
    fontWeight: '600',
  },
  required: {
    ...textStyle('bodySm'),
    color: colors.primary,
  },
  reminder: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  loadError: {
    ...textStyle('bodySm'),
    color: colors.error,
  },
  packList: {
    gap: spacing.sm,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  packCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft,
  },
  packCardPressed: {
    opacity: 0.92,
  },
  packCredits: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  packPrice: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    fontWeight: '600',
  },
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryBtnText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  subscriptionCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    gap: spacing.xs,
  },
  subscriptionText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  subscriptionLink: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    fontWeight: '600',
  },
  restoreBtn: {
    alignSelf: 'center',
    minHeight: componentSizes.iconControlSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  restoreText: {
    ...textStyle('bodySm'),
    color: colors.muted,
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  loadingText: {
    ...textStyle('bodyMd'),
    color: colors.ink,
  },
});
