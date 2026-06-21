import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, textStyle } from '../constants/theme';

/** Placeholder A8.2 — Conditions d'utilisation. */
export default function CguScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Conditions d'utilisation</Text>
        <Text style={styles.body}>
          Cette page sera complétée avec les conditions générales d'utilisation de
          NOOK (écran A8.2).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    padding: spacing.base,
    gap: spacing.md,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  body: {
    ...textStyle('bodyMd'),
    color: colors.muted,
  },
});
