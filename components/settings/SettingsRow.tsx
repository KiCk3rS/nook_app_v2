import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, componentSizes, spacing, textStyle } from '../../constants/theme';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
}

export function SettingsRow({
  label,
  value,
  onPress,
  showChevron = true,
  destructive = false,
  disabled = false,
  accessibilityHint,
}: SettingsRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && onPress && styles.rowPressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={!onPress || disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {showChevron && onPress && !destructive ? (
          <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
        ) : null}
      </View>
    </Pressable>
  );
}

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingsToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.hairline, true: colors.primaryDisabled }}
        thumbColor={value ? colors.primary : colors.canvas}
        accessibilityLabel={label}
      />
    </View>
  );
}

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  groupTitle: {
    ...textStyle('caption'),
    color: colors.muted,
    textTransform: 'uppercase',
  },
  groupCard: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairlineSoft,
  },
  row: {
    minHeight: componentSizes.buttonPrimaryHeight + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    backgroundColor: colors.canvas,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...textStyle('bodyMd'),
    color: colors.ink,
    flex: 1,
  },
  destructive: {
    color: colors.error,
    textAlign: 'center',
    flex: 0,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    backgroundColor: colors.canvas,
  },
  toggleText: {
    flex: 1,
    gap: spacing.xxs,
  },
  description: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
});
