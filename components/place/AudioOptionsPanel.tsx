import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import type { SleepTimerValue } from '../../constants/audioPlayerOptions';

interface AudioOptionsPanelProps {
  playbackRate: number;
  voiceBoostEnabled: boolean;
  trimSilencesEnabled: boolean;
  sleepTimer: SleepTimerValue;
  onCyclePlaybackRate: () => void;
  onVoiceBoostChange: (enabled: boolean) => void;
  onTrimSilencesChange: (enabled: boolean) => void;
  onSleepTimerChange: (value: SleepTimerValue) => void;
}

function formatPlaybackRate(rate: number): string {
  const formatted = Number.isInteger(rate) ? String(rate) : rate.toFixed(2).replace(/\.?0+$/, '');
  return formatted.replace('.', ',');
}

interface OptionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  control: React.ReactNode;
}

function OptionRow({ icon, label, hint, control }: OptionRowProps) {
  return (
    <View style={styles.optionRow}>
      <View style={styles.optionIconWrap}>
        <Ionicons name={icon} size={20} color={colors.ink} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionHint}>{hint}</Text>
      </View>
      {control}
    </View>
  );
}

function ValueBadge({ label, onPress, accessibilityLabel }: {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.valueBadge, pressed && styles.valueBadgePressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.valueBadgeText}>{label}</Text>
    </Pressable>
  );
}

const SLEEP_TIMER_MINUTES = [5, 10, 15, 30, 45, 60] as const;

export function AudioOptionsPanel({
  playbackRate,
  voiceBoostEnabled,
  trimSilencesEnabled,
  sleepTimer,
  onCyclePlaybackRate,
  onVoiceBoostChange,
  onTrimSilencesChange,
  onSleepTimerChange,
}: AudioOptionsPanelProps) {
  const { t } = useTranslation('audioPlayer');
  const insets = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);

  const sleepTimerLabel =
    sleepTimer.mode === 'off'
      ? t('sleepTimerOff')
      : sleepTimer.mode === 'endOfGuide'
        ? t('sleepTimerEndOfGuide')
        : t('sleepTimerMinutes', { count: sleepTimer.minutes ?? 0 });

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {t('optionsTitle')}
      </Text>

      <View style={styles.optionsList}>
        <OptionRow
          icon="speedometer-outline"
          label={t('playbackSpeed')}
          hint={t('playbackSpeedHint')}
          control={
            <ValueBadge
              label={t('playbackSpeedValue', { rate: formatPlaybackRate(playbackRate) })}
              onPress={onCyclePlaybackRate}
              accessibilityLabel={t('cyclePlaybackSpeed')}
            />
          }
        />

        <OptionRow
          icon="flash-outline"
          label={t('voiceBoost')}
          hint={t('voiceBoostHint')}
          control={
            <Switch
              value={voiceBoostEnabled}
              onValueChange={onVoiceBoostChange}
              trackColor={{ false: colors.hairline, true: colors.primaryDisabled }}
              thumbColor={voiceBoostEnabled ? colors.primary : colors.canvas}
              accessibilityLabel={t('voiceBoost')}
            />
          }
        />

        <OptionRow
          icon="cut-outline"
          label={t('trimSilences')}
          hint={t('trimSilencesHint')}
          control={
            <Switch
              value={trimSilencesEnabled}
              onValueChange={onTrimSilencesChange}
              trackColor={{ false: colors.hairline, true: colors.primaryDisabled }}
              thumbColor={trimSilencesEnabled ? colors.primary : colors.canvas}
              accessibilityLabel={t('trimSilences')}
            />
          }
        />

        <OptionRow
          icon="moon-outline"
          label={t('sleepTimer')}
          hint={t('sleepTimerHint')}
          control={
            <ValueBadge
              label={sleepTimerLabel}
              onPress={() => setPickerVisible(true)}
              accessibilityLabel={t('openSleepTimer')}
            />
          }
        />
      </View>

      <Modal visible={pickerVisible} transparent animationType="fade" statusBarTranslucent>
        <Pressable style={styles.pickerBackdrop} onPress={() => setPickerVisible(false)}>
          <Pressable
            style={[styles.pickerSheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.pickerTitle}>{t('sleepTimerPickerTitle')}</Text>

            <Pressable
              style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerRowPressed]}
              onPress={() => {
                onSleepTimerChange({ mode: 'off' });
                setPickerVisible(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('sleepTimerOff')}
            >
              <Text style={styles.pickerRowText}>{t('sleepTimerOff')}</Text>
              {sleepTimer.mode === 'off' ? (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              ) : null}
            </Pressable>

            {SLEEP_TIMER_MINUTES.map((minutes) => {
              const selected =
                sleepTimer.mode === 'minutes' && sleepTimer.minutes === minutes;

              return (
                <Pressable
                  key={minutes}
                  style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerRowPressed]}
                  onPress={() => {
                    onSleepTimerChange({ mode: 'minutes', minutes });
                    setPickerVisible(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t('sleepTimerMinutes', { count: minutes })}
                >
                  <Text style={styles.pickerRowText}>
                    {t('sleepTimerMinutes', { count: minutes })}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}

            <Pressable
              style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerRowPressed]}
              onPress={() => {
                onSleepTimerChange({ mode: 'endOfGuide' });
                setPickerVisible(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('sleepTimerEndOfGuide')}
            >
              <Text style={styles.pickerRowText}>{t('sleepTimerEndOfGuide')}</Text>
              {sleepTimer.mode === 'endOfGuide' ? (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              ) : null}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
  },
  optionIconWrap: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.sm,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: spacing.xxs,
  },
  optionLabel: {
    ...textStyle('bodyMd'),
    color: colors.ink,
  },
  optionHint: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  valueBadge: {
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBadgePressed: {
    backgroundColor: colors.surfaceStrong,
  },
  valueBadgeText: {
    ...textStyle('bodySm'),
    color: colors.ink,
    fontWeight: Platform.select({ ios: '600', default: '700' }),
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.base,
    gap: spacing.xxs,
  },
  pickerTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  pickerRow: {
    minHeight: componentSizes.buttonPrimaryHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  pickerRowPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  pickerRowText: {
    ...textStyle('bodyMd'),
    color: colors.ink,
  },
});
