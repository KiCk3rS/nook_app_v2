import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mapSearchBarStyles } from '../home/mapSearchBarStyles';
import { SEARCH_DISCOVERY_COPY } from '../../constants/searchDiscovery';
import type { LocationPermissionStatus } from '../../hooks/useLocationPermission';
import {
  trackHubCityViewed,
  trackPromotedHidden,
  trackSearchQuery,
  trackSearchResultTap,
  trackSearchSheetDismissed,
  trackSearchSheetOpened,
} from '../../lib/analytics';
import { getPlaceHrefById } from '../../lib/placeNavigation';
import { searchAll } from '../../lib/searchPlaces';
import {
  colors,
  componentSizes,
  spacing,
  zIndex,
} from '../../constants/theme';

import { SearchDiscoveryView } from './SearchDiscoveryView';
import { SearchResultsList } from './SearchResultsList';

interface SearchSheetProps {
  visible: boolean;
  locationStatus: LocationPermissionStatus;
  userCoords?: { latitude: number; longitude: number } | null;
  onClose: () => void;
}

const SEARCH_DEBOUNCE_MS = 200;

export function SearchSheet({
  visible,
  locationStatus: _locationStatus,
  userCoords: _userCoords,
  onClose,
}: SearchSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showPromoted, setShowPromoted] = useState(true);
  const hasTrackedOpen = useRef(false);

  const handleClose = useCallback(() => {
    trackSearchSheetDismissed();
    setQuery('');
    setDebouncedQuery('');
    setShowPromoted(true);
    onClose();
  }, [onClose]);

  function handleSheetShow() {
    inputRef.current?.focus();
  }

  useEffect(() => {
    if (visible && !hasTrackedOpen.current) {
      trackSearchSheetOpened();
      hasTrackedOpen.current = true;
    }
    if (!visible) {
      hasTrackedOpen.current = false;
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, handleClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length >= 1) {
      trackSearchQuery(debouncedQuery.length);
    }
  }, [debouncedQuery]);

  const results = useMemo(
    () => (debouncedQuery.length >= 1 ? searchAll(debouncedQuery) : []),
    [debouncedQuery],
  );

  const isResultsMode = debouncedQuery.length >= 1;

  function handleSelectPlace(placeId: string) {
    trackSearchResultTap(placeId);
    handleClose();
    router.push(getPlaceHrefById(placeId));
  }

  function handleSelectCity(citySlug: string) {
    trackHubCityViewed(citySlug, 'search');
    handleClose();
    router.push(`/city/${citySlug}`);
  }

  function handleHidePromoted() {
    trackPromotedHidden();
    setShowPromoted(false);
  }

  function handleClearQuery() {
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onShow={handleSheetShow}
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
        <View style={mapSearchBarStyles.container}>
          <View style={mapSearchBarStyles.bar}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.inBarClose,
                pressed && styles.inBarClosePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Fermer la recherche"
              hitSlop={8}
            >
              <Ionicons name="chevron-down" size={22} color={colors.ink} />
            </Pressable>
            <TextInput
              ref={inputRef}
              style={mapSearchBarStyles.input}
              value={query}
              onChangeText={setQuery}
              placeholder={SEARCH_DISCOVERY_COPY.searchPlaceholder}
              placeholderTextColor={colors.mutedSoft}
              accessibilityLabel={SEARCH_DISCOVERY_COPY.searchPlaceholder}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="never"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={handleClearQuery}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.clearButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Effacer la recherche"
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={22} color={colors.mutedSoft} />
              </Pressable>
            ) : (
              <View style={mapSearchBarStyles.searchOrb} accessibilityElementsHidden>
                <Ionicons name="search" size={22} color={colors.onPrimary} />
              </View>
            )}
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.body}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}
        >
          {isResultsMode ? (
            <SearchResultsList
              query={debouncedQuery}
              results={results}
              onSelectPlace={handleSelectPlace}
              onSelectCity={handleSelectCity}
            />
          ) : (
            <SearchDiscoveryView
              showPromoted={showPromoted}
              onHidePromoted={handleHidePromoted}
              onSelectCity={handleSelectCity}
            />
          )}
        </KeyboardAvoidingView>
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
  inBarClose: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
    marginRight: -spacing.xs,
  },
  inBarClosePressed: {
    opacity: 0.7,
  },
  clearButton: {
    width: componentSizes.searchOrbSize,
    height: componentSizes.searchOrbSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
  body: {
    flex: 1,
  },
});
