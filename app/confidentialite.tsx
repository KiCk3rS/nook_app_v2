import { StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';



import { colors, spacing, textStyle } from '../constants/theme';



/** Placeholder A8.1 — Informations légales / confidentialité. */

export default function ConfidentialiteScreen() {

  return (

    <SafeAreaView style={styles.container} edges={['bottom']}>

      <View style={styles.content}>

        <Text style={styles.title}>Politique de confidentialité</Text>

        <Text style={styles.body}>

          Cette page sera complétée avec les informations légales sur l’usage des

          données personnelles dans NOOK (écran A8.1).

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

