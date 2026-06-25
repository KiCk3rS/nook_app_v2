import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItineraryListRow } from '../../../../../../components/itinerary/ItineraryListRow';
import { PaywallSheet } from '../../../../../../components/paywall/PaywallSheet';
import { getCategoryLabel } from '../../../../../../constants/itineraryCategories';
import { getCityBySlug } from '../../../../../../constants/mockCities';
import { getDistrictBySlug } from '../../../../../../constants/mockDistricts';
import {
  getItinerariesByCategory,
  getItineraryById,
} from '../../../../../../constants/mockItineraries';
import {
  colors,
  componentSizes,
  spacing,
  textStyle,
} from '../../../../../../constants/theme';
import { usePremium } from '../../../../../../contexts/PremiumContext';
import { trackItineraryCategoryListViewed } from '../../../../../../lib/analytics';

export default function DistrictItineraryCategoryListScreen() {
  const { t } = useTranslation(['hub', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug, districtSlug, categorySlug } = useLocalSearchParams<{
    slug: string;
    districtSlug: string;
    categorySlug: string;
  }>();

  const city = useMemo(
    () => (typeof slug === 'string' ? getCityBySlug(slug) : undefined),
    [slug],
  );
  const district = useMemo(() => {
    if (typeof slug !== 'string' || typeof districtSlug !== 'string') return undefined;
    return getDistrictBySlug(slug, districtSlug);
  }, [slug, districtSlug]);
  const categoryLabel = useMemo(
    () => (typeof categorySlug === 'string' ? getCategoryLabel(categorySlug) : ''),
    [categorySlug],
  );

  const itineraries = useMemo(() => {
    if (
      typeof slug !== 'string' ||
      typeof districtSlug !== 'string' ||
      typeof categorySlug !== 'string'
    ) {
      return [];
    }
    return getItinerariesByCategory(slug, categorySlug, districtSlug);
  }, [slug, districtSlug, categorySlug]);

  const { isUnlocked } = usePremium();
  const [paywallItineraryId, setPaywallItineraryId] = useState<string | null>(null);

  useEffect(() => {
    if (city && categorySlug) {
      trackItineraryCategoryListViewed(city.slug, categorySlug, itineraries.length);
    }
  }, [city, categorySlug, itineraries.length]);

  function handleBack() {
    router.back();
  }

  function handleItineraryPress(itineraryId: string, isPremium: boolean) {
    if (!city) return;
    if (isPremium && !isUnlocked(itineraryId, true)) {
      setPaywallItineraryId(itineraryId);
      return;
    }
    router.push(`/city/${city.slug}/itinerary/${itineraryId}`);
  }

  const paywallItinerary = paywallItineraryId
    ? (getItineraryById(paywallItineraryId) ?? null)
    : null;

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
          {district ? <Text style={styles.headerSubtitle}>{district.name}</Text> : null}
        </View>
      </View>

      {itineraries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('hub:emptyCategory')}</Text>
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={`Retour à ${district?.name ?? 'le quartier'}`}
          >
            <Text style={styles.emptyLink}>
              Retour à {district?.name ?? 'le quartier'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItineraryListRow
              itinerary={item}
              isLocked={item.isPremium && !isUnlocked(item.id, true)}
              onPress={() => handleItineraryPress(item.id, item.isPremium)}
            />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        />
      )}

      <PaywallSheet
        visible={paywallItineraryId !== null}
        itinerary={paywallItinerary}
        sourceScreen="category_list"
        onClose={() => setPaywallItineraryId(null)}
        onUnlocked={() => {
          if (paywallItineraryId && city) {
            router.push(`/city/${city.slug}/itinerary/${paywallItineraryId}`);
          }
          setPaywallItineraryId(null);
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
