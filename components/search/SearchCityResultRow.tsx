import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SEARCH_SHEET_GUTTER } from '../../constants/searchDiscovery';
import type { MockCity } from '../../constants/mockCities';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface SearchCityResultRowProps {
  city: MockCity;
  subtitle: string | null;
  onPress: () => void;
}

export function SearchCityResultRow({ city, subtitle, onPress }: SearchCityResultRowProps) {
  const { t } = useTranslation('search');

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('a11yCity', { name: city.name })}
    >
      <Image
        source={{ uri: city.coverImageUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.content}>
        <Text style={styles.category}>{t('cityTypeLabel')}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {city.name}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.mutedSoft}
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

const THUMB_SIZE = 56;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: SEARCH_SHEET_GUTTER,
    minHeight: componentSizes.iconControlSize + spacing.md * 2,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  category: {
    ...textStyle('captionSm'),
    color: colors.mutedSoft,
    letterSpacing: 0.6,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  subtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
