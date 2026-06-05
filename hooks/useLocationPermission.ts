import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  trackPermissionRequestResult,
  trackPermissionRequestStarted,
} from '../lib/analytics';

export type LocationPermissionStatus = 'loading' | 'granted' | 'denied' | 'blocked';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface UseLocationPermissionResult {
  status: LocationPermissionStatus;
  isAttention: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  requestWhenInUse: () => Promise<LocationPermissionStatus>;
  getCurrentPosition: () => Promise<LocationCoords | null>;
}

function mapForegroundStatus(
  status: Location.PermissionStatus,
  canAskAgain: boolean,
): LocationPermissionStatus {
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  if (status === Location.PermissionStatus.DENIED && !canAskAgain) return 'blocked';
  return 'denied';
}

export function useLocationPermission(): UseLocationPermissionResult {
  const [status, setStatus] = useState<LocationPermissionStatus>('loading');
  const isRefreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setStatus('loading');
    try {
      const { status: fgStatus, canAskAgain } =
        await Location.getForegroundPermissionsAsync();
      setStatus(mapForegroundStatus(fgStatus, canAskAgain));
    } catch {
      setStatus('denied');
    } finally {
      isRefreshing.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function handleAppState(nextState: AppStateStatus) {
      if (nextState === 'active') void refresh();
    }
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [refresh]);

  const requestWhenInUse = useCallback(async (): Promise<LocationPermissionStatus> => {
    trackPermissionRequestStarted('location_when_in_use');
    try {
      const { status: fgStatus, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();
      const next = mapForegroundStatus(fgStatus, canAskAgain);
      setStatus(next);
      trackPermissionRequestResult(
        'location_when_in_use',
        next === 'granted' ? 'granted' : next === 'blocked' ? 'blocked' : 'denied',
      );
      return next;
    } catch {
      setStatus('denied');
      trackPermissionRequestResult('location_when_in_use', 'denied');
      return 'denied';
    }
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<LocationCoords | null> => {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch {
      return null;
    }
  }, []);

  return {
    status,
    isAttention: status === 'denied' || status === 'blocked',
    isLoading: status === 'loading',
    refresh,
    requestWhenInUse,
    getCurrentPosition,
  };
}
