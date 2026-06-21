import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteItineraryRow } from '../../components/favorites/FavoriteItineraryRow';
import { FavoritePlaceRow } from '../../components/favorites/FavoritePlaceRow';
import { FavoritesEmptyState } from '../../components/favorites/FavoritesEmptyState';
import { UndoSnackbar } from '../../components/ui/UndoSnackbar';
import { FAVORITES_COPY } from '../../constants/favoritesCopy';
import { colors, spacing, textStyle } from '../../constants/theme';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getPlaceHref } from '../../lib/placeNavigation';

const UNDO_MS = 4000;

type PendingRemoval =
  | { kind: 'place'; id: string }
  | { kind: 'itinerary'; id: string };

export default function FavorisScreen() {
  const router = useRouter();
  const {
    isReady,
    favoritePlaces,
    favoriteItineraries,
    togglePlaceFavorite,
    toggleItineraryFavorite,
  } = useFavorites();

  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<PendingRemoval | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const commitRemoval = useCallback(
    (pending: PendingRemoval) => {
      if (pending.kind === 'place') {
        togglePlaceFavorite(pending.id);
      } else {
        toggleItineraryFavorite(pending.id);
      }
    },
    [toggleItineraryFavorite, togglePlaceFavorite],
  );

  const finalizePending = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    commitRemoval(pending);
    pendingRef.current = null;
    setPendingRemoval(null);
    setSnackbarMessage(null);
  }, [commitRemoval]);

  const handleUndo = useCallback(() => {
    clearTimer();
    pendingRef.current = null;
    setPendingRemoval(null);
    setSnackbarMessage(null);
  }, [clearTimer]);

  const requestRemoval = useCallback(
    (next: PendingRemoval, message: string) => {
      if (
        pendingRef.current?.kind === next.kind &&
        pendingRef.current.id === next.id
      ) {
        handleUndo();
        return;
      }

      clearTimer();
      if (pendingRef.current) {
        commitRemoval(pendingRef.current);
      }

      pendingRef.current = next;
      setPendingRemoval(next);
      setSnackbarMessage(message);

      timerRef.current = setTimeout(() => {
        finalizePending();
        timerRef.current = null;
      }, UNDO_MS);
    },
    [clearTimer, commitRemoval, finalizePending, handleUndo],
  );

  useEffect(() => {
    return () => {
      clearTimer();
      if (pendingRef.current) {
        commitRemoval(pendingRef.current);
        pendingRef.current = null;
      }
    };
  }, [clearTimer, commitRemoval]);

  const isEmpty = favoritePlaces.length === 0 && favoriteItineraries.length === 0;

  if (!isReady) {
    return <View style={styles.loading} />;
  }

  if (isEmpty) {
    return <FavoritesEmptyState />;
  }

  function isPlacePending(placeId: string) {
    return pendingRemoval?.kind === 'place' && pendingRemoval.id === placeId;
  }

  function isItineraryPending(itineraryId: string) {
    return pendingRemoval?.kind === 'itinerary' && pendingRemoval.id === itineraryId;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle} accessibilityRole="header">
          {FAVORITES_COPY.title}
        </Text>

        {favoriteItineraries.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{FAVORITES_COPY.itinerariesSection}</Text>
            <View style={styles.list}>
              {favoriteItineraries.map((itinerary) => (
                <FavoriteItineraryRow
                  key={itinerary.id}
                  itinerary={itinerary}
                  isPendingRemoval={isItineraryPending(itinerary.id)}
                  onPress={() =>
                    router.push(`/city/${itinerary.citySlug}/itinerary/${itinerary.id}`)
                  }
                  onRemove={() =>
                    requestRemoval(
                      { kind: 'itinerary', id: itinerary.id },
                      FAVORITES_COPY.removedItinerary,
                    )
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {favoritePlaces.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{FAVORITES_COPY.placesSection}</Text>
            <View style={styles.list}>
              {favoritePlaces.map((place) => (
                <FavoritePlaceRow
                  key={place.id}
                  place={place}
                  isPendingRemoval={isPlacePending(place.id)}
                  onPress={() => router.push(getPlaceHref(place))}
                  onRemove={() =>
                    requestRemoval(
                      { kind: 'place', id: place.id },
                      FAVORITES_COPY.removedPlace,
                    )
                  }
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <UndoSnackbar
        visible={snackbarMessage != null}
        message={snackbarMessage ?? ''}
        undoLabel={FAVORITES_COPY.undo}
        onUndo={handleUndo}
        bottomInset={spacing.base}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + 56,
    gap: spacing.xl,
  },
  pageTitle: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  list: {
    gap: spacing.xs,
  },
});
