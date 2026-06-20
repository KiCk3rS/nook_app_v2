import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HUB_COPY } from '../../constants/hubCopy';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

interface ExternalLinkSheetProps {
  visible: boolean;
  partnerName: string;
  onContinue: () => void;
  onCancel: () => void;
}

export function ExternalLinkSheet({
  visible,
  partnerName,
  onContinue,
  onCancel,
}: ExternalLinkSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <Pressable style={styles.scrim} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>{HUB_COPY.externalTitle}</Text>
          <Text style={styles.body}>{HUB_COPY.externalBody(partnerName)}</Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={HUB_COPY.externalCancel}
            >
              <Text style={styles.secondaryText}>{HUB_COPY.externalCancel}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryPressed]}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={HUB_COPY.externalContinue}
            >
              <Text style={styles.primaryText}>{HUB_COPY.externalContinue}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...textStyle('displayMd'),
    color: colors.ink,
  },
  body: {
    ...textStyle('bodyMd'),
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    ...textStyle('buttonMd'),
    color: colors.ink,
  },
  primaryBtn: {
    flex: 1,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryPressed: {
    backgroundColor: colors.primaryActive,
  },
  primaryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
