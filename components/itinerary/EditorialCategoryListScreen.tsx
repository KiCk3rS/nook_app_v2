import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItineraryListRow } from './ItineraryListRow';
import { PaywallSheet } from '../paywall/PaywallSheet';
import { getCategoryLabel } from '../../constants/itineraryCategories';
import {
  colors,
  componentSizes,
  spacing,
  textStyle,
} from '../../constants/theme';
import { usePremium } from '../../contexts/PremiumContext';
import { trackItineraryCategoryListViewed } from '../../lib/analytics';
import { listEditorialItinerariesByCategory } from '../../lib/api/editorialItineraries';
import { isApiConfigured } from '../../lib/config';
import { editorialItineraryNavKey } from '../../lib/mappers/editorialItineraries';
import type { EditorialItinerary } from '../../types/api';

export interface EditorialCategoryListScreenProps {
  citySlug: string;
  categorySlug: string;
  districtSlug?: string;
  subtitle?: string;
}

export function EditorialCategoryListScreen({
  citySlug,
  categorySlug,
  districtSlug,
  subtitle,
}: EditorialCategoryListScreenProps) {
  const { t } = useTranslation(['hub', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const categoryLabel = useMemo(
    () => (categorySlug ? getCategoryLabel(categorySlug) : ''),
    [categorySlug],
  );

  const [itineraries, setItineraries] = useState<EditorialItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [paywallItinerary, setPaywallItinerary] = useState<EditorialItinerary | null>(
    null,
  );

  const { isUnlocked } = usePremium();

  const load = useCallback(async () => {
    if (!citySlug || !categorySlug) {
      setItineraries([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(false);
    try {
      const items = await listEditorialItinerariesByCategory({
        citySlug,
        categorySlug,
        districtSlug,
        useMock: !isApiConfigured(),
      });
      setItineraries(items);
    } catch {
      setItineraries([]);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [citySlug, categorySlug, districtSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isLoading && citySlug && categorySlug) {
      trackItineraryCategoryListViewed(citySlug, categorySlug, itineraries.length);
    }
  }, [isLoading, citySlug, categorySlug, itineraries.length]);

  function handleBack() {
    router.back();
  }

  function handleItineraryPress(itinerary: EditorialItinerary) {
    const navKey = editorialItineraryNavKey(itinerary);
    if (itinerary.isPremium && !isUnlocked(navKey, true)) {
      setPaywallItinerary(itinerary);
      return;
    }
    router.push(`/city/${citySlug}/itinerary/${navKey}`);
  }

  const emptyBackLabel = subtitle?.trim()
    ? subtitle
    : t('hub:a11yBackToCityFallback');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} accessibilityRole="header">
            {categoryLabel}
          </Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('common:errorGeneric')}</Text>
          <Pressable
            onPress={() => void load()}
            accessibilityRole="button"
            accessibilityLabel={t('common:retry')}
          >
            <Text style={styles.emptyLink}>{t('common:retry')}</Text>
          </Pressable>
        </View>
      ) : itineraries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('hub:emptyCategory')}</Text>
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={
              districtSlug
                ? t('hub:a11yBackToDistrict', { name: emptyBackLabel })
                : t('hub:a11yBackToCity', { name: emptyBackLabel })
            }
          >
            <Text style={styles.emptyLink}>
              {t('hub:backTo', { name: emptyBackLabel })}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const navKey = editorialItineraryNavKey(item);
            return (
              <ItineraryListRow
                itinerary={item}
                isLocked={item.isPremium && !isUnlocked(navKey, true)}
                onPress={() => handleItineraryPress(item)}
              />
            );
          }}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        />
      )}

      <PaywallSheet
        visible={paywallItinerary !== null}
        itinerary={paywallItinerary}
        sourceScreen="category_list"
        onClose={() => setPaywallItinerary(null)}
        onUnlocked={() => {
          if (paywallItinerary && citySlug) {
            router.push(
              `/city/${citySlug}/itinerary/${editorialItineraryNavKey(paywallItinerary)}`,
            );
          }
          setPaywallItinerary(null);
        }}
      />
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  backBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: spacing.xxs,
  },
  headerTitle: {
    ...textStyle('displayMd'),
    color: colors.ink,
  },
  headerSubtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  emptyLink: {
    ...textStyle('buttonMd'),
    color: colors.primary,
  },
});
