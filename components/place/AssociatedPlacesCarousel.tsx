import { useRouter } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getCategoryLabel,
  type MockPlace,
} from '../../constants/mockPlaces';
import {
  colors,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

const CARD_WIDTH = 240;
const IMAGE_HEIGHT = 120;

interface AssociatedPlaceCardProps {
  place: MockPlace;
  onPress: () => void;
}

function AssociatedPlaceCard({ place, onPress }: AssociatedPlaceCardProps) {
  const categoryLabel = getCategoryLabel(place.categoryId);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Voir la fiche — ${place.name}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {categoryLabel}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {place.name}
        </Text>
      </View>
    </Pressable>
  );
}

interface AssociatedPlacesCarouselProps {
  places: MockPlace[];
}

export function AssociatedPlacesCarousel({ places }: AssociatedPlacesCarouselProps) {
  const router = useRouter();

  if (places.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Points d'intérêts associés
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing.sm}
        snapToAlignment="start"
      >
        {places.map((place) => (
          <AssociatedPlaceCard
            key={place.id}
            place={place}
            onPress={() => router.push(`/place/${place.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  carousel: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...elevation.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  imageWrap: {
    height: IMAGE_HEIGHT,
    backgroundColor: colors.surfaceStrong,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    maxWidth: CARD_WIDTH - spacing.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.canvas,
    borderRadius: radius.full,
    ...elevation.control,
  },
  badgeText: {
    ...textStyle('buttonSm'),
    color: colors.ink,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
});
