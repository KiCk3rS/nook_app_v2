import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AUDIO_GUIDE_TIERS,
  DEFAULT_DURATION_TIER,
  getTierCreditCost,
} from '../../constants/audioGuideTiers';
import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useCredits } from '../../contexts/CreditsContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePremium } from '../../contexts/PremiumContext';
import { generateAudioGuideAndAwaitJob } from '../../lib/api/audioGuides';
import {
  trackAudioGuideCreateError,
  trackAudioGuideCreateOpen,
  trackAudioGuideCreateSubmit,
  trackAudioGuideCreateSuccess,
  trackAudioGuideCreditsPaywallOpen,
  trackAudioGuideTierSelected,
} from '../../lib/analytics';
import { formatWikipediaArticleTitle } from '../../lib/placeWikipedia';
import type { DurationTier } from '../../types/audioGuideCreation';
import { AudioGuideGenerationError } from '../../types/audioGuideCreation';

interface CreateGuideSheetProps {
  visible: boolean;
  poiId: string;
  poiName: string;
  wikipediaUrl: string;
  language: string;
  onClose: () => void;
  onSuccess: () => void;
  onOpenCreditsPack: (requiredCredits: number) => void;
}

type CreationPhase = 'idle' | 'launching' | 'generating' | 'success' | 'error';

export function CreateGuideSheet({
  visible,
  poiId,
  poiName,
  wikipediaUrl,
  language,
  onClose,
  onSuccess,
  onOpenCreditsPack,
}: CreateGuideSheetProps) {
  const { t } = useTranslation(['createGuide', 'common']);
  const insets = useSafeAreaInsets();
  const { balance, refreshBalance, canAffordTier, getTierPaymentLabel, isLoading } = useCredits();
  const { hasSubscription } = usePremium();
  const { user, isMockSession } = useAuth();

  const [selectedTier, setSelectedTier] = useState<DurationTier>(DEFAULT_DURATION_TIER);
  const [phase, setPhase] = useState<CreationPhase>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canAfford = balance !== null && canAffordTier(selectedTier);
  const articleTitle = useMemo(
    () => formatWikipediaArticleTitle(wikipediaUrl),
    [wikipediaUrl],
  );

  const ctaCostLabel = useMemo(() => {
    const payment = getTierPaymentLabel(selectedTier);
    if (payment === 'subscription_quota') {
      return t('createGuide:ctaCostIncluded');
    }
    return t('createGuide:ctaCostCredits', { count: getTierCreditCost(selectedTier) });
  }, [getTierPaymentLabel, selectedTier, t]);

  const balanceLabel = useMemo(() => {
    if (!balance) return '';
    const parts: string[] = [];
    parts.push(t('createGuide:balanceCredits', { count: balance.creditsBalance }));
    if (hasSubscription && balance.subscriptionGenerationsRemaining > 0) {
      parts.push(
        t('createGuide:balanceQuota', {
          count: balance.subscriptionGenerationsRemaining,
        }),
      );
    }
    return parts.join(t('createGuide:balanceSeparator'));
  }, [balance, hasSubscription, t]);

  const handleClose = useCallback(() => {
    if (phase === 'launching' || phase === 'generating') return;
    onClose();
  }, [onClose, phase]);

  useEffect(() => {
    if (!visible) {
      setPhase('idle');
      return;
    }
    trackAudioGuideCreateOpen(poiId, 'place_detail');
    setSubmitError(null);
    setPhase('idle');
    void refreshBalance();
  }, [visible, poiId, refreshBalance]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, handleClose]);

  function handleSelectTier(tier: DurationTier) {
    setSelectedTier(tier);
    trackAudioGuideTierSelected(tier, getTierCreditCost(tier));
  }

  async function handleSubmit() {
    setSubmitError(null);

    if (!user || isLoading) return;

    if (!canAfford) {
      trackAudioGuideCreditsPaywallOpen(poiId, getTierCreditCost(selectedTier));
      onOpenCreditsPack(getTierCreditCost(selectedTier));
      return;
    }

    const paymentType = getTierPaymentLabel(selectedTier);
    trackAudioGuideCreateSubmit(poiId, selectedTier, paymentType ?? 'credits');

    setPhase('launching');
    try {
      const result = await generateAudioGuideAndAwaitJob(
        user.id,
        poiId,
        poiName,
        {
          wikipediaUrl,
          durationTier: selectedTier,
          language,
        },
        hasSubscription,
        {
          demoSession: isMockSession,
          onGenerating: () => setPhase('generating'),
        },
      );
      trackAudioGuideCreateSuccess(poiId, result.response.jobId, selectedTier);
      await refreshBalance();
      onSuccess();

      if (result.outcome === 'failed') {
        setSubmitError(result.errorMessage ?? t('createGuide:guideError'));
        setPhase('error');
        return;
      }
      setPhase('success');
    } catch (error) {
      setPhase('error');
      if (error instanceof AudioGuideGenerationError) {
        trackAudioGuideCreateError(error.code, selectedTier);
        if (error.code === 'INSUFFICIENT_CREDITS') {
          trackAudioGuideCreditsPaywallOpen(poiId, getTierCreditCost(selectedTier));
          onOpenCreditsPack(getTierCreditCost(selectedTier));
          return;
        }
        if (error.code === 'RATE_LIMITED') {
          setSubmitError(t('createGuide:error429'));
          return;
        }
        if (error.code === 'INVALID_URL' || error.code === 'VALIDATION') {
          setSubmitError(t('createGuide:errorValidation'));
          return;
        }
      }
      setSubmitError(t('createGuide:errorNetwork'));
    }
  }

  const isBusy = phase === 'launching' || phase === 'generating';
  const showSuccess = phase === 'success';
  const primaryCtaLabel =
    !isLoading && !canAfford
      ? t('createGuide:ctaInsufficientCredits')
      : t('createGuide:ctaGenerate', { cost: ctaCostLabel });

  const primaryDisabled = isBusy || isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} accessibilityLabel={t('common:close')} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.base) },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={styles.headerSide} />
            <View style={styles.handle} />
            <Pressable
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel={t('common:close')}
              disabled={isBusy}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              showSuccess && styles.contentSuccess,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {showSuccess ? (
              <View style={styles.successState}>
                <View style={styles.successIconWrap}>
                  <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
                </View>
                <Text style={styles.successTitle}>{t('createGuide:successTitle')}</Text>
                <Text style={styles.successBody}>{t('createGuide:successBody')}</Text>
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    styles.successDismissBtn,
                    pressed && styles.primaryBtnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('createGuide:successDismiss')}
                >
                  <Text style={styles.primaryBtnText}>{t('createGuide:successDismiss')}</Text>
                </Pressable>
              </View>
            ) : (
              <>
            <Text style={styles.title}>{t('createGuide:sheetTitle')}</Text>

            <View style={styles.contextRow}>
              <Text style={styles.placeName} numberOfLines={2}>
                {poiName}
              </Text>
              <View style={styles.privateBadge}>
                <Ionicons name="lock-closed-outline" size={12} color={colors.primary} />
                <Text style={styles.privateBadgeText}>{t('createGuide:privateBadge')}</Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>{t('createGuide:tierSection')}</Text>
            <View style={styles.tierList}>
              {AUDIO_GUIDE_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <Pressable
                    key={tier.id}
                    onPress={() => handleSelectTier(tier.id)}
                    style={({ pressed }) => [
                      styles.tierCard,
                      isSelected && styles.tierCardSelected,
                      pressed && styles.tierCardPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={t('createGuide:tierAccessibility', {
                      label: t(`createGuide:${tier.labelKey}`),
                      duration: t(`createGuide:${tier.durationLabelKey}`),
                      cost: t(`createGuide:${tier.labelKey}Cost`),
                    })}
                  >
                    <View style={styles.tierCardHeader}>
                      <Text style={[styles.tierTitle, isSelected && styles.tierTitleSelected]}>
                        {t(`createGuide:${tier.labelKey}`)}
                      </Text>
                      <Text style={styles.tierCost}>{t(`createGuide:${tier.labelKey}Cost`)}</Text>
                    </View>
                    <Text style={styles.tierDuration}>
                      {t(`createGuide:${tier.durationLabelKey}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{t('createGuide:sourceLabel')}</Text>
            <View style={styles.sourceCard} accessibilityLabel={`${t('createGuide:sourceLabel')} — ${articleTitle}`}>
              <Ionicons name="globe-outline" size={20} color={colors.muted} />
              <View style={styles.sourceTextWrap}>
                <Text style={styles.sourceTitle} numberOfLines={2}>
                  {articleTitle}
                </Text>
                <Text style={styles.sourceHelp}>{t('createGuide:sourceHelp')}</Text>
              </View>
            </View>

            {balanceLabel ? <Text style={styles.balance}>{balanceLabel}</Text> : null}

            {submitError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{submitError}</Text>
                <Pressable
                  onPress={() => void handleSubmit()}
                  accessibilityRole="button"
                  accessibilityLabel={t('createGuide:retry')}
                >
                  <Text style={styles.errorRetry}>{t('createGuide:retry')}</Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              onPress={() => void handleSubmit()}
              disabled={primaryDisabled}
              style={({ pressed }) => [
                styles.primaryBtn,
                primaryDisabled && styles.primaryBtnDisabled,
                pressed && !primaryDisabled && styles.primaryBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={primaryCtaLabel}
              accessibilityState={{ disabled: primaryDisabled }}
            >
              {isBusy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryBtnText}>{primaryCtaLabel}</Text>
              )}
            </Pressable>

            {!canAfford || (balance && balance.creditsBalance <= 2) ? (
              <Pressable
                onPress={() => {
                  trackAudioGuideCreditsPaywallOpen(poiId, getTierCreditCost(selectedTier));
                  onOpenCreditsPack(getTierCreditCost(selectedTier));
                }}
                style={styles.secondaryLink}
                accessibilityRole="button"
                accessibilityLabel={t('createGuide:ctaGetCredits')}
              >
                <Text style={styles.secondaryLinkText}>{t('createGuide:ctaGetCredits')}</Text>
              </Pressable>
            ) : null}

            <Text style={styles.legal}>{t('createGuide:legalNotice')}</Text>
              </>
            )}
          </ScrollView>

          {isBusy ? (
            <View style={styles.loadingOverlay} accessibilityLiveRegion="polite">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                {phase === 'generating'
                  ? t('createGuide:guidePending')
                  : t('createGuide:submitting')}
              </Text>
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
    maxHeight: '92%',
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...elevation.sheet,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xs,
    zIndex: 2,
  },
  headerSide: {
    width: componentSizes.iconControlSize,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.hairline,
  },
  closeBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  contentSuccess: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  successState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  successIconWrap: {
    marginBottom: spacing.xs,
  },
  successTitle: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  successBody: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  successDismissBtn: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  title: {
    ...textStyle('displayMd'),
    color: colors.ink,
  },
  contextRow: {
    gap: spacing.sm,
  },
  placeName: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  privateBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
  },
  privateBadgeText: {
    ...textStyle('bodySm'),
    color: colors.primary,
    fontWeight: '600',
  },
  sectionLabel: {
    ...textStyle('microLabel'),
    color: colors.muted,
    textTransform: 'uppercase',
  },
  tierList: {
    gap: spacing.sm,
  },
  tierCard: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xxs,
    backgroundColor: colors.canvas,
  },
  tierCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft,
  },
  tierCardPressed: {
    opacity: 0.92,
  },
  tierCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tierTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  tierTitleSelected: {
    color: colors.primary,
  },
  tierCost: {
    ...textStyle('bodySm'),
    color: colors.muted,
    fontWeight: '600',
  },
  tierDuration: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  fieldLabel: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSoft,
  },
  sourceTextWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  sourceTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  sourceHelp: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  balance: {
    ...textStyle('bodySm'),
    color: colors.ink,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  errorBannerText: {
    ...textStyle('bodySm'),
    color: colors.ink,
    flex: 1,
  },
  errorRetry: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryBtnDisabled: {
    backgroundColor: colors.mutedSoft,
  },
  primaryBtnPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryBtnText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
    textAlign: 'center',
  },
  secondaryLink: {
    alignSelf: 'center',
    minHeight: componentSizes.iconControlSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  secondaryLinkText: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    fontWeight: '600',
  },
  legal: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
    textAlign: 'center',
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
