import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, componentSizes, spacing, textStyle } from '../../constants/theme';

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthScreenLayout({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('common');

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel={t('close')}
        >
          <Ionicons name="close" size={24} color={colors.ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.sm,
  },
  closeBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  subtitle: {
    ...textStyle('bodyMd'),
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
});
