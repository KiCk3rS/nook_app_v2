import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, componentSizes, elevation, radius, spacing, textStyle, zIndex } from '../../constants/theme';

interface UndoSnackbarProps {
  visible: boolean;
  message: string;
  undoLabel: string;
  onUndo: () => void;
  bottomInset: number;
}

export function UndoSnackbar({
  visible,
  message,
  undoLabel,
  onUndo,
  bottomInset,
}: UndoSnackbarProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      style={[styles.container, { bottom: bottomInset }]}
      accessibilityLiveRegion="polite"
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <Pressable
          onPress={onUndo}
          style={({ pressed }) => [styles.undoBtn, pressed && styles.undoPressed]}
          accessibilityRole="button"
          accessibilityLabel={undoLabel}
          hitSlop={8}
        >
          <Text style={styles.undoText}>{undoLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    zIndex: zIndex.toast,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    ...elevation.sheet,
  },
  message: {
    ...textStyle('bodySm'),
    color: colors.onDark,
    flex: 1,
  },
  undoBtn: {
    minHeight: componentSizes.iconControlSize,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  undoPressed: {
    opacity: 0.85,
  },
  undoText: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    fontWeight: '600',
  },
});
