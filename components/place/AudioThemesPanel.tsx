import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AudioGuide } from '../../constants/mockPlaces';
import { colors, radius, spacing, textStyle } from '../../constants/theme';
import { ThemeGuideRow } from './AudioGuideRow';

interface AudioThemesPanelProps {
  guides: AudioGuide[];
  currentGuideId: string;
  onSelectGuide: (guideId: string) => void;
}

export function AudioThemesPanel({
  guides,
  currentGuideId,
  onSelectGuide,
}: AudioThemesPanelProps) {
  const { t } = useTranslation('audioPlayer');
  const otherGuides = guides.filter((guide) => guide.id !== currentGuideId);

  if (otherGuides.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="layers-outline" size={32} color={colors.mutedSoft} />
        <Text style={styles.emptyTitle}>{t('themesEmptyTitle')}</Text>
        <Text style={styles.emptyBody}>{t('themesEmptyBody')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>{t('themesSectionTitle')}</Text>
      <View style={styles.list}>
        {otherGuides.map((guide, index) => (
          <ThemeGuideRow
            key={guide.id}
            guide={guide}
            isActive={false}
            isPlaying={false}
            isLast={index === otherGuides.length - 1}
            onPlayGuide={onSelectGuide}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  header: {
    ...textStyle('microLabel'),
    color: colors.muted,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xs,
  },
  list: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  emptyWrap: {
    flex: 1,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    textAlign: 'center',
  },
  emptyBody: {
    ...textStyle('bodySm'),
    color: colors.muted,
    textAlign: 'center',
  },
});
