import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  elevation,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface AddPlaceControlProps {
  onPress: () => void;
}

export function AddPlaceControl({ onPress }: AddPlaceControlProps) {
  const { t } = useTranslation('adminAddPlace');

  return (
    <Pressable
      style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('mapButton')}
      hitSlop={4}
    >
      <Ionicons name="add" size={20} color={colors.ink} />
      <Text style={styles.label} numberOfLines={1}>
        {t('mapButton')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    ...elevation.control,
  },
  controlPressed: {
    backgroundColor: colors.surfaceStrong,
  },
  label: {
    ...textStyle('buttonSm'),
    color: colors.ink,
  },
});
