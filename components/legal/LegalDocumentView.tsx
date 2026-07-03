import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  PRIVACY_SECTION_KEYS,
  TERMS_SECTION_KEYS,
  type PrivacySectionKey,
  type TermsSectionKey,
} from '../../constants/legalDocuments';
import { colors, spacing, textStyle } from '../../constants/theme';

type LegalDocumentKind = 'privacy' | 'terms';

interface LegalDocumentViewProps {
  kind: LegalDocumentKind;
}

function renderSections(
  kind: LegalDocumentKind,
  sectionKeys: readonly PrivacySectionKey[] | readonly TermsSectionKey[],
  t: (key: string) => string,
) {
  return sectionKeys.map((sectionKey) => (
    <View key={sectionKey} style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t(`legal:${kind}.${sectionKey}.title`)}
      </Text>
      <Text style={styles.sectionBody}>
        {t(`legal:${kind}.${sectionKey}.body`)}
      </Text>
    </View>
  ));
}

export function LegalDocumentView({ kind }: LegalDocumentViewProps) {
  const { t } = useTranslation('legal');
  const insets = useSafeAreaInsets();

  const lastUpdatedKey = kind === 'privacy' ? 'privacyLastUpdated' : 'termsLastUpdated';
  const sectionKeys = kind === 'privacy' ? PRIVACY_SECTION_KEYS : TERMS_SECTION_KEYS;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lastUpdated}>{t(lastUpdatedKey)}</Text>
      {renderSections(kind, sectionKeys, t)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  lastUpdated: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  sectionBody: {
    ...textStyle('bodyMd'),
    color: colors.body,
    lineHeight: 24,
  },
});
