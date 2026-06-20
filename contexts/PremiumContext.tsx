import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type PremiumAccessState = 'locked' | 'purchased' | 'included_in_subscription';

interface PremiumContextValue {
  hasSubscription: boolean;
  purchasedItineraryIds: Set<string>;
  getAccessState: (itineraryId: string, isPremium: boolean) => PremiumAccessState;
  isUnlocked: (itineraryId: string, isPremium: boolean) => boolean;
  unlockItinerary: (itineraryId: string) => void;
  unlockSubscription: () => void;
  restorePurchases: () => void;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [purchasedItineraryIds, setPurchasedItineraryIds] = useState<Set<string>>(
    new Set(),
  );
  const [hasSubscription, setHasSubscription] = useState(false);

  const getAccessState = useCallback(
    (itineraryId: string, isPremium: boolean): PremiumAccessState => {
      if (!isPremium) return 'purchased';
      if (hasSubscription) return 'included_in_subscription';
      if (purchasedItineraryIds.has(itineraryId)) return 'purchased';
      return 'locked';
    },
    [hasSubscription, purchasedItineraryIds],
  );

  const isUnlocked = useCallback(
    (itineraryId: string, isPremium: boolean) =>
      getAccessState(itineraryId, isPremium) !== 'locked',
    [getAccessState],
  );

  const unlockItinerary = useCallback((itineraryId: string) => {
    setPurchasedItineraryIds((prev) => new Set(prev).add(itineraryId));
  }, []);

  const unlockSubscription = useCallback(() => {
    setHasSubscription(true);
  }, []);

  const restorePurchases = useCallback(() => {
    setHasSubscription(true);
  }, []);

  const value = useMemo(
    () => ({
      hasSubscription,
      purchasedItineraryIds,
      getAccessState,
      isUnlocked,
      unlockItinerary,
      unlockSubscription,
      restorePurchases,
    }),
    [
      hasSubscription,
      purchasedItineraryIds,
      getAccessState,
      isUnlocked,
      unlockItinerary,
      unlockSubscription,
      restorePurchases,
    ],
  );

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return ctx;
}
