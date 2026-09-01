import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  colors,
  componentSizes,
  elevation,
  radius,
} from '../../constants/theme';

const CONTROL_SIZE = componentSizes.iconControlSize;

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
      <Ionicons name="add" size={22} color={colors.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
    ...elevation.control,
  },
  controlPressed: {
    backgroundColor: colors.surfaceStrong,
  },
});
