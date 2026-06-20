import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { MockPlace } from '../../constants/mockPlaces';
import { colors, radius, spacing, textStyle } from '../../constants/theme';

interface ParentPlaceLinkProps {
  parent: MockPlace;
}

export function ParentPlaceLink({ parent }: ParentPlaceLinkProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
      onPress={() => router.push(`/place/${parent.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`Voir le lieu parent — ${parent.name}`}
    >
      <View style={styles.content}>
        <Ionicons
          name="business-outline"
          size={18}
          color={colors.primary}
          accessibilityElementsHidden
        />
        <View style={styles.textWrap}>
          <Text style={styles.label}>Lieu parent</Text>
          <Text style={styles.name} numberOfLines={1}>
            {parent.name}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.muted}
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  linkPressed: {
    backgroundColor: colors.surfaceStrong,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xxs,
  },
  label: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  name: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
});
