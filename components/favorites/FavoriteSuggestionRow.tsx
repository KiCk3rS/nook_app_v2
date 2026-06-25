import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { getCategoryLabel, type MockPlace } from '../../constants/mockPlaces';
import type { EditorialItinerary } from '../../constants/mockItineraries';
import { formatItineraryDuration } from '../../constants/mockItineraries';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface FavoriteSuggestionRowProps {
  kind: 'place' | 'itinerary';
  title: string;
  subtitle: string;
  imageUrl: string;
  onPress: () => void;
  onAdd: () => void;
}

export function FavoriteSuggestionRow({
  kind,
  title,
  subtitle,
  imageUrl,
  onPress,
  onAdd,
}: FavoriteSuggestionRowProps) {
  const { t } = useTranslation('favorites');

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.main, pressed && styles.mainPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.content}>
          <View style={styles.kindBadge}>
            <Ionicons
              name={kind === 'place' ? 'location-outline' : 'map-outline'}
              size={12}
              color={colors.muted}
            />
            <Text style={styles.kindText}>
              {kind === 'place' ? 'Lieu' : 'Parcours'}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
      </Pressable>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        accessibilityRole="button"
        accessibilityLabel={t('emptyAddFavorite')}
        hitSlop={8}
      >
        <Ionicons name="heart-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export function buildPlaceSuggestionSubtitle(place: MockPlace): string {
  return getCategoryLabel(place.categoryId);
}

export function buildItinerarySuggestionSubtitle(itinerary: EditorialItinerary): string {
  return formatItineraryDuration(itinerary.durationMinutes);
}

const THUMB_SIZE = 64;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  mainPressed: {
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
    gap: 2,
  },
  kindBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  kindText: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  title: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  subtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  addBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.canvas,
  },
  addBtnPressed: {
    backgroundColor: colors.surfaceSoft,
  },
});
