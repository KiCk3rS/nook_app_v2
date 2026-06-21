import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors, componentSizes, radius, spacing, textStyle } from '../../constants/theme';

interface AuthFormFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  secureToggle?: boolean;
}

export function AuthFormField({
  label,
  error,
  secureToggle = false,
  secureTextEntry,
  ...inputProps
}: AuthFormFieldProps) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor={colors.mutedSoft}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          accessibilityLabel={label}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: componentSizes.buttonPrimaryHeight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...textStyle('bodyMd'),
    color: colors.ink,
    paddingVertical: spacing.sm,
  },
  toggle: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...textStyle('bodySm'),
    color: colors.error,
  },
});
