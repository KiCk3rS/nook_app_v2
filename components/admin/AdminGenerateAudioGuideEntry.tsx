import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  colors,
  componentSizes,
  radius,
  spacing,
  textStyle,
} from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { canUseAdminEditorialTools } from '../../lib/auth/roles';
import { isApiConfigured } from '../../lib/config';
import { AdminGenerateAudioGuideSheet } from './AdminGenerateAudioGuideSheet';

interface AdminGenerateAudioGuideEntryProps {
  poiId: string;
  poiName: string;
  wikipediaUrl: string;
  appLanguage: string;
  authLoading: boolean;
  onRefresh: () => void;
}

/**
 * Point d’entrée fiche A3.1 : gate admin + CTA + feuille génération.
 * Deep-link : `?adminGenerateAudio=1` (ex. post-création Wikipedia).
 */
export function AdminGenerateAudioGuideEntry({
  poiId,
  poiName,
  wikipediaUrl,
  appLanguage,
  authLoading,
  onRefresh,
}: AdminGenerateAudioGuideEntryProps) {
  const { t } = useTranslation('adminAudioGuide');
  const router = useRouter();
  const { adminGenerateAudio } = useLocalSearchParams<{
    adminGenerateAudio?: string;
  }>();
  const { user, isAuthenticated, isMockSession } = useAuth();
  const [sheetVisible, setSheetVisible] = useState(false);

  const canShow =
    canUseAdminEditorialTools({
      user,
      isAuthenticated,
      isMockSession,
      apiConfigured: isApiConfigured(),
    }) && Boolean(wikipediaUrl.trim());

  useEffect(() => {
    if (authLoading || !canShow) return;
    if (adminGenerateAudio === '1') {
      setSheetVisible(true);
      router.setParams({ adminGenerateAudio: undefined });
    }
  }, [adminGenerateAudio, authLoading, canShow, router]);

  if (!canShow) {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => [
          styles.cta,
          pressed && styles.ctaPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('placeCtaA11y')}
      >
        <Ionicons name="mic-outline" size={18} color={colors.primary} />
        <Text style={styles.ctaText}>{t('placeCta')}</Text>
      </Pressable>

      <AdminGenerateAudioGuideSheet
        visible={sheetVisible}
        poiId={poiId}
        poiName={poiName}
        wikipediaUrl={wikipediaUrl}
        appLanguage={appLanguage}
        onClose={() => setSheetVisible(false)}
        onReadyOrLaunched={onRefresh}
      />
    </>
  );
}

const styles = StyleSheet.create({
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: spacing.base,
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    ...textStyle('buttonSm'),
    color: colors.primary,
    fontWeight: '600',
  },
});
