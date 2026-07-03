import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchCreditsBalance, purchaseCreditsPack as apiPurchaseCreditsPack } from '../lib/api/audioGuides';
import type { CreditsBalance, DurationTier } from '../types/audioGuideCreation';
import { resolveAffordance } from '../lib/mockAudioGuideCreation';
import { useAuth } from './AuthContext';
import { usePremium } from './PremiumContext';

interface CreditsContextValue {
  balance: CreditsBalance | null;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
  canAffordTier: (tier: DurationTier) => boolean;
  getTierPaymentLabel: (tier: DurationTier) => 'subscription_quota' | 'credits' | null;
  purchasePack: (credits: number) => Promise<void>;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { hasSubscription } = usePremium();
  const { isMockSession } = useAuth();
  const [balance, setBalance] = useState<CreditsBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      const next = await fetchCreditsBalance({
        demoSession: isMockSession,
        hasSubscription,
      });
      setBalance(next);
    } catch {
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [hasSubscription, isMockSession]);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  const canAffordTier = useCallback(
    (tier: DurationTier) => {
      if (!balance) return false;
      return resolveAffordance(balance, tier, hasSubscription).canAfford;
    },
    [balance, hasSubscription],
  );

  const getTierPaymentLabel = useCallback(
    (tier: DurationTier): 'subscription_quota' | 'credits' | null => {
      if (!balance) return null;
      return resolveAffordance(balance, tier, hasSubscription).paymentType;
    },
    [balance, hasSubscription],
  );

  const purchasePack = useCallback(async (credits: number) => {
    const next = await apiPurchaseCreditsPack(credits, isMockSession);
    setBalance(next);
  }, [isMockSession]);

  const value = useMemo(
    () => ({
      balance,
      isLoading,
      refreshBalance,
      canAffordTier,
      getTierPaymentLabel,
      purchasePack,
    }),
    [balance, isLoading, refreshBalance, canAffordTier, getTierPaymentLabel, purchasePack],
  );

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>;
}

export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext);
  if (!ctx) {
    throw new Error('useCredits must be used within CreditsProvider');
  }
  return ctx;
}
