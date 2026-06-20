import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

export function SearchHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Rechercher un lieu…"
          placeholderTextColor={colors.mutedSoft}
          accessibilityLabel="Rechercher un lieu"
          editable={false}
        />
        <Pressable
          style={({ pressed }) => [styles.searchOrb, pressed && styles.searchOrbPressed]}
          accessibilityRole="button"
          accessibilityLabel="Lancer la recherche"
        >
          <Ionicons name="search" size={22} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: componentSizes.searchBarHeight,
    backgroundColor: colors.canvas,
    borderRadius: radius.full,
    paddingLeft: spacing.base,
    paddingRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    ...elevation.control,
  },
  input: {
    flex: 1,
    ...textStyle('bodyMd'),
    color: colors.ink,
    padding: 0,
  },
  searchOrb: {
    width: componentSizes.searchOrbSize,
    height: componentSizes.searchOrbSize,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchOrbPressed: {
    backgroundColor: colors.primaryActive,
  },
});
