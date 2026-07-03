import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import {
  findActiveSegmentIndex,
  type GuideTranscriptSegment,
} from '../../lib/guideTranscript';
import { colors, radius, spacing, textStyle } from '../../constants/theme';

interface AudioLyricsPanelProps {
  segments: GuideTranscriptSegment[];
  positionMs: number;
  onSeek: (ms: number) => void;
}

function SegmentRow({
  segment,
  isActive,
  isPast,
  onPress,
}: {
  segment: GuideTranscriptSegment;
  isActive: boolean;
  isPast: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation('audioPlayer');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentRow,
        isActive && styles.segmentRowActive,
        pressed && styles.segmentRowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={t('lyricsSegmentA11y', { text: segment.text })}
      accessibilityState={{ selected: isActive }}
    >
      <Text
        style={[
          styles.segmentText,
          isPast && styles.segmentTextPast,
          isActive && styles.segmentTextActive,
        ]}
      >
        {segment.text}
      </Text>
    </Pressable>
  );
}

export function AudioLyricsPanel({ segments, positionMs, onSeek }: AudioLyricsPanelProps) {
  const { t } = useTranslation('audioPlayer');
  const listRef = useRef<FlatList<GuideTranscriptSegment>>(null);
  const activeIndex = findActiveSegmentIndex(segments, positionMs);
  const lastScrolledIndexRef = useRef(-1);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex === lastScrolledIndexRef.current) return;

    lastScrolledIndexRef.current = activeIndex;
    listRef.current?.scrollToIndex({
      index: activeIndex,
      animated: true,
      viewPosition: 0.35,
    });
  }, [activeIndex]);

  if (segments.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{t('lyricsEmpty')}</Text>
      </View>
    );
  }

  function renderItem({ item, index }: ListRenderItemInfo<GuideTranscriptSegment>) {
    const isActive = index === activeIndex;
    const isPast = activeIndex >= 0 && index < activeIndex;

    return (
      <SegmentRow
        segment={item}
        isActive={isActive}
        isPast={isPast}
        onPress={() => onSeek(item.startMs)}
      />
    );
  }

  return (
    <View style={styles.root} accessibilityLabel={t('lyricsPanelA11y')}>
      <FlatList
        ref={listRef}
        data={segments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 140,
  },
  listContent: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  segmentRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  segmentRowActive: {
    backgroundColor: colors.primaryDisabled,
  },
  segmentRowPressed: {
    opacity: 0.85,
  },
  segmentText: {
    ...textStyle('bodyMd'),
    color: colors.muted,
    textAlign: 'left',
    lineHeight: Platform.select({ ios: 24, default: 26 }),
  },
  segmentTextPast: {
    color: colors.mutedSoft,
  },
  segmentTextActive: {
    color: colors.ink,
    fontWeight: Platform.select({ ios: '600', default: '700' }),
  },
  emptyWrap: {
    flex: 1,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    ...textStyle('bodySm'),
    color: colors.muted,
    textAlign: 'center',
  },
});
