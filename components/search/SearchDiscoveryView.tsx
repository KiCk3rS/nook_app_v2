import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PromotedCityCard } from '../city/PromotedCityCard';
import { PopularCityCard } from '../city/PopularCityCard';
import {
  popularCitySlugs,
  promotedCitySlugs,
  SEARCH_DISCOVERY_COPY,
  SEARCH_SHEET_GUTTER,
} from '../../constants/searchDiscovery';
import { getCityBySlug } from '../../constants/mockCities';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface SearchDiscoveryViewProps {
  showPromoted: boolean;
  onHidePromoted: () => void;
  onSelectCity: (citySlug: string) => void;
}

export function SearchDiscoveryView({
  showPromoted,
  onHidePromoted,
  onSelectCity,
}: SearchDiscoveryViewProps) {
  const promotedCities = promotedCitySlugs
    .map((slug) => getCityBySlug(slug))
    .filter((city): city is NonNullable<typeof city> => city !== undefined);

  const popularCities = popularCitySlugs
    .map((slug) => getCityBySlug(slug))
    .filter((city): city is NonNullable<typeof city> => city !== undefined);

  return (
    <ScrollView
      bounces
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    >
      {showPromoted && promotedCities.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{SEARCH_DISCOVERY_COPY.promotedSectionTitle}</Text>
            <PressableHideLink onPress={onHidePromoted} />
          </View>
          {promotedCities.map((city) => (
            <PromotedCityCard
              key={city.slug}
              city={city}
              onPress={() => onSelectCity(city.slug)}
            />
          ))}
        </View>
      ) : null}

      {popularCities.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{SEARCH_DISCOVERY_COPY.popularSectionTitle}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            keyboardShouldPersistTaps="handled"
          >
            {popularCities.map((city) => (
              <PopularCityCard
                key={city.slug}
                city={city}
                onPress={() => onSelectCity(city.slug)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View
        style={styles.teaser}
        accessibilityRole="text"
        accessibilityLabel={`${SEARCH_DISCOVERY_COPY.missingPlaceTitle} — ${SEARCH_DISCOVERY_COPY.missingPlaceFooter}`}
        accessibilityState={{ disabled: true }}
      >
        <View style={styles.teaserIconWrap}>
          <Ionicons name="location-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.teaserBody}>
          <Text style={styles.teaserTitle}>{SEARCH_DISCOVERY_COPY.missingPlaceTitle}</Text>
          <Text style={styles.teaserText}>{SEARCH_DISCOVERY_COPY.missingPlaceBody}</Text>
          <Text style={styles.teaserFooter}>{SEARCH_DISCOVERY_COPY.missingPlaceFooter}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function PressableHideLink({ onPress }: { onPress: () => void }) {
  return (
    <Text
      style={styles.hideLink}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={SEARCH_DISCOVERY_COPY.hidePromoted}
    >
      {SEARCH_DISCOVERY_COPY.hidePromoted}
    </Text>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SEARCH_SHEET_GUTTER,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
  },
  hideLink: {
    ...textStyle('buttonSm'),
    color: colors.muted,
    minHeight: componentSizes.iconControlSize,
    textAlignVertical: 'center',
    paddingVertical: spacing.xs,
  },
  carousel: {
    gap: spacing.md,
    paddingRight: SEARCH_SHEET_GUTTER,
  },
  teaser: {
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.base,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  teaserIconWrap: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  teaserBody: {
    flex: 1,
    gap: spacing.xs,
  },
  teaserTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  teaserText: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  teaserFooter: {
    ...textStyle('captionSm'),
    color: colors.mutedSoft,
  },
});
