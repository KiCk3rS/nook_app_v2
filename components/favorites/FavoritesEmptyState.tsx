import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  buildItinerarySuggestionSubtitle,
  buildPlaceSuggestionSubtitle,
  FavoriteSuggestionRow,
} from './FavoriteSuggestionRow';
import { FAVORITES_EMPTY_SUGGESTIONS } from '../../constants/favoritesEmptySuggestions';
import { getCityBySlug } from '../../constants/mockCities';
import { getItineraryById } from '../../constants/mockItineraries';
import { getPlaceById } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
} from '../../constants/theme';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getPlaceHref } from '../../lib/placeNavigation';

const TIPS = [
  { icon: 'map-outline' as const, key: 'emptyTipMap' as const },
  { icon: 'heart-outline' as const, key: 'emptyTipHeart' as const },
  { icon: 'bookmark-outline' as const, key: 'emptyTipHere' as const },
];

export function FavoritesEmptyState() {
  const router = useRouter();
  const { t } = useTranslation('favorites');
  const { togglePlaceFavorite, toggleItineraryFavorite } = useFavorites();

  const city = useMemo(
    () => getCityBySlug(FAVORITES_EMPTY_SUGGESTIONS.citySlug),
    [],
  );

  const suggestedPlaces = useMemo(
    () =>
      FAVORITES_EMPTY_SUGGESTIONS.placeIds
        .map((id) => getPlaceById(id))
        .filter((place) => place != null),
    [],
  );

  const suggestedItineraries = useMemo(
    () =>
      FAVORITES_EMPTY_SUGGESTIONS.itineraryIds
        .map((id) => getItineraryById(id))
        .filter((itinerary) => itinerary != null),
    [],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle} accessibilityRole="header">
          {t('title')}
        </Text>

        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="heart-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>{t('emptyTitle')}</Text>
          <Text style={styles.heroBody}>{t('emptyBody')}</Text>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>{t('emptyHowTitle')}</Text>
          {TIPS.map((tip) => (
            <View key={tip.key} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.tipText}>{t(tip.key)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaGroup}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel={t('emptyCtaMap')}
          >
            <Ionicons name="map-outline" size={20} color={colors.onPrimary} />
            <Text style={styles.primaryText}>{t('emptyCtaMap')}</Text>
          </Pressable>

          {city ? (
            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && styles.secondaryPressed,
              ]}
              onPress={() => router.push(`/city/${city.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={t('emptyCtaCity', { city: city.name })}
            >
              <Ionicons name="compass-outline" size={20} color={colors.ink} />
              <Text style={styles.secondaryText}>
                {t('emptyCtaCity', { city: city.name })}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {suggestedPlaces.length > 0 || suggestedItineraries.length > 0 ? (
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>
              {t('emptySuggestionsTitle')}
            </Text>
            <View style={styles.suggestionsList}>
              {suggestedItineraries.map((itinerary) => (
                <FavoriteSuggestionRow
                  key={itinerary.id}
                  kind="itinerary"
                  title={itinerary.title}
                  subtitle={buildItinerarySuggestionSubtitle(itinerary)}
                  imageUrl={itinerary.coverImageUrl}
                  onPress={() =>
                    router.push(`/city/${itinerary.citySlug}/itinerary/${itinerary.id}`)
                  }
                  onAdd={() => toggleItineraryFavorite(itinerary.id)}
                />
              ))}
              {suggestedPlaces.map((place) => (
                <FavoriteSuggestionRow
                  key={place.id}
                  kind="place"
                  title={place.name}
                  subtitle={buildPlaceSuggestionSubtitle(place)}
                  imageUrl={place.imageUrl}
                  onPress={() => router.push(getPlaceHref(place))}
                  onAdd={() => togglePlaceFavorite(place.id)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  pageTitle: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  heroBody: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  tipsCard: {
    ...surfaceCardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  tipsTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    ...textStyle('bodySm'),
    color: colors.body,
    flex: 1,
  },
  ctaGroup: {
    gap: spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  secondaryText: {
    ...textStyle('buttonMd'),
    color: colors.ink,
  },
  suggestions: {
    gap: spacing.sm,
  },
  suggestionsTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  suggestionsList: {
    gap: spacing.xs,
  },
});
