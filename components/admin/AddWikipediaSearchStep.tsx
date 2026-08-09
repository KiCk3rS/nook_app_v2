import { Ionicons } from '@expo/vector-icons';
import type { RefObject } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import type { WikipediaSearchItem } from '../../lib/api/adminWikipedia';
import type { AdminWikipediaErrorKey } from '../../lib/mappers/adminWikipediaError';

const MIN_QUERY_LENGTH = 2;
const THUMB_SIZE = 48;

interface AddWikipediaSearchStepProps {
  query: string;
  onQueryChange: (value: string) => void;
  debouncedQuery: string;
  items: WikipediaSearchItem[];
  isSearching: boolean;
  errorKey: AdminWikipediaErrorKey | null;
  onRetry: () => void;
  onSelect: (item: WikipediaSearchItem) => void;
  inputRef: RefObject<TextInput | null>;
}

export function AddWikipediaSearchStep({
  query,
  onQueryChange,
  debouncedQuery,
  items,
  isSearching,
  errorKey,
  onRetry,
  onSelect,
  inputRef,
}: AddWikipediaSearchStepProps) {
  const { t } = useTranslation(['adminAddPlace', 'common']);

  return (
    <View style={styles.root}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.mutedSoft} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={query}
          onChangeText={onQueryChange}
          placeholder={t('adminAddPlace:searchPlaceholder')}
          placeholderTextColor={colors.mutedSoft}
          accessibilityLabel={t('adminAddPlace:searchPlaceholder')}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => onQueryChange('')}
            accessibilityRole="button"
            accessibilityLabel={t('common:clearSearch')}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={20} color={colors.mutedSoft} />
          </Pressable>
        ) : null}
      </View>
      {renderBody()}
    </View>
  );

  function renderBody() {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      return (
        <View style={styles.messageBlock}>
          <Text style={styles.messageText}>{t('adminAddPlace:searchHint')}</Text>
        </View>
      );
    }

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
          <Text style={styles.errorText}>{t(`adminAddPlace:${errorKey}`)}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel={t('adminAddPlace:retry')}
          >
            <Text style={styles.retryLabel}>{t('adminAddPlace:retry')}</Text>
          </Pressable>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.messageBlock}>
          <Text style={styles.messageText}>{t('adminAddPlace:emptyResults')}</Text>
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
            accessibilityLabel={`${item.title}${item.description ? `. ${item.description}` : ''}`}
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
            <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: componentSizes.iconControlSize,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  searchInput: {
    ...textStyle('bodyMd'),
    color: colors.ink,
    flex: 1,
    paddingVertical: spacing.sm,
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
