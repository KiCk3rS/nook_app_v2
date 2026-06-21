import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';

export function useRequireAuth(returnTo: string): {
  isReady: boolean;
  isAuthenticated: boolean;
} {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace({
        pathname: '/auth/login',
        params: { returnTo },
      });
    }
  }, [isAuthenticated, isLoading, returnTo, router]);

  return {
    isReady: !isLoading && isAuthenticated,
    isAuthenticated,
  };
}
