import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackHandler,
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
  spacing,
  textStyle,
  zIndex,
} from '../../constants/theme';
import { useWikipediaSearch } from '../../hooks/useWikipediaSearch';
import {
  createPoiFromWikipedia,
  type AdminPoi,
} from '../../lib/api/adminPois';
import type { WikipediaSearchItem } from '../../lib/api/adminWikipedia';
import {
  mapAdminWikipediaErrorKey,
  type AdminWikipediaErrorKey,
} from '../../lib/mappers/adminWikipediaError';
import { AddWikipediaConfirmStep } from './AddWikipediaConfirmStep';
import { AddWikipediaSearchStep } from './AddWikipediaSearchStep';
import { AddWikipediaSuccessStep } from './AddWikipediaSuccessStep';

type SheetPhase =
  | { kind: 'search' }
  | {
      kind: 'confirm';
      item: WikipediaSearchItem;
      createErrorKey: AdminWikipediaErrorKey | null;
      isCreating: boolean;
    }
  | {
      kind: 'success';
      poi: AdminPoi;
      missingCoords: boolean;
    };

interface AddWikipediaPoiSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddWikipediaPoiSheet({
  visible,
  onClose,
}: AddWikipediaPoiSheetProps) {
  const { t, i18n } = useTranslation(['adminAddPlace', 'common']);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SheetPhase>({ kind: 'search' });

  const lang = (i18n.language?.split('-')[0] || 'fr').toLowerCase();
  const searchEnabled = visible && phase.kind === 'search';

  const { debouncedQuery, items, isSearching, errorKey, retry } =
    useWikipediaSearch({
      enabled: searchEnabled,
      query,
      lang,
    });

  const isCreating = phase.kind === 'confirm' && phase.isCreating;

  const reset = useCallback(() => {
    setQuery('');
    setPhase({ kind: 'search' });
  }, []);

  const navigateToPlace = useCallback(
    (poiId: string, openAdminAudio = false) => {
      reset();
      onClose();
      router.push(
        openAdminAudio
          ? `/place/${poiId}?adminGenerateAudio=1`
          : `/place/${poiId}`,
      );
    },
    [onClose, reset, router],
  );

  const handleClose = useCallback(() => {
    if (isCreating) return;
    if (phase.kind === 'success') {
      navigateToPlace(phase.poi.id);
      return;
    }
    reset();
    onClose();
  }, [isCreating, navigateToPlace, onClose, phase, reset]);

  useEffect(() => {
    if (!visible) reset();
  }, [visible, reset]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase.kind === 'confirm' && !phase.isCreating) {
        setPhase({ kind: 'search' });
        return true;
      }
      if (phase.kind === 'success') {
        navigateToPlace(phase.poi.id);
        return true;
      }
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, phase, handleClose, navigateToPlace]);

  function handleSelect(item: WikipediaSearchItem) {
    setPhase({
      kind: 'confirm',
      item,
      createErrorKey: null,
      isCreating: false,
    });
  }

  function handleBackToSearch() {
    if (isCreating) return;
    setPhase({ kind: 'search' });
  }

  async function handleCreate() {
    if (phase.kind !== 'confirm' || phase.isCreating) return;
    const { item } = phase;
    setPhase({
      kind: 'confirm',
      item,
      createErrorKey: null,
      isCreating: true,
    });

    try {
      const poi = await createPoiFromWikipedia({
        wikipediaUrl: item.wikipediaUrl,
        status: 'DRAFT',
      });
      setPhase({
        kind: 'success',
        poi,
        missingCoords: poi.lat == null || poi.lng == null,
      });
    } catch (error) {
      setPhase({
        kind: 'confirm',
        item,
        createErrorKey: mapAdminWikipediaErrorKey(error),
        isCreating: false,
      });
    }
  }

  const headerTitle =
    phase.kind === 'confirm'
      ? t('adminAddPlace:confirmTitle')
      : phase.kind === 'success'
        ? t('adminAddPlace:successTitle')
        : t('adminAddPlace:sheetTitle');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={() => {
        if (phase.kind === 'search') inputRef.current?.focus();
      }}
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
            onPress={
              phase.kind === 'confirm'
                ? handleBackToSearch
                : phase.kind === 'success'
                  ? () => navigateToPlace(phase.poi.id)
                  : handleClose
            }
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              phase.kind === 'confirm'
                ? t('adminAddPlace:backToSearch')
                : phase.kind === 'success'
                  ? t('adminAddPlace:ctaViewPlace')
                  : t('common:closeSheet')
            }
            hitSlop={8}
            disabled={isCreating}
          >
            <Ionicons
              name={phase.kind === 'confirm' ? 'arrow-back' : 'close'}
              size={22}
              color={colors.ink}
            />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <View style={styles.headerButton} />
        </View>

        {phase.kind === 'search' ? (
          <KeyboardAvoidingView
            style={styles.body}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={insets.top}
          >
            <AddWikipediaSearchStep
              query={query}
              onQueryChange={setQuery}
              debouncedQuery={debouncedQuery}
              items={items}
              isSearching={isSearching}
              errorKey={errorKey}
              onRetry={retry}
              onSelect={handleSelect}
              inputRef={inputRef}
            />
          </KeyboardAvoidingView>
        ) : null}

        {phase.kind === 'confirm' ? (
          <AddWikipediaConfirmStep
            item={phase.item}
            isCreating={phase.isCreating}
            errorKey={phase.createErrorKey}
            onCreate={() => void handleCreate()}
          />
        ) : null}

        {phase.kind === 'success' ? (
          <AddWikipediaSuccessStep
            placeTitle={phase.poi.title}
            missingCoords={phase.missingCoords}
            onGenerateAudio={() => navigateToPlace(phase.poi.id, true)}
            onViewPlace={() => navigateToPlace(phase.poi.id)}
          />
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
  pressed: {
    opacity: 0.7,
  },
});
