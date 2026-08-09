import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
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
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import {
  generateAdminAudioGuideAndAwaitJob,
  inferLanguageFromWikipediaUrl,
  retryAdminAudioGuideAndAwaitJob,
  type AdminGenerateAudioGuideAwaitResult,
} from '../../lib/api/adminAudioGuides';
import type { AudioGuideGenerationOutcome } from '../../lib/mappers/audioGuideCreation';
import { formatWikipediaArticleTitle } from '../../lib/placeWikipedia';
import { AudioGuideGenerationError } from '../../types/audioGuideCreation';

type Phase = 'idle' | 'launching' | 'pending' | AudioGuideGenerationOutcome;

interface AdminGenerateAudioGuideSheetProps {
  visible: boolean;
  poiId: string;
  poiName: string;
  wikipediaUrl: string;
  appLanguage: string;
  onClose: () => void;
  /** Rafraîchir fiche / listes uniquement quand le job est ready ou launched. */
  onReadyOrLaunched: () => void;
}

export function AdminGenerateAudioGuideSheet({
  visible,
  poiId,
  poiName,
  wikipediaUrl,
  appLanguage,
  onClose,
  onReadyOrLaunched,
}: AdminGenerateAudioGuideSheetProps) {
  const { t } = useTranslation(['adminAudioGuide', 'common']);
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<Phase>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastJobId, setLastJobId] = useState<string | null>(null);

  const articleTitle = formatWikipediaArticleTitle(wikipediaUrl);
  const languageFromUrl = inferLanguageFromWikipediaUrl(wikipediaUrl);
  const language = (languageFromUrl || appLanguage || 'fr').toLowerCase();
  const isBusy = phase === 'launching' || phase === 'pending';
  const isTerminal =
    phase === 'ready' || phase === 'launched' || phase === 'failed';

  const handleClose = useCallback(() => {
    if (isBusy) return;
    onClose();
  }, [isBusy, onClose]);

  useEffect(() => {
    if (!visible) {
      setPhase('idle');
      setSubmitError(null);
      setLastJobId(null);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, handleClose]);

  function mapErrorMessage(error: unknown): string {
    if (error instanceof AudioGuideGenerationError) {
      if (error.code === 'RATE_LIMITED') return t('adminAudioGuide:errorRateLimited');
      if (error.code === 'INVALID_URL' || error.code === 'VALIDATION') {
        return t('adminAudioGuide:errorValidation');
      }
      if (error.statusCode === 403) return t('adminAudioGuide:errorForbidden');
    }
    return t('adminAudioGuide:errorNetwork');
  }

  function applyResult(result: AdminGenerateAudioGuideAwaitResult) {
    setLastJobId(result.response.jobId);
    if (result.outcome === 'failed') {
      setSubmitError(result.errorMessage ?? t('adminAudioGuide:errorGeneric'));
      setPhase('failed');
      return;
    }
    onReadyOrLaunched();
    setPhase(result.outcome);
  }

  async function runJob(
    start: () => Promise<AdminGenerateAudioGuideAwaitResult>,
  ) {
    setSubmitError(null);
    setPhase('launching');
    try {
      const result = await start();
      applyResult(result);
    } catch (error) {
      setPhase('failed');
      setSubmitError(mapErrorMessage(error));
    }
  }

  function handleGenerate() {
    void runJob(() =>
      generateAdminAudioGuideAndAwaitJob(
        poiId,
        { wikipediaUrl, language },
        { onPolling: () => setPhase('pending') },
      ),
    );
  }

  function handleRetry() {
    if (!lastJobId) {
      handleGenerate();
      return;
    }
    void runJob(() =>
      retryAdminAudioGuideAndAwaitJob(lastJobId, {
        onPolling: () => setPhase('pending'),
      }),
    );
  }

  const terminalCopy =
    phase === 'ready'
      ? {
          icon: 'checkmark-circle' as const,
          iconColor: colors.primary,
          title: t('adminAudioGuide:readyTitle'),
          body: t('adminAudioGuide:readyBody'),
          primary: t('adminAudioGuide:readyDismiss'),
        }
      : phase === 'launched'
        ? {
            icon: 'time-outline' as const,
            iconColor: colors.primary,
            title: t('adminAudioGuide:launchedTitle'),
            body: t('adminAudioGuide:launchedBody'),
            primary: t('adminAudioGuide:readyDismiss'),
          }
        : phase === 'failed'
          ? {
              icon: 'alert-circle-outline' as const,
              iconColor: colors.error,
              title: t('adminAudioGuide:errorTitle'),
              body: submitError ?? t('adminAudioGuide:errorGeneric'),
              primary: t('adminAudioGuide:retry'),
            }
          : null;

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
        />
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
            contentContainerStyle={[
              styles.content,
              isTerminal && styles.contentTerminal,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {terminalCopy ? (
              <View style={styles.terminalState} accessibilityLiveRegion="polite">
                <Ionicons
                  name={terminalCopy.icon}
                  size={56}
                  color={terminalCopy.iconColor}
                />
                <Text style={styles.terminalTitle}>{terminalCopy.title}</Text>
                <Text style={styles.terminalBody}>{terminalCopy.body}</Text>
                <Pressable
                  onPress={phase === 'failed' ? handleRetry : handleClose}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && styles.primaryBtnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={terminalCopy.primary}
                >
                  <Text style={styles.primaryBtnText}>{terminalCopy.primary}</Text>
                </Pressable>
                {phase === 'failed' ? (
                  <Pressable
                    onPress={handleClose}
                    style={styles.linkBtn}
                    accessibilityRole="button"
                    accessibilityLabel={t('common:close')}
                  >
                    <Text style={styles.linkBtnText}>{t('common:close')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <>
                <Text style={styles.title}>{t('adminAudioGuide:sheetTitle')}</Text>
                <Text style={styles.placeName} numberOfLines={2}>
                  {poiName}
                </Text>
                <View style={styles.badge}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={12}
                    color={colors.primary}
                  />
                  <Text style={styles.badgeText}>
                    {t('adminAudioGuide:editorialBadge')}
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>
                  {t('adminAudioGuide:sourceLabel')}
                </Text>
                <View style={styles.sourceCard}>
                  <Ionicons name="globe-outline" size={20} color={colors.muted} />
                  <View style={styles.sourceTextWrap}>
                    <Text style={styles.sourceTitle} numberOfLines={2}>
                      {articleTitle}
                    </Text>
                    <Text style={styles.sourceHelp}>
                      {t('adminAudioGuide:sourceHelp')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.meta}>
                  {t('adminAudioGuide:languageLabel')}:{' '}
                  {languageFromUrl
                    ? t('adminAudioGuide:languageFromUrl', { lang: language })
                    : t('adminAudioGuide:languageFromApp', { lang: language })}
                </Text>
                <Text style={styles.metaMuted}>
                  {t('adminAudioGuide:durationOptional')}:{' '}
                  {t('adminAudioGuide:durationDefault')}
                </Text>

                <Pressable
                  onPress={handleGenerate}
                  disabled={isBusy}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    isBusy && styles.primaryBtnDisabled,
                    pressed && !isBusy && styles.primaryBtnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('adminAudioGuide:ctaGenerate')}
                  accessibilityState={{ disabled: isBusy, busy: isBusy }}
                >
                  {isBusy ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {t('adminAudioGuide:ctaGenerate')}
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>

          {isBusy ? (
            <View style={styles.loadingOverlay} accessibilityLiveRegion="polite">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>
                {phase === 'pending'
                  ? t('adminAudioGuide:pending')
                  : t('adminAudioGuide:launching')}
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
  dismissArea: { flex: 1 },
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
  headerSide: { width: componentSizes.iconControlSize },
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
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  contentTerminal: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  terminalState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  terminalTitle: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  terminalBody: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  title: { ...textStyle('displayMd'), color: colors.ink },
  placeName: { ...textStyle('titleMd'), color: colors.ink },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
  },
  badgeText: {
    ...textStyle('bodySm'),
    color: colors.primary,
    fontWeight: '600',
  },
  fieldLabel: { ...textStyle('titleSm'), color: colors.ink },
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
  sourceTextWrap: { flex: 1, gap: spacing.xxs },
  sourceTitle: { ...textStyle('titleMd'), color: colors.ink },
  sourceHelp: { ...textStyle('bodySm'), color: colors.muted },
  meta: { ...textStyle('bodySm'), color: colors.ink },
  metaMuted: { ...textStyle('bodySm'), color: colors.muted },
  primaryBtn: {
    alignSelf: 'stretch',
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryBtnDisabled: { backgroundColor: colors.mutedSoft },
  primaryBtnPressed: { backgroundColor: colors.primaryActive },
  primaryBtnText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
    textAlign: 'center',
  },
  linkBtn: {
    minHeight: componentSizes.iconControlSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  linkBtnText: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    fontWeight: '600',
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
  loadingText: { ...textStyle('bodyMd'), color: colors.ink },
});
