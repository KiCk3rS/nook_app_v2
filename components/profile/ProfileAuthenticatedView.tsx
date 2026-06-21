import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PROFILE_COPY } from '../../constants/profileCopy';
import { MOCK_PROFILE_INSIGHTS } from '../../constants/mockProfileInsights';
import {
  colors,
  componentSizes,
  elevation,
  radius,
  spacing,
  surfaceCardBorder,
  textStyle,
  zIndex,
} from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { usePremium } from '../../contexts/PremiumContext';
import { formatDurationMinutes, getUserDisplayName, getUserInitials, maskEmail } from '../../lib/userDisplay';
import type { User } from '../../types/api';
import type { UserItinerary } from '../../types/api';

export interface ProfileRecentListen {
  placeId: string;
  name: string;
  imageUrl: string;
  durationLabel?: string;
  listenedAtLabel: string;
}

export interface ProfileDashboardStats {
  routesCount: number;
  favoritesCount: number;
  listenCount: number;
  citiesCount: number;
  memberSinceLabel?: string;
}

interface ProfileAuthenticatedViewProps {
  user: User;
  stats: ProfileDashboardStats;
  recentRoutes: UserItinerary[];
  recentListens: ProfileRecentListen[];
  isRefreshing: boolean;
  loadError: string | null;
  onRefresh: () => void;
  onEditProfile: () => void;
}

/** Padding sous la carte stats dans le hero. */
const HERO_BOTTOM_PADDING = spacing.xxl;
/** Marge visible entre les stats et le bord haut de la feuille. */
const STATS_SHEET_GAP = spacing.lg;
/** Lèvre arrondie de la feuille qui remonte légèrement sur le hero. */
const SHEET_LIP_OVERLAP = spacing.md;
/** Seuil de scroll au-delà duquel les boutons hero sont masqués (recouverts par la feuille). */
const HERO_CONTROLS_SCROLL_THRESHOLD = 72;

interface ShortcutItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function StatColumn({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statColumn}>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ShortcutTile({ icon, label, onPress }: ShortcutItem) {
  return (
    <Pressable
      style={({ pressed }) => [styles.shortcutTile, pressed && styles.shortcutTilePressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.shortcutIconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.shortcutLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

function SheetMenuRow({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.sheetMenuRow, pressed && styles.sheetMenuRowPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.sheetMenuIcon}>
        <Ionicons name={icon} size={20} color={colors.ink} />
      </View>
      <View style={styles.sheetMenuText}>
        <Text style={styles.sheetMenuLabel}>{label}</Text>
        {subtitle ? <Text style={styles.sheetMenuSubtitle}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
    </Pressable>
  );
}

export function ProfileAuthenticatedView({
  user,
  stats,
  recentRoutes,
  recentListens,
  isRefreshing,
  loadError,
  onRefresh,
  onEditProfile,
}: ProfileAuthenticatedViewProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const { hasSubscription } = usePremium();
  const { height: windowHeight } = useWindowDimensions();
  const [heroHeight, setHeroHeight] = useState(400);
  const [scrollY, setScrollY] = useState(0);
  const sheetRestTop = Math.max(
    heroHeight - HERO_BOTTOM_PADDING + STATS_SHEET_GAP,
    0,
  );
  const sheetScrollSpacer = sheetRestTop + SHEET_LIP_OVERLAP;
  const sheetMinHeight = windowHeight + heroHeight - sheetRestTop;
  const heroControlsActive = scrollY < HERO_CONTROLS_SCROLL_THRESHOLD;

  const displayName = getUserDisplayName(user);
  const memberLabel =
    stats.memberSinceLabel ?? MOCK_PROFILE_INSIGHTS.memberSinceLabel;

  const shortcuts: ShortcutItem[] = [
    {
      icon: 'map-outline',
      label: PROFILE_COPY.myRoutes,
      onPress: () => router.push('/itineraries'),
    },
    {
      icon: 'heart-outline',
      label: PROFILE_COPY.favorites,
      onPress: () => router.push('/(tabs)/favoris'),
    },
    {
      icon: 'navigate-outline',
      label: PROFILE_COPY.exploreMap,
      onPress: () => router.push('/(tabs)'),
    },
    {
      icon: 'compass-outline',
      label: PROFILE_COPY.discover,
      onPress: () => router.push('/(tabs)/decouvrir'),
    },
    {
      icon: 'settings-outline',
      label: PROFILE_COPY.settings,
      onPress: () => router.push('/settings'),
    },
    {
      icon: hasSubscription ? 'star' : 'star-outline',
      label: PROFILE_COPY.premiumCardTitle,
      onPress: () => router.push('/(tabs)/decouvrir'),
    },
  ];

  function confirmLogout() {
    Alert.alert(PROFILE_COPY.logoutTitle, PROFILE_COPY.logoutBody, [
      { text: PROFILE_COPY.cancel, style: 'cancel' },
      {
        text: PROFILE_COPY.logoutConfirm,
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.ink, '#1a2230', colors.ink]}
        style={styles.heroFixed}
        pointerEvents="none"
        onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroTopBar}>
            <Text style={styles.heroTitle} accessibilityRole="header">
              {PROFILE_COPY.title}
            </Text>
            <View style={styles.heroIconBtn}>
              <Ionicons name="settings-outline" size={22} color={colors.onDark} />
            </View>
          </View>

          <View style={styles.heroIdentity}>
            <View style={styles.avatarRing}>
              <View
                style={styles.avatar}
                accessibilityLabel={`Initiales ${getUserInitials(user)}`}
              >
                <Text style={styles.avatarText}>{getUserInitials(user)}</Text>
              </View>
            </View>
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroEmail}>{maskEmail(user.email)}</Text>
            <Text style={styles.heroMember}>{memberLabel}</Text>
            <View style={styles.editPill}>
              <Ionicons name="create-outline" size={14} color={colors.onDark} />
              <Text style={styles.editPillText}>{PROFILE_COPY.editProfile}</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <StatColumn
              value={String(stats.routesCount)}
              label={PROFILE_COPY.statRoutes}
              highlight
            />
            <View style={styles.statDivider} />
            <StatColumn
              value={String(stats.favoritesCount)}
              label={PROFILE_COPY.statFavorites}
            />
            <View style={styles.statDivider} />
            <StatColumn
              value={String(stats.listenCount)}
              label={PROFILE_COPY.statListens}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => setScrollY(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            progressViewOffset={sheetScrollSpacer}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{ height: sheetScrollSpacer }}
          pointerEvents="none"
          accessible={false}
        />
        <View style={[styles.sheet, { minHeight: sheetMinHeight }]}>
          <View style={styles.sheetHandle} />

          {loadError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable onPress={onRefresh} accessibilityRole="button">
                <Text style={styles.retry}>{PROFILE_COPY.retry}</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>{PROFILE_COPY.shortcutsTitle}</Text>
          <View style={styles.shortcutGrid}>
            {shortcuts.map((item) => (
              <ShortcutTile key={item.label} {...item} />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.createBtn, pressed && styles.createBtnPressed]}
            onPress={() => router.push('/(tabs)')}
            accessibilityRole="button"
            accessibilityLabel={PROFILE_COPY.createRouteCta}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.onPrimary} />
            <View style={styles.createBtnText}>
              <Text style={styles.createBtnTitle}>{PROFILE_COPY.createRouteCta}</Text>
              <Text style={styles.createBtnHint}>{PROFILE_COPY.createRouteHint}</Text>
            </View>
          </Pressable>

          {recentRoutes.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeading}>{PROFILE_COPY.recentRoutesTitle}</Text>
                <Pressable
                  onPress={() => router.push('/itineraries')}
                  accessibilityRole="button"
                >
                  <Text style={styles.sectionLink}>{PROFILE_COPY.recentRoutesSeeAll}</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {recentRoutes.map((route) => (
                  <Pressable
                    key={route.id}
                    style={({ pressed }) => [
                      styles.routeCard,
                      pressed && styles.routeCardPressed,
                    ]}
                    onPress={() => router.push('/itineraries')}
                    accessibilityRole="button"
                    accessibilityLabel={route.title}
                  >
                    <View style={styles.routeCardImageWrap}>
                      <Ionicons name="trail-sign-outline" size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.routeCardTitle} numberOfLines={2}>
                      {route.title}
                    </Text>
                    <Text style={styles.routeCardMeta}>
                      {PROFILE_COPY.steps(route.stepCount ?? route.poiIds?.length ?? 0)}
                      {route.estimatedDurationMinutes
                        ? ` · ${formatDurationMinutes(route.estimatedDurationMinutes)}`
                        : ''}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {recentListens.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>{PROFILE_COPY.recentListensTitle}</Text>
              <View style={styles.listenList}>
                {recentListens.map((item) => (
                  <Pressable
                    key={item.placeId}
                    style={({ pressed }) => [
                      styles.listenRow,
                      pressed && styles.listenRowPressed,
                    ]}
                    onPress={() => router.push(`/place/${item.placeId}`)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.listenThumb} />
                    <View style={styles.listenText}>
                      <Text style={styles.listenTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.listenMeta}>
                        {[item.durationLabel, item.listenedAtLabel]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                    <Ionicons name="headset-outline" size={18} color={colors.primary} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.premiumCard,
              pressed && styles.premiumCardPressed,
              hasSubscription && styles.premiumCardActive,
            ]}
            onPress={() => router.push('/(tabs)/decouvrir')}
            accessibilityRole="button"
          >
            <View style={styles.premiumIconWrap}>
              <Ionicons name="star" size={20} color={colors.primary} />
            </View>
            <View style={styles.premiumTextBlock}>
              <Text style={styles.premiumTitle}>
                {hasSubscription ? PROFILE_COPY.premiumActive : PROFILE_COPY.premiumCardTitle}
              </Text>
              <Text style={styles.premiumSubtitle}>
                {hasSubscription
                  ? PROFILE_COPY.premiumCardBodyActive
                  : PROFILE_COPY.premiumCardBodyInactive}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedSoft} />
          </Pressable>

          <View style={styles.sheetMenuGroup}>
            <SheetMenuRow
              icon="map-outline"
              label={PROFILE_COPY.myRoutes}
              subtitle={`${stats.routesCount} enregistrés`}
              onPress={() => router.push('/itineraries')}
            />
            <SheetMenuRow
              icon="heart-outline"
              label={PROFILE_COPY.favorites}
              subtitle={`${stats.favoritesCount} lieux`}
              onPress={() => router.push('/(tabs)/favoris')}
            />
            <SheetMenuRow
              icon="time-outline"
              label={PROFILE_COPY.history}
              subtitle={`${stats.listenCount} guides écoutés`}
              onPress={() => router.push('/(tabs)/decouvrir')}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
            onPress={confirmLogout}
            accessibilityRole="button"
            accessibilityLabel={PROFILE_COPY.logout}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={styles.logoutText}>{PROFILE_COPY.logout}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View
        style={[styles.heroControls, !heroControlsActive && styles.heroControlsHidden]}
        pointerEvents={heroControlsActive ? 'box-none' : 'none'}
      >
        <SafeAreaView edges={['top']} pointerEvents="box-none">
          <View style={styles.heroTopBar} pointerEvents="box-none">
            <Text
              style={[styles.heroTitle, styles.heroControlGhost]}
              importantForAccessibility="no"
              pointerEvents="none"
            >
              {PROFILE_COPY.title}
            </Text>
            <Pressable
              onPress={() => router.push('/settings')}
              style={styles.heroIconBtn}
              accessibilityRole="button"
              accessibilityLabel={PROFILE_COPY.settings}
            >
              <Ionicons name="settings-outline" size={22} color={colors.onDark} />
            </Pressable>
          </View>

          <View style={styles.heroIdentity} pointerEvents="box-none">
            <View style={[styles.avatarRing, styles.heroControlGhost]} pointerEvents="none">
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getUserInitials(user)}</Text>
              </View>
            </View>
            <Text style={[styles.heroName, styles.heroControlGhost]} pointerEvents="none">
              {displayName}
            </Text>
            <Text style={[styles.heroEmail, styles.heroControlGhost]} pointerEvents="none">
              {maskEmail(user.email)}
            </Text>
            <Text style={[styles.heroMember, styles.heroControlGhost]} pointerEvents="none">
              {memberLabel}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.editPill,
                pressed && styles.editPillPressed,
              ]}
              onPress={onEditProfile}
              accessibilityRole="button"
              accessibilityLabel={PROFILE_COPY.editProfile}
            >
              <Ionicons name="create-outline" size={14} color={colors.onDark} />
              <Text style={styles.editPillText}>{PROFILE_COPY.editProfile}</Text>
            </Pressable>
            <View style={[styles.statsCard, styles.heroControlGhost]} pointerEvents="none">
              <StatColumn
                value={String(stats.routesCount)}
                label={PROFILE_COPY.statRoutes}
                highlight
              />
              <View style={styles.statDivider} />
              <StatColumn
                value={String(stats.favoritesCount)}
                label={PROFILE_COPY.statFavorites}
              />
              <View style={styles.statDivider} />
              <StatColumn
                value={String(stats.listenCount)}
                label={PROFILE_COPY.statListens}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

export function ProfileLoadingView() {
  return (
    <View style={styles.screen}>
      <View style={styles.loadingHero} />
      <View style={styles.loadingSheet}>
        <View style={styles.skeletonGrid}>
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={styles.skeletonTile} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scroll: {
    ...StyleSheet.absoluteFill,
    zIndex: zIndex.sheet,
  },
  heroFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.map,
    paddingBottom: HERO_BOTTOM_PADDING,
  },
  heroControls: {
    ...StyleSheet.absoluteFill,
    zIndex: zIndex.sheet + 1,
  },
  heroControlsHidden: {
    opacity: 0,
  },
  heroControlGhost: {
    opacity: 0,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  heroTitle: {
    ...textStyle('displaySm'),
    color: colors.onDark,
  },
  heroIconBtn: {
    width: componentSizes.iconControlSize,
    height: componentSizes.iconControlSize,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIdentity: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  avatarRing: {
    padding: 3,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: 'rgba(46, 107, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...textStyle('displayMd'),
    color: colors.onDark,
  },
  heroName: {
    ...textStyle('displayMd'),
    color: colors.onDark,
    textAlign: 'center',
  },
  heroEmail: {
    ...textStyle('bodySm'),
    color: 'rgba(255,255,255,0.72)',
  },
  heroMember: {
    ...textStyle('captionSm'),
    color: 'rgba(255,255,255,0.55)',
    marginTop: spacing.xxs,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  editPillPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  editPillText: {
    ...textStyle('buttonSm'),
    color: colors.onDark,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statValue: {
    ...textStyle('displaySm'),
    color: colors.onDark,
  },
  statValueHighlight: {
    color: colors.primary,
  },
  statLabel: {
    ...textStyle('captionSm'),
    color: 'rgba(255,255,255,0.65)',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sheet: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -SHEET_LIP_OVERLAP,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    ...elevation.sheet,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.hairline,
    marginBottom: spacing.xs,
  },
  errorBanner: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: radius.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    ...textStyle('bodySm'),
    color: colors.error,
  },
  retry: {
    ...textStyle('buttonSm'),
    color: colors.legalLink,
  },
  sectionTitle: {
    ...textStyle('caption'),
    color: colors.muted,
    textTransform: 'uppercase',
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  shortcutTile: {
    width: '31%',
    flexGrow: 1,
    minWidth: 96,
    ...surfaceCardBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSoft,
  },
  shortcutTilePressed: {
    backgroundColor: colors.surfaceStrong,
  },
  shortcutIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    ...textStyle('captionSm'),
    color: colors.ink,
    textAlign: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: componentSizes.buttonPrimaryHeight + 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  createBtnPressed: {
    backgroundColor: colors.primaryActive,
  },
  createBtnText: {
    flex: 1,
    gap: spacing.xxs,
  },
  createBtnTitle: {
    ...textStyle('buttonMd'),
    color: colors.onPrimary,
  },
  createBtnHint: {
    ...textStyle('captionSm'),
    color: 'rgba(255,255,255,0.85)',
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  sectionLink: {
    ...textStyle('bodySm'),
    color: colors.legalLink,
  },
  horizontalList: {
    gap: spacing.sm,
    paddingRight: spacing.base,
  },
  routeCard: {
    width: 156,
    ...surfaceCardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.canvas,
    gap: spacing.sm,
  },
  routeCardPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  routeCardImageWrap: {
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeCardTitle: {
    ...textStyle('titleSm'),
    color: colors.ink,
    minHeight: 40,
  },
  routeCardMeta: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  listenList: {
    gap: spacing.sm,
  },
  listenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...surfaceCardBorder,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.canvas,
  },
  listenRowPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  listenThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
  },
  listenText: {
    flex: 1,
    gap: spacing.xxs,
  },
  listenTitle: {
    ...textStyle('titleSm'),
    color: colors.ink,
  },
  listenMeta: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  premiumCard: {
    ...surfaceCardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSoft,
  },
  premiumCardActive: {
    borderColor: colors.primaryDisabled,
    backgroundColor: '#f0f5ff',
  },
  premiumCardPressed: {
    backgroundColor: colors.surfaceStrong,
  },
  premiumIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTextBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  premiumTitle: {
    ...textStyle('titleMd'),
    color: colors.ink,
  },
  premiumSubtitle: {
    ...textStyle('bodySm'),
    color: colors.muted,
  },
  sheetMenuGroup: {
    gap: spacing.sm,
  },
  sheetMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...surfaceCardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.canvas,
  },
  sheetMenuRowPressed: {
    backgroundColor: colors.surfaceSoft,
  },
  sheetMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetMenuText: {
    flex: 1,
    gap: spacing.xxs,
  },
  sheetMenuLabel: {
    ...textStyle('bodyMd'),
    color: colors.ink,
  },
  sheetMenuSubtitle: {
    ...textStyle('captionSm'),
    color: colors.muted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: componentSizes.buttonPrimaryHeight,
    marginTop: spacing.sm,
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutText: {
    ...textStyle('buttonMd'),
    color: colors.error,
  },
  loadingHero: {
    height: 320,
    backgroundColor: colors.ink,
  },
  loadingSheet: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -spacing.xl,
    padding: spacing.base,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skeletonTile: {
    width: '30%',
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
  },
});
