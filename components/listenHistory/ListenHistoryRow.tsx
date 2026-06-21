import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { LISTEN_HISTORY_COPY } from '../../constants/listenHistoryCopy';
import type { ListenHistoryItem } from '../../constants/mockListenHistory';
import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

const THUMB_SIZE = 56;

interface ListenHistoryRowProps {
  item: ListenHistoryItem;
  onPress: () => void;
}

export function ListenHistoryRow({ item, onPress }: ListenHistoryRowProps) {
  const completed = item.progressPercent >= 100;
  const statusLabel = completed
    ? LISTEN_HISTORY_COPY.completed
    : LISTEN_HISTORY_COPY.progress(item.progressPercent);

  const meta = [item.durationLabel, item.listenedAtLabel, statusLabel]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.shell}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.guideTitle}, ${item.placeName}, ${meta}`}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.content}>
          <Text style={styles.guideTitle} numberOfLines={1}>
            {item.guideTitle}
          </Text>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.placeName}
          </Text>
          <Text style={styles.meta}>{meta}</Text>
          {!completed ? (
            <View
              style={styles.progressTrack}
              accessibilityLabel={LISTEN_HISTORY_COPY.progress(item.progressPercent)}
            >
              <View
                style={[styles.progressFill, { width: `${item.progressPercent}%` }]}
              />
            </View>
          ) : null}
        </View>
        <Ionicons
          name={completed ? 'headset-outline' : 'play-circle-outline'}
          size={20}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: componentSizes.iconControlSize + spacing.md * 2,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.sm,
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  guideTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  placeName: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  meta: {
    ...textStyle('captionSm'),
    color: colors.mutedSoft,
  },
  progressTrack: {
    marginTop: spacing.xxs,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
