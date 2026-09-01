import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, textStyle } from '../../constants/theme';
import type { AddPlaceSheetMode } from './AdminAddPlaceContext';

interface AddPlaceModeTabsProps {
  mode: AddPlaceSheetMode;
  onChange: (mode: AddPlaceSheetMode) => void;
}

export function AddPlaceModeTabs({ mode, onChange }: AddPlaceModeTabsProps) {
  const { t } = useTranslation('adminAddPlace');

  return (
    <View style={styles.root}>
      {(['nearby', 'search'] as const).map((tab) => {
        const selected = mode === tab;
        return (
          <Pressable
            key={tab}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && styles.pressed,
            ]}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={t(tab === 'nearby' ? 'tabNearby' : 'tabSearch')}
          >
            <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
              {t(tab === 'nearby' ? 'tabNearby' : 'tabSearch')}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    padding: spacing.xxs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    minHeight: 44,
  },
  tabSelected: {
    backgroundColor: colors.canvas,
  },
  tabLabel: {
    ...textStyle('buttonSm'),
    color: colors.muted,
  },
  tabLabelSelected: {
    color: colors.ink,
  },
  pressed: {
    opacity: 0.8,
  },
});
