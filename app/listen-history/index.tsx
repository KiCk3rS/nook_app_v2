import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ListenHistoryEmptyState } from '../../components/listenHistory/ListenHistoryEmptyState';
import { ListenHistoryRow } from '../../components/listenHistory/ListenHistoryRow';
import { colors, componentSizes, radius, spacing, textStyle } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useListenHistory } from '../../hooks/useListenHistory';
import { useRequireAuth } from '../../hooks/useRequireAuth';

export default function ListenHistoryScreen() {
  const { t } = useTranslation(['listenHistory', 'common']);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isReady } = useRequireAuth('/listen-history');
  const { isMockSession } = useAuth();
  const { sections, loading, error, reload } = useListenHistory(isReady, isMockSession);

  if (!isReady) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">
          {t('listenHistory:title')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingBody}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{t('listenHistory:loadError')}</Text>
          <Pressable
            onPress={reload}
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('common:retry')}
          >
            <Text style={styles.retryText}>{t('common:retry')}</Text>
          </Pressable>
        </View>
      ) : sections.length === 0 ? (
        <ListenHistoryEmptyState />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <ListenHistoryRow
              item={item}
              onPress={() => router.push(`/place/${item.placeId}`)}
            />
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        />
      )}
    </View>
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
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  backBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryPressed: {
    backgroundColor: colors.primaryActive,
  },
  retryText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  list: {
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    ...textStyle('captionSm'),
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
});
