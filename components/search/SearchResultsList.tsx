import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SEARCH_SHEET_GUTTER } from '../../constants/searchDiscovery';
import type { SearchResult } from '../../lib/searchPlaces';
import { colors, spacing, textStyle } from '../../constants/theme';

import { SearchCityResultRow } from './SearchCityResultRow';
import { SearchResultRow } from './SearchResultRow';

interface SearchResultsListProps {
  query: string;
  results: SearchResult[];
  onSelectPlace: (placeId: string) => void;
  onSelectCity: (citySlug: string) => void;
}

export function SearchResultsList({
  query,
  results,
  onSelectPlace,
  onSelectCity,
}: SearchResultsListProps) {
  const { t } = useTranslation('search');

  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{t('emptyResultsTitle', { query })}</Text>
        <Text style={styles.emptyHint}>{t('emptyResultsHint')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => (item.type === 'city' ? `city-${item.city.slug}` : `place-${item.place.id}`)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) =>
        item.type === 'city' ? (
          <SearchCityResultRow
            city={item.city}
            subtitle={item.subtitle}
            onPress={() => onSelectCity(item.city.slug)}
          />
        ) : (
          <SearchResultRow
            place={item.place}
            subtitle={item.subtitle}
            onPress={() => onSelectPlace(item.place.id)}
          />
        )
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingHorizontal: SEARCH_SHEET_GUTTER,
    paddingTop: spacing.xxl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  emptyTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  emptyHint: {
    ...textStyle('bodySm'),
    color: colors.muted,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.hairlineSoft,
    marginHorizontal: SEARCH_SHEET_GUTTER,
  },
});
