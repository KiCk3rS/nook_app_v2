import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserItinerariesEmptyState } from '../../components/itineraries/UserItinerariesEmptyState';
import { UserItineraryCard } from '../../components/itineraries/UserItineraryCard';
import { USER_ITINERARIES_COPY } from '../../constants/userItinerariesCopy';
import { MOCK_USER_ITINERARIES } from '../../constants/mockUserItineraries';
import { colors, spacing, textStyle } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { deleteItinerary, fetchItineraries } from '../../lib/api/itineraries';
import { isApiConfigured } from '../../lib/config';
import type { UserItinerary } from '../../types/api';

export default function UserItinerariesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isReady } = useRequireAuth('/itineraries');
  const { isMockSession } = useAuth();

  const [items, setItems] = useState<UserItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (isMockSession) {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, refresh ? 300 : 0));
      setItems(MOCK_USER_ITINERARIES);
      setLoadError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    if (!isApiConfigured()) {
      setLoadError(USER_ITINERARIES_COPY.loadError);
      setItems([]);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchItineraries({ limit: 100 });
      setItems(data);
    } catch {
      setLoadError(USER_ITINERARIES_COPY.loadError);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isMockSession]);

  useEffect(() => {
    if (isReady) void load();
  }, [isReady, load]);

  function handleFollow(itinerary: UserItinerary) {
    const stepCount = itinerary.stepCount ?? itinerary.poiIds?.length ?? 0;
    if (stepCount < 2) {
      Alert.alert('', USER_ITINERARIES_COPY.tooShort);
      return;
    }
    router.push(`/itinerary/${itinerary.id}/guide`);
  }

  function handleDelete(itinerary: UserItinerary) {
    Alert.alert(
      USER_ITINERARIES_COPY.deleteTitle,
      USER_ITINERARIES_COPY.deleteBody(itinerary.title),
      [
        { text: USER_ITINERARIES_COPY.cancel, style: 'cancel' },
        {
          text: USER_ITINERARIES_COPY.deleteConfirm,
          style: 'destructive',
          onPress: () => {
            if (isMockSession) {
              setItems((prev) => prev.filter((item) => item.id !== itinerary.id));
              Alert.alert('', USER_ITINERARIES_COPY.deletedToast);
              return;
            }
            void (async () => {
              try {
                await deleteItinerary(itinerary.id);
                setItems((prev) => prev.filter((item) => item.id !== itinerary.id));
                Alert.alert('', USER_ITINERARIES_COPY.deletedToast);
              } catch {
                Alert.alert('', USER_ITINERARIES_COPY.loadError);
              }
            })();
          },
        },
      ],
    );
  }

  if (!isReady) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {USER_ITINERARIES_COPY.title}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable onPress={() => void load()} accessibilityRole="button">
            <Text style={styles.retry}>{USER_ITINERARIES_COPY.retry}</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <UserItinerariesEmptyState />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => void load(true)}
            />
          }
          renderItem={({ item }) => (
            <UserItineraryCard
              itinerary={item}
              onPress={() => handleFollow(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    gap: spacing.sm,
  },
  errorText: {
    ...textStyle('bodyMd'),
    color: colors.error,
    textAlign: 'center',
  },
  retry: {
    ...textStyle('buttonMd'),
    color: colors.legalLink,
  },
  list: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xxl,
  },
});
