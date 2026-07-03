import { StyleSheet, Text, View } from 'react-native';

import { colors, componentSizes, elevation, radius, spacing, textStyle, zIndex } from '../../constants/theme';

interface ToastSnackbarProps {
  visible: boolean;
  message: string;
  title?: string;
  bottomInset: number;
}

export function ToastSnackbar({ visible, message, title, bottomInset }: ToastSnackbarProps) {
  if (!visible) return null;

  return (
    <View
      style={[styles.container, { bottom: bottomInset }]}
      accessibilityLiveRegion="polite"
      pointerEvents="none"
    >
      <View style={styles.bar}>
        {title ? (
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        ) : null}
        <Text style={styles.message} numberOfLines={4}>
          {message}
        </Text>
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
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xxs,
    minHeight: componentSizes.buttonPrimaryHeight,
    justifyContent: 'center',
    ...elevation.sheet,
  },
  title: {
    ...textStyle('titleSm'),
    color: colors.onDark,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    ...textStyle('bodySm'),
    color: colors.onDark,
    textAlign: 'center',
    opacity: 0.92,
  },
});
