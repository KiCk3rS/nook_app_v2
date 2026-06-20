import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PERMISSION_CARDS,
  PERMISSION_SHEET_COPY,
  type PermissionType,
} from '../../constants/permissions';
import type { LocationPermissionStatus } from '../../hooks/useLocationPermission';
import {
  trackPermissionSheetDismissed,
  trackPermissionSheetOpened,
  type PermissionSheetSource,
} from '../../lib/analytics';
import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  textStyle,
  zIndex,
} from '../../constants/theme';

interface PermissionSheetProps {
  visible: boolean;
  source: PermissionSheetSource;
  locationStatus: LocationPermissionStatus;
  isRequesting: boolean;
  onClose: () => void;
  onRequestPermission: (type: PermissionType) => Promise<void>;
}

function openAppSettings() {
  void Linking.openSettings();
}

export function PermissionSheet({
  visible,
  source,
  locationStatus,
  isRequesting,
  onClose,
  onRequestPermission,
}: PermissionSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const hasTrackedOpen = useRef(false);

  const handleClose = useCallback(() => {
    trackPermissionSheetDismissed();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible && !hasTrackedOpen.current) {
      trackPermissionSheetOpened(source);
      hasTrackedOpen.current = true;
    }
    if (!visible) {
      hasTrackedOpen.current = false;
    }
  }, [visible, source]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, handleClose]);

  useEffect(() => {
    if (visible && locationStatus === 'granted') {
      handleClose();
    }
  }, [visible, locationStatus, handleClose]);

  const pendingCards = PERMISSION_CARDS.filter((card) => {
    if (card.type === 'location_when_in_use') {
      return locationStatus !== 'granted';
    }
    return true;
  });

  function handlePrivacyPress() {
    router.push('/confidentialite');
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.scrim}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer la feuille d’autorisations"
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.base) },
          ]}
          accessibilityRole="none"
          accessibilityLabel={PERMISSION_SHEET_COPY.title}
        >
          <View style={styles.handleWrap}>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer la feuille"
              hitSlop={12}
            >
              <View style={styles.handle} />
            </Pressable>
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.headerGroup}>
              <Text style={styles.title}>{PERMISSION_SHEET_COPY.title}</Text>
              <Text style={styles.subtitle}>{PERMISSION_SHEET_COPY.subtitle}</Text>
            </View>

            <View style={styles.cards}>
              {pendingCards.map((card) => {
                const isBlocked = locationStatus === 'blocked';
                const isCardLoading =
                  isRequesting && card.type === 'location_when_in_use';

                return (
                  <View key={card.type} style={styles.card}>
                    <View style={styles.cardIconWrap}>
                      <Ionicons name={card.icon} size={22} color={colors.primary} />
                    </View>
                    <View style={styles.cardBody}>
                      <View style={styles.cardTextGroup}>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                        <Text style={styles.cardDescription}>{card.description}</Text>
                      </View>
                      {isBlocked ? (
                        <Pressable
                          onPress={openAppSettings}
                          accessibilityRole="link"
                          accessibilityLabel={`${PERMISSION_SHEET_COPY.blockedHint} — ouvrir les paramètres`}
                        >
                          <Text style={styles.blockedHint}>
                            {PERMISSION_SHEET_COPY.blockedHint}
                          </Text>
                        </Pressable>
                      ) : null}
                      <Pressable
                        style={({ pressed }) => [
                          styles.cta,
                          pressed && !isCardLoading && styles.ctaPressed,
                          isCardLoading && styles.ctaDisabled,
                        ]}
                        onPress={() => {
                          if (isBlocked) {
                            openAppSettings();
                            return;
                          }
                          void onRequestPermission(card.type);
                        }}
                        disabled={isCardLoading}
                        accessibilityRole="button"
                        accessibilityLabel={`${card.cta} — ${card.title}`}
                        accessibilityState={{ disabled: isCardLoading, busy: isCardLoading }}
                      >
                        {isCardLoading ? (
                          <ActivityIndicator size="small" color={colors.onPrimary} />
                        ) : (
                          <Text style={styles.ctaText}>
                            {isBlocked ? 'Ouvrir les paramètres' : card.cta}
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={styles.footer}>
              Vous pouvez modifier ces autorisations à tout moment dans les{' '}
              <Text
                style={styles.footerLink}
                onPress={openAppSettings}
                accessibilityRole="link"
                accessibilityLabel="Ouvrir les paramètres de l’appareil"
              >
                {PERMISSION_SHEET_COPY.footerSettingsLink}
              </Text>
              . Nous prenons votre vie privée au sérieux — consultez notre{' '}
              <Text
                style={styles.footerLink}
                onPress={handlePrivacyPress}
                accessibilityRole="link"
                accessibilityLabel={PERMISSION_SHEET_COPY.privacyLink}
              >
                {PERMISSION_SHEET_COPY.privacyLink}
              </Text>
              .
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: zIndex.sheet,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
    ...elevation.sheet,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.base,
  },
  headerGroup: {
    gap: spacing.xs,
  },
  title: {
    ...textStyle('displaySm'),
    color: colors.ink,
  },
  subtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  cards: {
    gap: spacing.base,
    marginTop: spacing.md,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.base,
    padding: spacing.lg,
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: spacing.md,
  },
  cardTextGroup: {
    gap: spacing.xs,
  },
  cardTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  cardDescription: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  blockedHint: {
    ...textStyle('buttonSm'),
    color: colors.warning,
    textDecorationLine: 'underline',
  },
  cta: {
    marginTop: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  ctaPressed: {
    backgroundColor: colors.primaryActive,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  footer: {
    ...textStyle('captionSm'),
    marginTop: spacing.base,
    color: colors.mutedSoft,
  },
  footerLink: {
    ...textStyle('link'),
    color: colors.legalLink,
    textDecorationLine: 'underline',
  },
});
