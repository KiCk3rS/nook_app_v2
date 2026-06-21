import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuidanceExperience } from '../../../components/guidance/GuidanceExperience';
import { GUIDANCE_COPY } from '../../../constants/guidanceCopy';
import { HUB_COPY } from '../../../constants/hubCopy';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../../constants/theme';
import { useRequireAuth } from '../../../hooks/useRequireAuth';
import { fetchItineraryById } from '../../../lib/api/itineraries';
import type { UserItineraryDetail } from '../../../lib/api/itineraries';

export default function UserGuidanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, step } = useLocalSearchParams<{ id: string; step?: string }>();
  const { isReady } = useRequireAuth(
    typeof id === 'string' ? `/itinerary/${id}/guide` : '/itineraries',
  );

  const [itinerary, setItinerary] = useState<UserItineraryDetail | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initialStepParam = useMemo(() => {
    if (typeof step !== 'string') return undefined;
    const parsed = parseInt(step, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [step]);

  useEffect(() => {
    if (!isReady || typeof id !== 'string') return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    void fetchItineraryById(id)
      .then((data) => {
        if (!cancelled) setItinerary(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isReady]);

  if (!isReady || isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (loadError || !itinerary || itinerary.poiIds.length < 2) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>{GUIDANCE_COPY.notFoundTitle}</Text>
        <Text style={styles.notFoundBody}>{GUIDANCE_COPY.notFoundBody}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={GUIDANCE_COPY.back}
        >
          <Text style={styles.primaryText}>{HUB_COPY.back}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GuidanceExperience
      sourceType="user"
      itineraryId={itinerary.id}
      title={itinerary.title}
      coverImageUrl=""
      stepPoiIds={itinerary.poiIds}
      initialStepParam={initialStepParam}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundTitle: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  notFoundBody: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
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
});
