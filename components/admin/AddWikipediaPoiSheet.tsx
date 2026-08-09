import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
  zIndex,
} from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { createPoiFromWikipedia } from '../../lib/api/adminPois';
import {
  searchWikipedia,
  type WikipediaSearchItem,
} from '../../lib/api/adminWikipedia';
import { isApiConfigured } from '../../lib/config';
import { ApiError } from '../../types/api';

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

type SheetStep = 'search' | 'confirm';

interface AddWikipediaPoiSheetProps {
  visible: boolean;
  onClose: () => void;
}

function mapSearchError(
  error: unknown,
  t: (key: string) => string,
): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 403) return t('errorForbidden');
    if (error.statusCode === 0 || error.statusCode >= 500) {
      return t('errorNetwork');
    }
  }
  return t('errorGeneric');
}

export function AddWikipediaPoiSheet({
  visible,
  onClose,
}: AddWikipediaPoiSheetProps) {
  const { t, i18n } = useTranslation(['adminAddPlace', 'common']);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isMockSession } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const apiReady = isApiConfigured() && !isMockSession;

  const [step, setStep] = useState<SheetStep>('search');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState<WikipediaSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<WikipediaSearchItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setStep('search');
    setQuery('');
    setDebouncedQuery('');
    setItems([]);
    setIsSearching(false);
    setSearchError(null);
    setSelected(null);
    setIsCreating(false);
    setCreateError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (isCreating) return;
    resetState();
    onClose();
  }, [isCreating, onClose, resetState]);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible, resetState]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'confirm' && !isCreating) {
        setStep('search');
        setCreateError(null);
        return true;
      }
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, step, isCreating, handleClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!visible || step !== 'search') return;

    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setItems([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    if (!apiReady) return;

    let cancelled = false;
    setIsSearching(true);
    setSearchError(null);

    const lang = (i18n.language?.split('-')[0] || 'fr').toLowerCase();
    void searchWikipedia({ q: debouncedQuery, lang, limit: 10 })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setItems([]);
        setSearchError(mapSearchError(error, (key) => t(`adminAddPlace:${key}`)));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, visible, step, apiReady, i18n.language, t]);

  const retrySearch = useCallback(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH || !apiReady) return;
    setIsSearching(true);
    setSearchError(null);
    const lang = (i18n.language?.split('-')[0] || 'fr').toLowerCase();
    void searchWikipedia({ q: debouncedQuery, lang, limit: 10 })
      .then((result) => setItems(result.items))
      .catch((error: unknown) => {
        setItems([]);
        setSearchError(mapSearchError(error, (key) => t(`adminAddPlace:${key}`)));
      })
      .finally(() => setIsSearching(false));
  }, [apiReady, debouncedQuery, i18n.language, t]);

  function handleSelectItem(item: WikipediaSearchItem) {
    setSelected(item);
    setCreateError(null);
    setStep('confirm');
  }

  function handleBackToSearch() {
    if (isCreating) return;
    setStep('search');
    setCreateError(null);
  }

  async function handleCreate() {
    if (!selected || isCreating) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const poi = await createPoiFromWikipedia({
        wikipediaUrl: selected.wikipediaUrl,
        status: 'DRAFT',
      });
      const missingCoords = poi.lat == null || poi.lng == null;
      resetState();
      onClose();

      const goToPlace = () => {
        router.push(`/place/${poi.id}`);
      };

      if (missingCoords) {
        Alert.alert(
          t('adminAddPlace:noCoordsAlertTitle'),
          t('adminAddPlace:noCoordsAlertBody'),
          [{ text: t('adminAddPlace:noCoordsAlertOk'), onPress: goToPlace }],
        );
      } else {
        goToPlace();
      }
    } catch (error) {
      setCreateError(mapSearchError(error, (key) => t(`adminAddPlace:${key}`)));
      setIsCreating(false);
    }
  }

  function renderSearchBody() {
    if (!apiReady) {
      return (
        <View style={styles.messageBlock}>
          <Text style={styles.messageText}>{t('adminAddPlace:apiUnavailable')}</Text>
        </View>
      );
    }

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

    if (searchError) {
      return (
        <View style={styles.messageBlock}>
          <Text style={styles.errorText}>{searchError}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            onPress={retrySearch}
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
            onPress={() => handleSelectItem(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}${item.description ? `. ${item.description}` : ''}`}
          >
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={() => inputRef.current?.focus()}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <View
        style={[
          styles.sheet,
          {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, spacing.base),
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={step === 'confirm' ? handleBackToSearch : handleClose}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={
              step === 'confirm'
                ? t('adminAddPlace:backToSearch')
                : t('common:closeSheet')
            }
            hitSlop={8}
            disabled={isCreating}
          >
            <Ionicons
              name={step === 'confirm' ? 'arrow-back' : 'close'}
              size={22}
              color={colors.ink}
            />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {step === 'confirm'
              ? t('adminAddPlace:confirmTitle')
              : t('adminAddPlace:sheetTitle')}
          </Text>
          <View style={styles.headerButton} />
        </View>

        {step === 'search' ? (
          <KeyboardAvoidingView
            style={styles.body}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={insets.top}
          >
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.mutedSoft} />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={t('adminAddPlace:searchPlaceholder')}
                placeholderTextColor={colors.mutedSoft}
                accessibilityLabel={t('adminAddPlace:searchPlaceholder')}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                editable={apiReady && !isCreating}
              />
              {query.length > 0 ? (
                <Pressable
                  onPress={() => setQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel={t('common:clearSearch')}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={20} color={colors.mutedSoft} />
                </Pressable>
              ) : null}
            </View>
            {renderSearchBody()}
          </KeyboardAvoidingView>
        ) : selected ? (
          <View style={styles.confirmBody}>
            <Text style={styles.confirmEyebrow}>
              {t('adminAddPlace:selectedLabel')}
            </Text>
            <Text style={styles.confirmTitle}>{selected.title}</Text>
            {selected.description ? (
              <Text style={styles.confirmDescription}>{selected.description}</Text>
            ) : null}
            <Text style={styles.confirmUrl} numberOfLines={2}>
              {selected.wikipediaUrl}
            </Text>
            <Text style={styles.confirmNote}>
              {t('adminAddPlace:confirmDraftNote')}
            </Text>
            <Text style={styles.confirmNote}>
              {t('adminAddPlace:confirmPositionNote')}
            </Text>

            {createError ? (
              <View style={styles.createErrorBlock}>
                <Text style={styles.errorText}>{createError}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => void handleCreate()}
                  accessibilityRole="button"
                  accessibilityLabel={t('adminAddPlace:retry')}
                  disabled={isCreating}
                >
                  <Text style={styles.retryLabel}>{t('adminAddPlace:retry')}</Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.cta,
                (isCreating || pressed) && styles.ctaPressed,
                isCreating && styles.ctaDisabled,
              ]}
              onPress={() => void handleCreate()}
              disabled={isCreating}
              accessibilityRole="button"
              accessibilityLabel={t('adminAddPlace:ctaCreate')}
              accessibilityState={{ disabled: isCreating, busy: isCreating }}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.ctaLabel}>{t('adminAddPlace:ctaCreate')}</Text>
              )}
            </Pressable>
            {isCreating ? (
              <Text style={styles.creatingHint}>{t('adminAddPlace:creating')}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.canvas,
    zIndex: zIndex.sheet,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerButton: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  body: {
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
  confirmBody: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  confirmEyebrow: {
    ...textStyle('microLabel'),
    color: colors.muted,
  },
  confirmTitle: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  confirmDescription: {
    ...textStyle('bodyMd'),
    color: colors.body,
  },
  confirmUrl: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
  },
  confirmNote: {
    ...textStyle('bodySm'),
    color: colors.muted,
    marginTop: spacing.xs,
  },
  createErrorBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  cta: {
    marginTop: 'auto',
    height: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: {
    backgroundColor: colors.primaryActive,
  },
  ctaDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  ctaLabel: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  creatingHint: {
    ...textStyle('bodySm'),
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
