import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEMO_CREDIT_PACKS } from '../constants/creditPacks';
import {
  fetchCreditPacks,
  fetchCreditsBalance,
  purchaseCreditsPack as apiPurchaseCreditsPack,
} from '../lib/api/audioGuides';
import type { CreditPack, CreditsBalance, DurationTier } from '../types/audioGuideCreation';
import { resolveAffordance } from '../lib/mockAudioGuideCreation';
import { useAuth } from './AuthContext';
import { usePremium } from './PremiumContext';

interface CreditsContextValue {
  balance: CreditsBalance | null;
  packs: CreditPack[];
  isLoading: boolean;
  isLoadingPacks: boolean;
  packsError: string | null;
  refreshBalance: () => Promise<void>;
  loadPacks: () => Promise<void>;
  canAffordTier: (tier: DurationTier) => boolean;
  getTierPaymentLabel: (tier: DurationTier) => 'subscription_quota' | 'credits' | null;
  purchasePack: (productId: string) => Promise<void>;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { hasSubscription } = usePremium();
  const { isMockSession } = useAuth();
  const [balance, setBalance] = useState<CreditsBalance | null>(null);
  const [packs, setPacks] = useState<CreditPack[]>(DEMO_CREDIT_PACKS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPacks, setIsLoadingPacks] = useState(false);
  const [packsError, setPacksError] = useState<string | null>(null);

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

  const loadPacks = useCallback(async () => {
    setIsLoadingPacks(true);
    setPacksError(null);
    try {
      const res = await fetchCreditPacks(isMockSession);
      setPacks(res.items.length > 0 ? res.items : DEMO_CREDIT_PACKS);
    } catch {
      setPacks(DEMO_CREDIT_PACKS);
      setPacksError('packs_load_failed');
    } finally {
      setIsLoadingPacks(false);
    }
  }, [isMockSession]);

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

  const purchasePack = useCallback(
    async (productId: string) => {
      const next = await apiPurchaseCreditsPack(productId, isMockSession);
      setBalance(next);
    },
    [isMockSession],
  );

  const value = useMemo(
    () => ({
      balance,
      packs,
      isLoading,
      isLoadingPacks,
      packsError,
      refreshBalance,
      loadPacks,
      canAffordTier,
      getTierPaymentLabel,
      purchasePack,
    }),
    [
      balance,
      packs,
      isLoading,
      isLoadingPacks,
      packsError,
      refreshBalance,
      loadPacks,
      canAffordTier,
      getTierPaymentLabel,
      purchasePack,
    ],
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
