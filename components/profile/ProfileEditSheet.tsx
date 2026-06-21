import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthFormField } from '../auth/AuthFormField';
import { PROFILE_COPY } from '../../constants/profileCopy';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { maskEmail } from '../../lib/userDisplay';
import { ApiError } from '../../types/api';
import type { User } from '../../types/api';

interface ProfileEditSheetProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

export function ProfileEditSheet({
  visible,
  user,
  onClose,
  onSaved,
}: ProfileEditSheetProps) {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDisplayName(user.displayName ?? '');
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setError(null);
  }, [visible, user]);

  const hasChanges =
    displayName.trim() !== (user.displayName ?? '').trim() ||
    firstName.trim() !== (user.firstName ?? '').trim() ||
    lastName.trim() !== (user.lastName ?? '').trim();

  async function handleSave() {
    if (!hasChanges) {
      onClose();
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile({
        displayName: displayName.trim() || null,
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        const first = Object.values(err.details)[0]?.[0];
        setError(first ?? PROFILE_COPY.errorGeneric);
      } else {
        setError(PROFILE_COPY.errorGeneric);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} accessibilityRole="button">
            <Text style={styles.headerAction}>{PROFILE_COPY.cancel}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{PROFILE_COPY.editSheetTitle}</Text>
          <Pressable
            onPress={() => void handleSave()}
            disabled={isSaving || !hasChanges}
            accessibilityRole="button"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text
                style={[
                  styles.headerAction,
                  styles.saveAction,
                  !hasChanges && styles.saveDisabled,
                ]}
              >
                {PROFILE_COPY.save}
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AuthFormField
            label={PROFILE_COPY.displayNameLabel}
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
          />
          <AuthFormField
            label={PROFILE_COPY.firstNameLabel}
            value={firstName}
            onChangeText={setFirstName}
            autoComplete="given-name"
          />
          <AuthFormField
            label={PROFILE_COPY.lastNameLabel}
            value={lastName}
            onChangeText={setLastName}
            autoComplete="family-name"
          />
          <View style={styles.readonlyBlock}>
            <Text style={styles.readonlyLabel}>{PROFILE_COPY.emailReadonly}</Text>
            <Text style={styles.readonlyValue}>{maskEmail(user.email)}</Text>
            <Text style={styles.readonlyHint}>{PROFILE_COPY.emailReadonlyHint}</Text>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  headerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  headerAction: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    minWidth: 72,
  },
  saveAction: {
    color: colors.primary,
    textAlign: 'right',
  },
  saveDisabled: {
    color: colors.mutedSoft,
  },
  content: {
    padding: spacing.base,
    gap: spacing.lg,
  },
  readonlyBlock: {
    gap: spacing.xxs,
  },
  readonlyLabel: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  readonlyValue: {
    ...textStyle('bodyMd'),
    color: colors.muted,
  },
  readonlyHint: {
    ...textStyle('bodySm'),
    color: colors.mutedSoft,
  },
  error: {
    ...textStyle('bodySm'),
    color: colors.error,
  },
});
