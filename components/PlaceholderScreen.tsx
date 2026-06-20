import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, textStyle } from '../constants/theme';

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xl,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
    textAlign: 'center',
  },
  description: {
    ...textStyle('bodyMd'),
    marginTop: spacing.md,
    color: colors.muted,
    textAlign: 'center',
  },
});
