import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import type {
  WikipediaExistingNearbyPoi,
  WikipediaNearbyAnchor,
  WikipediaNearbyItem,
} from '../../lib/api/adminWikipedia';
import type { AdminWikipediaErrorKey } from '../../lib/mappers/adminWikipediaError';

const THUMB_SIZE = 48;

interface AddWikipediaNearbyStepProps {
  hasPlacementPin: boolean;
  anchor: WikipediaNearbyAnchor | null;
  items: WikipediaNearbyItem[];
  existingNearbyPois: WikipediaExistingNearbyPoi[];
  radiusMeters: number;
  isSearching: boolean;
  errorKey: AdminWikipediaErrorKey | null;
  onRetry: () => void;
  onSelect: (item: WikipediaNearbyItem) => void;
  onIncreaseRadius: () => void;
  onDecreaseRadius: () => void;
  onSwitchToSearch: () => void;
}

export function AddWikipediaNearbyStep({
  hasPlacementPin,
  anchor,
  items,
  existingNearbyPois,
  radiusMeters,
  isSearching,
  errorKey,
  onRetry,
  onSelect,
  onIncreaseRadius,
  onDecreaseRadius,
  onSwitchToSearch,
}: AddWikipediaNearbyStepProps) {
  const { t } = useTranslation('adminAddPlace');
  const router = useRouter();

  return (
    <View style={styles.root}>
      {!hasPlacementPin ? (
        <View style={styles.messageBlock}>
          <Text style={styles.messageText}>{t('nearbyHint')}</Text>
        </View>
      ) : (
        <>
          {anchor?.label ? (
            <Text style={styles.anchorLabel}>
              {t('anchorLabel', { label: anchor.label })}
            </Text>
          ) : null}

          <View style={styles.radiusRow}>
            <Pressable
              style={({ pressed }) => [
                styles.radiusButton,
                pressed && styles.pressed,
              ]}
              onPress={onDecreaseRadius}
              accessibilityRole="button"
              accessibilityLabel={t('decreaseRadius')}
            >
              <Ionicons name="remove" size={18} color={colors.ink} />
            </Pressable>
            <Text style={styles.radiusLabel}>
              {t('radiusLabel', { meters: radiusMeters })}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.radiusButton,
                pressed && styles.pressed,
              ]}
              onPress={onIncreaseRadius}
              accessibilityRole="button"
              accessibilityLabel={t('increaseRadius')}
            >
              <Ionicons name="add" size={18} color={colors.ink} />
            </Pressable>
          </View>

          {existingNearbyPois.length > 0 ? (
            <View style={styles.duplicateBanner} accessibilityRole="alert">
              {existingNearbyPois.map((poi) => (
                <View key={poi.id} style={styles.duplicateRow}>
                  <Text style={styles.duplicateText}>
                    {t('duplicateWarning', {
                      meters: poi.distanceMeters,
                      title: poi.title,
                    })}
                  </Text>
                  <Pressable
                    onPress={() => router.push(`/place/${poi.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={t('duplicateViewExisting')}
                  >
                    <Text style={styles.duplicateLink}>
                      {t('duplicateViewExisting')}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          {renderResults()}
        </>
      )}
    </View>
  );

  function renderResults() {
    if (isSearching) {
      return (
        <View style={styles.messageBlock}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    if (errorKey) {
      return (
        <View style={styles.messageBlock}>
          <Text style={styles.errorText}>{t(errorKey)}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={t('retry')}
          >
            <Text style={styles.retryLabel}>{t('retry')}</Text>
          </Pressable>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.messageBlock}>
          <Text style={styles.messageText}>{t('nearbyEmpty')}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={onSwitchToSearch}
            accessibilityRole="button"
            accessibilityLabel={t('tabSearch')}
          >
            <Text style={styles.retryLabel}>{t('tabSearch')}</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.wikipediaUrl}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}
            onPress={() => onSelect(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${t('distanceBadge', { meters: item.distanceMeters })}`}
          >
            {item.thumbnailUrl ? (
              <Image
                source={{ uri: item.thumbnailUrl }}
                style={styles.resultThumb}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View style={[styles.resultThumb, styles.resultThumbPlaceholder]}>
                <Ionicons name="image-outline" size={20} color={colors.mutedSoft} />
              </View>
            )}
            <View style={styles.resultText}>
              <Text style={styles.resultTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.description ? (
                <Text style={styles.resultDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            <Text style={styles.distanceBadge}>
              {t('distanceBadge', { meters: item.distanceMeters })}
            </Text>
          </Pressable>
        )}
      />
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  anchorLabel: {
    ...textStyle('bodySm'),
    color: colors.muted,
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
  },
  radiusButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusLabel: {
    ...textStyle('bodyMd'),
    color: colors.ink,
    minWidth: 120,
    textAlign: 'center',
  },
  duplicateBanner: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
    gap: spacing.sm,
  },
  duplicateRow: {
    gap: spacing.xs,
  },
  duplicateText: {
    ...textStyle('bodySm'),
    color: colors.ink,
  },
  duplicateLink: {
    ...textStyle('buttonSm'),
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    minHeight: 44,
  },
  resultThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSoft,
  },
  resultThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  resultText: {
    flex: 1,
    gap: spacing.xxs,
  },
  resultTitle: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  resultDescription: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  distanceBadge: {
    ...textStyle('microLabel'),
    color: colors.muted,
  },
  messageBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
  },
  messageText: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  errorText: {
    ...textStyle('bodyMd'),
    color: colors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceSoft,
  },
  retryLabel: {
    ...textStyle('buttonSm'),
    color: colors.ink,
  },
  pressed: {
    opacity: 0.7,
  },
});
