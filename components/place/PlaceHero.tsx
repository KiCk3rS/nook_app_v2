import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  zIndex,
} from '../../constants/theme';

export const PLACE_HERO_HEIGHT = 320;
/** Chevauchement du panneau contenu sur le hero (coins arrondis). */
export const PLACE_CONTENT_OVERLAP = radius.xl;

interface PlaceHeroBackgroundProps {
  imageUrl: string;
}

/** Image de couverture fixe (ne scroll pas). */
export function PlaceHeroBackground({ imageUrl }: PlaceHeroBackgroundProps) {
  return (
    <View style={styles.heroBackground} pointerEvents="none">
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.scrim} accessibilityElementsHidden />
    </View>
  );
}

interface PlaceHeroControlsProps {
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
}

/** Boutons retour / favori / partage — fixes au scroll. */
export function PlaceHeroControls({
  isFavorite,
  onBack,
  onToggleFavorite,
  onShare,
}: PlaceHeroControlsProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');

  return (
    <View
      style={[styles.controlsLayer, { paddingTop: insets.top + spacing.sm }]}
      pointerEvents="box-none"
    >
      <View style={styles.controls}>
        <Pressable
          style={styles.iconButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.actions}>
          <Pressable
            style={styles.iconButton}
            onPress={onToggleFavorite}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? t('removeFavorite') : t('addFavorite')}
            hitSlop={8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.primary : colors.ink}
            />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel={t('sharePlace')}
            hitSlop={8}
          >
            <Ionicons name="share-outline" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PLACE_HERO_HEIGHT,
    backgroundColor: colors.surfaceStrong,
    zIndex: zIndex.map,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
    opacity: 0.35,
  },
  controlsLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.chrome,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.control,
  },
});
