import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, elevation, radius, spacing, typography } from '../../constants/theme';

export function SearchHeader() {
  return (
    <View style={styles.row}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un lieu..."
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Rechercher un lieu"
        />
      </View>
      <Pressable
        style={styles.premiumButton}
        accessibilityRole="button"
        accessibilityLabel="Premium"
      >
        <Text style={styles.premiumText}>Premium</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
    ...elevation.control,
  },
  input: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    padding: 0,
  },
  premiumButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.control,
  },
  premiumText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textInverse,
  },
});
