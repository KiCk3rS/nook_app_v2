import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioGuideList } from '../../components/place/AudioGuideList';
import { AssociatedPlacesCarousel } from '../../components/place/AssociatedPlacesCarousel';
import { ParentPlaceLink } from '../../components/place/ParentPlaceLink';
import {
  PLACE_CONTENT_OVERLAP,
  PLACE_HERO_HEIGHT,
  PlaceHeroBackground,
  PlaceHeroControls,
} from '../../components/place/PlaceHero';
import { useAudioPlayback } from '../../contexts/AudioPlaybackContext';
import { getPlaceById, getPlaceChildren, getPlaceParent } from '../../constants/mockPlaces';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

export default function PlaceDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = useMemo(
    () => (typeof id === 'string' ? getPlaceById(id) : undefined),
    [id],
  );
  const parentPlace = useMemo(
    () => (place ? getPlaceParent(place) : undefined),
    [place],
  );
  const associatedPlaces = useMemo(
    () => (place ? getPlaceChildren(place.id) : []),
    [place],
  );

  const [isFavorite, setIsFavorite] = useState(false);
  const {
    activeGuideId,
    isPlaying,
    viewMode,
    startPlayback,
    minimize,
  } = useAudioPlayback();

  const scrollTopInset = PLACE_HERO_HEIGHT - PLACE_CONTENT_OVERLAP;
  const bodyMinHeight = windowHeight - scrollTopInset + PLACE_CONTENT_OVERLAP;

  function handleBack() {
    if (viewMode === 'expanded') {
      minimize();
      return;
    }
    router.back();
  }

  async function handleShare() {
    if (!place) return;
    await Share.share({
      message: `Découvrez ${place.name} sur NOOK — ${place.address}`,
    });
  }

  function handlePlayGuide(guideId: string) {
    if (!place) return;

    const guide = place.audioGuides.find(
      (g) => g.id === guideId && g.status === 'ready',
    );
    if (!guide) return;

    startPlayback(place, guide);
  }

  function handleAddGuide() {
    // B6 / production : flux de création de guide — à brancher.
  }

  if (!place) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.notFoundTitle}>Lieu introuvable</Text>
        <Text style={styles.notFoundBody}>
          Ce lieu n'existe pas ou n'est plus disponible.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.notFoundButton,
            pressed && styles.primaryPressed,
          ]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Text style={styles.primaryText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <PlaceHeroBackground imageUrl={place.imageUrl} />

      <PlaceHeroControls
        isFavorite={isFavorite}
        onBack={handleBack}
        onToggleFavorite={() => setIsFavorite((v) => !v)}
        onShare={() => void handleShare()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: scrollTopInset, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.body, { minHeight: bodyMinHeight }]}>
          <Text style={styles.title} accessibilityRole="header">
            {place.name}
          </Text>
          <View style={styles.addressRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.muted}
              accessibilityElementsHidden
            />
            <Text style={styles.address}>{place.address}</Text>
          </View>

          {parentPlace ? <ParentPlaceLink parent={parentPlace} /> : null}

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{place.description}</Text>

          <AudioGuideList
            guides={place.audioGuides}
            activeGuideId={activeGuideId}
            isPlaying={isPlaying}
            onPlayGuide={handlePlayGuide}
            onAddGuide={handleAddGuide}
          />

          <AssociatedPlacesCarousel places={associatedPlaces} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceStrong,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    ...textStyle('displayXl'),
    color: colors.ink,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  address: {
    flex: 1,
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    marginTop: spacing.lg,
  },
  description: {
    ...textStyle('bodyMd'),
    color: colors.body,
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundTitle: {
    ...textStyle('displayMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  notFoundBody: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  notFoundButton: {
    marginTop: spacing.md,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
});
