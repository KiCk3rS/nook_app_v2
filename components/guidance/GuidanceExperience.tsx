import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GUIDANCE_COPY } from '../../constants/guidanceCopy';
import {
  formatAudioDuration,
  getPlaceById,
  type MockPlace,
} from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  elevation,
  miniPlayerHeight,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useAudioPlayback } from '../../contexts/AudioPlaybackContext';
import {
  distanceMeters,
  estimateWalkMinutes,
  formatDistanceMeters,
} from '../../lib/geo';
import {
  clearGuidanceProgress,
  getGuidanceProgress,
  saveGuidanceProgress,
  type GuidanceSourceType,
} from '../../lib/guidanceProgress';
import {
  trackGuidanceAudioTapped,
  trackGuidanceCompleted,
  trackGuidanceMapTapped,
  trackGuidancePlaceDetailTapped,
  trackGuidanceQuitTapped,
  trackGuidanceResumeChoice,
  trackGuidanceResumePromptShown,
  trackGuidanceStarted,
  trackGuidanceStepCompleted,
  trackGuidanceStepViewed,
} from '../../lib/analytics';
import { GuidanceMapSection } from './GuidanceMapSection';
import { GuidanceResumeSheet } from './GuidanceResumeSheet';

export interface GuidanceExperienceProps {
  sourceType: GuidanceSourceType;
  itineraryId: string;
  title: string;
  coverImageUrl: string;
  stepPoiIds: string[];
  citySlug?: string;
  cityName?: string;
  initialStepParam?: number;
}

function getReadyGuide(place: MockPlace) {
  return place.audioGuides.find((g) => g.status === 'ready');
}

function clampStep(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

export function GuidanceExperience({
  sourceType,
  itineraryId,
  title,
  coverImageUrl,
  stepPoiIds,
  citySlug,
  cityName,
  initialStepParam,
}: GuidanceExperienceProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startedRef = useRef(false);

  const stepCount = stepPoiIds.length;
  const places = useMemo(
    () =>
      stepPoiIds.map((id) => getPlaceById(id)).filter((p): p is MockPlace => p !== undefined),
    [stepPoiIds],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'resume' | 'active' | 'completed'>('loading');
  const [resumeStepIndex, setResumeStepIndex] = useState(0);
  const [resumeStepName, setResumeStepName] = useState('');

  const {
    startPlayback,
    minimize,
    pause,
    isPlaying,
    viewMode,
  } = useAudioPlayback();

  const miniPlayerInset =
    viewMode === 'mini' ? miniPlayerHeight + spacing.sm : 0;

  const currentPlace = places[stepIndex];
  const nextPlace = stepIndex < places.length - 1 ? places[stepIndex + 1] : null;
  const isLastStep = stepIndex >= stepCount - 1;
  const readyGuide = currentPlace ? getReadyGuide(currentPlace) : undefined;

  const distanceToNext =
    currentPlace && nextPlace
      ? distanceMeters(
          currentPlace.latitude,
          currentPlace.longitude,
          nextPlace.latitude,
          nextPlace.longitude,
        )
      : null;

  const persistProgress = useCallback(
    async (index: number, completedAt?: number) => {
      await saveGuidanceProgress(sourceType, itineraryId, {
        stepIndex: index,
        updatedAt: Date.now(),
        completedAt,
      });
    },
    [sourceType, itineraryId],
  );

  const enterGuidance = useCallback(
    (index: number, resume: boolean) => {
      const clamped = clampStep(index, stepCount);
      setStepIndex(clamped);
      setPhase('active');
      if (!startedRef.current) {
        startedRef.current = true;
        trackGuidanceStarted(sourceType, itineraryId, resume, citySlug);
      }
      trackGuidanceStepViewed(
        sourceType,
        itineraryId,
        clamped,
        stepPoiIds[clamped],
      );
    },
    [citySlug, itineraryId, sourceType, stepCount, stepPoiIds],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const saved = await getGuidanceProgress(sourceType, itineraryId);

      if (cancelled) return;

      if (typeof initialStepParam === 'number' && !Number.isNaN(initialStepParam)) {
        enterGuidance(initialStepParam, false);
        return;
      }

      if (saved?.completedAt) {
        await clearGuidanceProgress(sourceType, itineraryId);
        enterGuidance(0, false);
        return;
      }

      if (saved && saved.stepIndex > 0) {
        const savedPlace = getPlaceById(stepPoiIds[saved.stepIndex] ?? '');
        const name = savedPlace?.name ?? 'Étape';
        setResumeStepIndex(saved.stepIndex);
        setResumeStepName(name);
        trackGuidanceResumePromptShown(sourceType, itineraryId, saved.stepIndex);
        setPhase('resume');
        return;
      }

      enterGuidance(saved?.stepIndex ?? 0, false);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [enterGuidance, initialStepParam, itineraryId, sourceType, stepPoiIds]);

  useEffect(() => {
    if (phase !== 'active') return;
    void persistProgress(stepIndex);
  }, [phase, persistProgress, stepIndex]);

  function handleResume() {
    trackGuidanceResumeChoice(sourceType, itineraryId, 'resume');
    enterGuidance(resumeStepIndex, true);
  }

  async function handleRestart() {
    trackGuidanceResumeChoice(sourceType, itineraryId, 'restart');
    await clearGuidanceProgress(sourceType, itineraryId);
    enterGuidance(0, false);
  }

  function handleQuit() {
    const needsConfirm = stepIndex > 0 || isPlaying || viewMode !== 'idle';

    if (!needsConfirm) {
      trackGuidanceQuitTapped(sourceType, itineraryId, stepIndex, true);
      router.back();
      return;
    }

    Alert.alert(GUIDANCE_COPY.quitTitle, GUIDANCE_COPY.quitBody, [
      {
        text: GUIDANCE_COPY.quitCancel,
        style: 'cancel',
        onPress: () =>
          trackGuidanceQuitTapped(sourceType, itineraryId, stepIndex, false),
      },
      {
        text: GUIDANCE_COPY.quitConfirm,
        style: 'destructive',
        onPress: () => {
          trackGuidanceQuitTapped(sourceType, itineraryId, stepIndex, true);
          router.back();
        },
      },
    ]);
  }

  function handleListen() {
    if (!currentPlace || !readyGuide) return;
    startPlayback(currentPlace, readyGuide);
    minimize();
    trackGuidanceAudioTapped(
      sourceType,
      itineraryId,
      currentPlace.id,
      readyGuide.id,
    );
  }

  function handleViewPlace() {
    if (!currentPlace) return;
    trackGuidancePlaceDetailTapped(sourceType, itineraryId, currentPlace.id);
    router.push(`/place/${currentPlace.id}`);
  }

  function handleMap() {
    trackGuidanceMapTapped(sourceType, itineraryId, stepIndex);
    if (citySlug) {
      router.push({
        pathname: '/(tabs)',
        params: { focusCity: citySlug },
      });
      return;
    }
    router.push('/(tabs)');
  }

  function goToStep(nextIndex: number) {
    if (isPlaying) {
      pause();
    }
    const clamped = clampStep(nextIndex, stepCount);
    setStepIndex(clamped);
    trackGuidanceStepViewed(sourceType, itineraryId, clamped, stepPoiIds[clamped]);
  }

  function handlePrev() {
    if (stepIndex <= 0) return;
    goToStep(stepIndex - 1);
  }

  function handleNext() {
    if (isLastStep) {
      handleFinish();
      return;
    }
    trackGuidanceStepCompleted(
      sourceType,
      itineraryId,
      stepIndex,
      stepPoiIds[stepIndex],
    );
    goToStep(stepIndex + 1);
  }

  async function handleFinish() {
    if (isPlaying) {
      pause();
    }
    trackGuidanceStepCompleted(
      sourceType,
      itineraryId,
      stepIndex,
      stepPoiIds[stepIndex],
    );
    trackGuidanceCompleted(sourceType, itineraryId, stepCount);
    await persistProgress(stepIndex, Date.now());
    setPhase('completed');
  }

  function handleBackToItinerary() {
    router.back();
  }

  function handleBackToCity() {
    if (citySlug) {
      router.replace(`/city/${citySlug}`);
      return;
    }
    router.replace('/(tabs)');
  }

  if (phase === 'loading') {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.mutedText}>{GUIDANCE_COPY.progress(1, stepCount)}</Text>
      </View>
    );
  }

  if (phase === 'completed') {
    return (
      <View
        style={[
          styles.screen,
          styles.completed,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.completedIcon}>
          <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
        </View>
        <Text style={styles.completedTitle}>{GUIDANCE_COPY.completedTitle}</Text>
        <Text style={styles.completedSubtitle}>
          {GUIDANCE_COPY.completedSubtitle(title)}
        </Text>
        <View style={styles.completedActions}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
            onPress={handleBackToItinerary}
            accessibilityRole="button"
            accessibilityLabel={GUIDANCE_COPY.backToItinerary}
          >
            <Text style={styles.primaryText}>{GUIDANCE_COPY.backToItinerary}</Text>
          </Pressable>
          {cityName ? (
            <Pressable
              style={({ pressed }) => [styles.linkBtn, pressed && styles.linkPressed]}
              onPress={handleBackToCity}
              accessibilityRole="button"
              accessibilityLabel={GUIDANCE_COPY.backToCity(cityName)}
            >
              <Text style={styles.linkText}>{GUIDANCE_COPY.backToCity(cityName)}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  const stepImageUrl = currentPlace?.imageUrl ?? coverImageUrl;
  const stepName = currentPlace?.name ?? 'Lieu introuvable';

  return (
    <View style={styles.screen} accessibilityLabel={GUIDANCE_COPY.a11yScreen(title)}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={handleQuit}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={GUIDANCE_COPY.quit}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>

        <View style={styles.headerBody}>
          <Text style={styles.headerTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.progressLabel} accessibilityRole="text">
            {GUIDANCE_COPY.progress(stepIndex + 1, stepCount)}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((stepIndex + 1) / stepCount) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xl + miniPlayerInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepCard}>
          <View style={styles.stepImageWrap}>
            <Image
              source={{ uri: stepImageUrl }}
              style={styles.stepImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{stepIndex + 1}</Text>
            </View>
          </View>
          <Text style={styles.stepName}>{stepName}</Text>
          {currentPlace?.address ? (
            <Text style={styles.stepAddress}>{currentPlace.address}</Text>
          ) : null}
        </View>

        {nextPlace ? (
          <View style={styles.nextHint}>
            <Text style={styles.nextHintTitle}>
              {GUIDANCE_COPY.nextStep(nextPlace.name)}
            </Text>
            {distanceToNext !== null ? (
              <Text style={styles.nextHintMeta}>
                {GUIDANCE_COPY.walkHint(
                  formatDistanceMeters(distanceToNext),
                  estimateWalkMinutes(distanceToNext),
                )}
              </Text>
            ) : null}
          </View>
        ) : null}

        {readyGuide ? (
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
            onPress={handleListen}
            accessibilityRole="button"
            accessibilityLabel={
              readyGuide.durationSec
                ? `${GUIDANCE_COPY.listenCta} — ${formatAudioDuration(readyGuide.durationSec)}`
                : GUIDANCE_COPY.listenCta
            }
          >
            <Ionicons name="headset-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.primaryText}>{GUIDANCE_COPY.listenCta}</Text>
            {readyGuide.durationSec ? (
              <Text style={styles.listenDuration}>
                {formatAudioDuration(readyGuide.durationSec)}
              </Text>
            ) : null}
          </Pressable>
        ) : (
          <Text style={styles.noAudio}>{GUIDANCE_COPY.noAudio}</Text>
        )}

        <GuidanceMapSection
          places={places}
          currentStepIndex={stepIndex}
          stepName={stepName}
          onOpenMap={handleMap}
          onViewPlace={handleViewPlace}
          canViewPlace={Boolean(currentPlace)}
        />
      </ScrollView>

      <View
        style={[
          styles.navBar,
          {
            paddingBottom: insets.bottom + spacing.sm + miniPlayerInset,
          },
        ]}
      >
        <Pressable
          onPress={handlePrev}
          disabled={stepIndex <= 0}
          style={({ pressed }) => [
            styles.navBtn,
            stepIndex <= 0 && styles.navBtnDisabled,
            pressed && stepIndex > 0 && styles.navBtnPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={GUIDANCE_COPY.prevStep}
          accessibilityState={{ disabled: stepIndex <= 0 }}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={stepIndex <= 0 ? colors.muted : colors.ink}
          />
          <Text
            style={[
              styles.navBtnText,
              stepIndex <= 0 && styles.navBtnTextDisabled,
            ]}
          >
            {GUIDANCE_COPY.prevStep}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.navBtnPrimary, pressed && styles.primaryPressed]}
          accessibilityRole="button"
          accessibilityLabel={
            isLastStep ? GUIDANCE_COPY.finishCta : GUIDANCE_COPY.nextStepCta
          }
        >
          <Text style={styles.navBtnPrimaryText}>
            {isLastStep ? GUIDANCE_COPY.finishCta : GUIDANCE_COPY.nextStepCta}
          </Text>
          {!isLastStep ? (
            <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
          ) : null}
        </Pressable>
      </View>

      <GuidanceResumeSheet
        visible={phase === 'resume'}
        stepNumber={resumeStepIndex + 1}
        stepName={resumeStepName}
        onResume={handleResume}
        onRestart={() => void handleRestart()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedText: {
    ...textStyle('bodyMd'),
    color: colors.muted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  iconButton: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.control,
  },
  headerBody: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  progressLabel: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  progressTrack: {
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  stepCard: {
    gap: spacing.sm,
  },
  stepImageWrap: {
    position: 'relative',
  },
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
  },
  stepBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...textStyle('buttonSm'),
    color: colors.onPrimary,
    fontWeight: '700',
  },
  stepName: {
    ...textStyle('displayMd'),
    color: colors.ink,
  },
  stepAddress: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  nextHint: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  nextHintTitle: {
    ...textStyle('bodyMd'),
    color: colors.ink,
    fontWeight: '600',
  },
  nextHintMeta: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  primaryBtn: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  listenDuration: {
    ...textStyle('captionSm'),
    color: colors.onPrimary,
    opacity: 0.85,
  },
  noAudio: {
    ...textStyle('bodyMd'),
    color: colors.muted,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...textStyle('buttonMd'),
    color: colors.primary,
  },
  linkPressed: {
    opacity: 0.85,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.sm,
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  navBtnText: {
    ...textStyle('buttonSm'),
    color: colors.ink,
  },
  navBtnTextDisabled: {
    color: colors.muted,
  },
  navBtnPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  navBtnPrimaryText: {
    ...textStyle('buttonSm'),
    color: colors.onPrimary,
    fontWeight: '600',
  },
  completed: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  completedIcon: {
    marginBottom: spacing.sm,
  },
  completedTitle: {
    ...textStyle('displayLg'),
    color: colors.ink,
    textAlign: 'center',
  },
  completedSubtitle: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  completedActions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
