import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchHealth } from '../lib/api/health';
import { isApiConfigured } from '../lib/config';
import {
  classifyHealthError,
  type ServiceHealthFailure,
} from '../lib/serviceHealth/classifyHealthError';

export type ServiceHealthStatus =
  | 'idle'
  | 'checking'
  | 'ok'
  | 'offline'
  | 'unavailable';

interface ServiceHealthContextValue {
  status: ServiceHealthStatus;
  failure: ServiceHealthFailure | null;
  isLimitedMode: boolean;
  isChecking: boolean;
  shouldShowDegradedBanner: boolean;
  checkHealth: () => Promise<void>;
  enterLimitedMode: () => void;
}

const ServiceHealthContext = createContext<ServiceHealthContextValue | null>(null);

export function ServiceHealthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ServiceHealthStatus>('idle');
  const [failure, setFailure] = useState<ServiceHealthFailure | null>(null);
  const [isLimitedMode, setIsLimitedMode] = useState(false);

  const checkHealth = useCallback(async () => {
    if (!isApiConfigured()) {
      setStatus('ok');
      setFailure(null);
      return;
    }

    setStatus('checking');
    try {
      await fetchHealth();
      setStatus('ok');
      setFailure(null);
      setIsLimitedMode(false);
    } catch (error) {
      const kind = classifyHealthError(error);
      setFailure(kind);
      setStatus(kind);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const enterLimitedMode = useCallback(() => {
    setIsLimitedMode(true);
  }, []);

  const shouldShowDegradedBanner =
    isApiConfigured() &&
    !isLimitedMode &&
    (status === 'offline' || status === 'unavailable');

  const value = useMemo(
    () => ({
      status,
      failure,
      isLimitedMode,
      isChecking: status === 'checking',
      shouldShowDegradedBanner,
      checkHealth,
      enterLimitedMode,
    }),
    [
      status,
      failure,
      isLimitedMode,
      shouldShowDegradedBanner,
      checkHealth,
      enterLimitedMode,
    ],
  );

  return (
    <ServiceHealthContext.Provider value={value}>
      {children}
    </ServiceHealthContext.Provider>
  );
}

export function useServiceHealth(): ServiceHealthContextValue {
  const ctx = useContext(ServiceHealthContext);
  if (!ctx) {
    throw new Error('useServiceHealth must be used within ServiceHealthProvider');
  }
  return ctx;
}
