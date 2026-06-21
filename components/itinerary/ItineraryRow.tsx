import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';

export type ItineraryRowBadgeVariant = 'premium' | 'muted';

export interface ItineraryRowBadge {
  label: string;
  variant: ItineraryRowBadgeVariant;
}

export type ItineraryRowTrailing = 'chevron' | 'lock' | 'none';

export interface ItineraryRowProps {
  title: string;
  coverImageUrl?: string | null;
  meta: string;
  badge?: ItineraryRowBadge;
  trailing?: ItineraryRowTrailing;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export interface ItineraryRowWithActionProps extends ItineraryRowProps {
  actionIcon: ComponentProps<typeof Ionicons>['name'];
  actionLabel: string;
  onAction: () => void;
  actionColor?: string;
}

export const ITINERARY_ROW_THUMB_SIZE = 72;

function ItineraryRowBody({
  title,
  coverImageUrl,
  meta,
  badge,
  trailing = 'chevron',
  onPress,
  accessibilityLabel,
  disabled = false,
}: ItineraryRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${title}, ${meta}`}
      accessibilityState={{ disabled }}
    >
      {coverImageUrl ? (
        <Image
          source={{ uri: coverImageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Ionicons name="trail-sign-outline" size={28} color={colors.primary} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {badge ? (
            <View
              style={[
                styles.badge,
                badge.variant === 'premium' ? styles.badgePremium : styles.badgeMuted,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  badge.variant === 'premium' ? styles.badgeTextPremium : styles.badgeTextMuted,
                ]}
              >
                {badge.label}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      {trailing === 'lock' ? (
        <Ionicons name="lock-closed" size={18} color={colors.mutedSoft} />
      ) : trailing === 'chevron' ? (
        <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
      ) : null}
    </Pressable>
  );
}

export function ItineraryRow(props: ItineraryRowProps) {
  return (
    <View style={styles.rowShell}>
      <ItineraryRowBody {...props} />
    </View>
  );
}

export function ItineraryRowWithAction({
  actionIcon,
  actionLabel,
  onAction,
  actionColor = colors.muted,
  ...rowProps
}: ItineraryRowWithActionProps) {
  return (
    <View style={styles.rowShell}>
      <View style={styles.rowWithAction}>
        <View style={styles.rowWithActionMain}>
          <ItineraryRowBody {...rowProps} trailing="none" />
        </View>
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
        >
          <Ionicons name={actionIcon} size={20} color={actionColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowShell: {
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
  rowDisabled: {
    opacity: 0.6,
  },
  thumbnail: {
    width: ITINERARY_ROW_THUMB_SIZE,
    height: ITINERARY_ROW_THUMB_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  thumbnailPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  content: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgePremium: {
    backgroundColor: colors.primary,
  },
  badgeMuted: {
    backgroundColor: colors.surfaceStrong,
  },
  badgeText: {
    ...textStyle('captionSm'),
    fontWeight: '600',
  },
  badgeTextPremium: {
    color: colors.onPrimary,
  },
  badgeTextMuted: {
    color: colors.muted,
    fontWeight: '400',
  },
  meta: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  rowWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowWithActionMain: {
    flex: 1,
  },
  actionBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  actionBtnPressed: {
    backgroundColor: colors.surfaceSoft,
  },
});
