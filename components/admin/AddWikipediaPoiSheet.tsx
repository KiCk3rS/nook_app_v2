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
import { useWikipediaNearby } from '../../hooks/useWikipediaNearby';
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
import type { AddPlaceSheetMode, PlacementPin } from './AdminAddPlaceContext';
import { AddPlaceModeTabs } from './AddPlaceModeTabs';
import { AddWikipediaConfirmStep } from './AddWikipediaConfirmStep';
import { AddWikipediaNearbyStep } from './AddWikipediaNearbyStep';
import { AddWikipediaSearchStep } from './AddWikipediaSearchStep';
import { AddWikipediaSuccessStep } from './AddWikipediaSuccessStep';

type SheetPhase =
  | { kind: 'browse'; tab: AddPlaceSheetMode }
  | {
      kind: 'confirm';
      item: WikipediaSearchItem;
      anchor: PlacementPin | null;
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
  initialMode: AddPlaceSheetMode;
  placementPin: PlacementPin | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWikipediaPoiSheet({
  visible,
  initialMode,
  placementPin,
  onClose,
  onSuccess,
}: AddWikipediaPoiSheetProps) {
  const { t, i18n } = useTranslation(['adminAddPlace', 'common']);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SheetPhase>({
    kind: 'browse',
    tab: initialMode,
  });

  const lang = (i18n.language?.split('-')[0] || 'fr').toLowerCase();
  const browseTab = phase.kind === 'browse' ? phase.tab : 'search';
  const searchEnabled = visible && phase.kind === 'browse' && browseTab === 'search';
  const nearbyEnabled =
    visible && phase.kind === 'browse' && browseTab === 'nearby';

  const { debouncedQuery, items, isSearching, errorKey, retry } =
    useWikipediaSearch({
      enabled: searchEnabled,
      query,
      lang,
    });

  const nearby = useWikipediaNearby({
    enabled: nearbyEnabled,
    lat: placementPin?.lat ?? null,
    lng: placementPin?.lng ?? null,
    lang,
  });

  const isCreating = phase.kind === 'confirm' && phase.isCreating;

  const reset = useCallback(
    (tab: AddPlaceSheetMode = initialMode) => {
      setQuery('');
      setPhase({ kind: 'browse', tab });
    },
    [initialMode],
  );

  const navigateToPlace = useCallback(
    (poiId: string, openAdminAudio = false) => {
      reset();
      onSuccess();
      onClose();
      router.push(
        openAdminAudio
          ? `/place/${poiId}?adminGenerateAudio=1`
          : `/place/${poiId}`,
      );
    },
    [onClose, onSuccess, reset, router],
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
    if (!visible) {
      setQuery('');
      setPhase({ kind: 'browse', tab: initialMode });
    }
  }, [visible, initialMode]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase.kind === 'confirm' && !phase.isCreating) {
        setPhase({ kind: 'browse', tab: placementPin ? 'nearby' : 'search' });
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
  }, [visible, phase, handleClose, navigateToPlace, placementPin]);

  function handleSelect(item: WikipediaSearchItem) {
    setPhase({
      kind: 'confirm',
      item,
      anchor: placementPin,
      createErrorKey: null,
      isCreating: false,
    });
  }

  function handleBackToBrowse() {
    if (isCreating) return;
    setPhase({
      kind: 'browse',
      tab: placementPin ? 'nearby' : 'search',
    });
  }

  async function handleCreate() {
    if (phase.kind !== 'confirm' || phase.isCreating) return;
    const { item, anchor } = phase;
    setPhase({
      kind: 'confirm',
      item,
      anchor,
      createErrorKey: null,
      isCreating: true,
    });

    try {
      const poi = await createPoiFromWikipedia({
        wikipediaUrl: item.wikipediaUrl,
        status: 'DRAFT',
        lat: anchor?.lat,
        lng: anchor?.lng,
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
        anchor,
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
        : browseTab === 'nearby'
          ? t('adminAddPlace:nearbySheetTitle')
          : t('adminAddPlace:sheetTitle');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={() => {
        if (phase.kind === 'browse' && browseTab === 'search') {
          inputRef.current?.focus();
        }
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
                ? handleBackToBrowse
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

        {phase.kind === 'browse' ? (
          <>
            <AddPlaceModeTabs
              mode={browseTab}
              onChange={(tab) => setPhase({ kind: 'browse', tab })}
            />
            {browseTab === 'search' ? (
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
              <View style={styles.body}>
                <AddWikipediaNearbyStep
                  hasPlacementPin={placementPin != null}
                  anchor={nearby.anchor}
                  items={nearby.items}
                  existingNearbyPois={nearby.existingNearbyPois}
                  radiusMeters={nearby.radiusMeters}
                  isSearching={nearby.isSearching}
                  errorKey={nearby.errorKey}
                  onRetry={nearby.retry}
                  onSelect={handleSelect}
                  onIncreaseRadius={nearby.increaseRadius}
                  onDecreaseRadius={nearby.decreaseRadius}
                  onSwitchToSearch={() =>
                    setPhase({ kind: 'browse', tab: 'search' })
                  }
                />
              </View>
            )}
          </>
        ) : null}

        {phase.kind === 'confirm' ? (
          <AddWikipediaConfirmStep
            item={phase.item}
            hasMapAnchor={phase.anchor != null}
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
