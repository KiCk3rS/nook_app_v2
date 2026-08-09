import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
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
import { createPoiFromWikipedia } from '../../lib/api/adminPois';
import type { WikipediaSearchItem } from '../../lib/api/adminWikipedia';
import {
  mapAdminWikipediaErrorKey,
  type AdminWikipediaErrorKey,
} from '../../lib/mappers/adminWikipediaError';
import { AddWikipediaConfirmStep } from './AddWikipediaConfirmStep';
import { AddWikipediaSearchStep } from './AddWikipediaSearchStep';

type SheetPhase =
  | { kind: 'search' }
  | {
      kind: 'confirm';
      item: WikipediaSearchItem;
      createErrorKey: AdminWikipediaErrorKey | null;
      isCreating: boolean;
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

  const handleClose = useCallback(() => {
    if (isCreating) return;
    reset();
    onClose();
  }, [isCreating, onClose, reset]);

  useEffect(() => {
    if (!visible) {
      reset();
    }
  }, [visible, reset]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase.kind === 'confirm' && !phase.isCreating) {
        setPhase({ kind: 'search' });
        return true;
      }
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, phase, handleClose]);

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
      const missingCoords = poi.lat == null || poi.lng == null;

      reset();
      onClose();
      router.push(`/place/${poi.id}`);

      if (missingCoords) {
        Alert.alert(
          t('adminAddPlace:noCoordsAlertTitle'),
          t('adminAddPlace:noCoordsAlertBody'),
          [{ text: t('adminAddPlace:noCoordsAlertOk') }],
        );
      }
    } catch (error) {
      setPhase({
        kind: 'confirm',
        item,
        createErrorKey: mapAdminWikipediaErrorKey(error),
        isCreating: false,
      });
    }
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
            onPress={
              phase.kind === 'confirm' ? handleBackToSearch : handleClose
            }
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              phase.kind === 'confirm'
                ? t('adminAddPlace:backToSearch')
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
            {phase.kind === 'confirm'
              ? t('adminAddPlace:confirmTitle')
              : t('adminAddPlace:sheetTitle')}
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
        ) : (
          <AddWikipediaConfirmStep
            item={phase.item}
            isCreating={phase.isCreating}
            errorKey={phase.createErrorKey}
            onCreate={() => void handleCreate()}
          />
        )}
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
