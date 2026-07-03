import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type NotificationPermissionStatus =
  | 'loading'
  | 'granted'
  | 'denied'
  | 'blocked';

function mapPermissionStatus(
  status: Notifications.PermissionStatus,
  canAskAgain: boolean,
): NotificationPermissionStatus {
  if (status === Notifications.PermissionStatus.GRANTED) return 'granted';
  if (!canAskAgain) return 'blocked';
  return 'denied';
}

export function useNotificationPermission() {
  const [status, setStatus] = useState<NotificationPermissionStatus>('loading');
  const isRefreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    setStatus('loading');
    try {
      const { status: permStatus, canAskAgain } =
        await Notifications.getPermissionsAsync();
      setStatus(mapPermissionStatus(permStatus, canAskAgain));
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

  const requestPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    try {
      const { status: permStatus, canAskAgain } =
        await Notifications.requestPermissionsAsync();
      const next = mapPermissionStatus(permStatus, canAskAgain);
      setStatus(next);
      return next;
    } catch {
      setStatus('denied');
      return 'denied';
    }
  }, []);

  return {
    status,
    isGranted: status === 'granted',
    isLoading: status === 'loading',
    refresh,
    requestPermission,
  };
}
