import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, componentSizes, radius, spacing, textStyle } from '../../constants/theme';

interface ItineraryMapBannerProps {
  title: string;
  stepLabel?: string;
  onPress: () => void;
  onClose: () => void;
}

export function ItineraryMapBanner({
  title,
  stepLabel,
  onPress,
  onClose,
}: ItineraryMapBannerProps) {
  const { t } = useTranslation('hub');

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.content, pressed && styles.contentPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${t('itineraryMapModeOpenDetail')} — ${title}`}
      >
        <Ionicons name="map-outline" size={18} color={colors.primary} />
        <View style={styles.textBlock}>
          <Text style={styles.kicker}>{t('itineraryMapModeKicker')}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {stepLabel ? <Text style={styles.step}>{stepLabel}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
        accessibilityRole="button"
        accessibilityLabel={t('itineraryMapModeClose')}
        hitSlop={8}
      >
        <Ionicons name="close" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
    borderRadius: radius.sm,
    minHeight: componentSizes.iconControlSize,
  },
  contentPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    ...textStyle('caption'),
    color: colors.muted,
  },
  title: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  step: {
    ...textStyle('caption'),
    color: colors.primary,
  },
  closeBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  closePressed: {
    backgroundColor: colors.surfaceSoft,
  },
});
