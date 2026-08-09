import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PromotedCityCard } from '../city/PromotedCityCard';
import { PopularCityCard } from '../city/PopularCityCard';
import { SEARCH_SHEET_GUTTER } from '../../constants/searchDiscovery';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useCityCarousels } from '../../hooks/useCityCarousels';

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
  const { t } = useTranslation('search');
  const { promotedCities, popularCities, loading } = useCityCarousels();

  return (
    <ScrollView
      bounces
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}

      {showPromoted && promotedCities.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('promotedSectionTitle')}</Text>
            <PressableHideLink label={t('hidePromoted')} onPress={onHidePromoted} />
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
          <Text style={styles.sectionTitle}>{t('popularSectionTitle')}</Text>
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
        accessibilityLabel={`${t('missingPlaceTitle')} — ${t('missingPlaceFooter')}`}
        accessibilityState={{ disabled: true }}
      >
        <View style={styles.teaserIconWrap}>
          <Ionicons name="location-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.teaserBody}>
          <Text style={styles.teaserTitle}>{t('missingPlaceTitle')}</Text>
          <Text style={styles.teaserText}>{t('missingPlaceBody')}</Text>
          <Text style={styles.teaserFooter}>{t('missingPlaceFooter')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function PressableHideLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Text
      style={styles.hideLink}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {label}
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
  loading: {
    paddingVertical: spacing.md,
    alignItems: 'center',
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
