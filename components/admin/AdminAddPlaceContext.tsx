import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { canUseAdminEditorialTools } from '../../lib/auth/roles';
import { isApiConfigured } from '../../lib/config';

export type PlacementPin = {
  lat: number;
  lng: number;
};

/** Aperçu marqueur (catégorie choisie dans le formulaire de création). */
export type PlacementPinPreview = {
  name: string;
  iconKey: string;
  colorHex: string;
};

export type AddPlaceSheetMode = 'search' | 'nearby';

type AdminAddPlaceContextValue = {
  isAdminPlacementEnabled: boolean;
  placementPin: PlacementPin | null;
  placementPreview: PlacementPinPreview | null;
  setPlacementPin: (pin: PlacementPin | null) => void;
  setPlacementPreview: (preview: PlacementPinPreview | null) => void;
  placePinAt: (coord: { latitude: number; longitude: number }) => void;
  clearPlacementPin: () => void;
  sheetVisible: boolean;
  sheetInitialMode: AddPlaceSheetMode;
  openSheet: (mode?: AddPlaceSheetMode) => void;
  closeSheet: () => void;
  clearPlacementAfterSuccess: () => void;
};

const AdminAddPlaceContext = createContext<AdminAddPlaceContextValue | null>(
  null,
);

export function useAdminAddPlace(): AdminAddPlaceContextValue | null {
  return useContext(AdminAddPlaceContext);
}

interface AdminAddPlaceProviderProps {
  children: ReactNode;
}

export function AdminAddPlaceProvider({ children }: AdminAddPlaceProviderProps) {
  const { user, isAuthenticated, isMockSession } = useAuth();
  const [placementPin, setPlacementPin] = useState<PlacementPin | null>(null);
  const [placementPreview, setPlacementPreview] =
    useState<PlacementPinPreview | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetInitialMode, setSheetInitialMode] =
    useState<AddPlaceSheetMode>('search');

  const isAdminPlacementEnabled = canUseAdminEditorialTools({
    user,
    isAuthenticated,
    isMockSession,
    apiConfigured: isApiConfigured(),
  });

  const placePinAt = useCallback(
    (coord: { latitude: number; longitude: number }) => {
      if (!isAdminPlacementEnabled) return;
      setPlacementPin({ lat: coord.latitude, lng: coord.longitude });
    },
    [isAdminPlacementEnabled],
  );

  const clearPlacementPin = useCallback(() => {
    setPlacementPin(null);
    setPlacementPreview(null);
  }, []);

  const openSheet = useCallback(
    (mode: AddPlaceSheetMode = 'search') => {
      if (!isAdminPlacementEnabled) return;
      setSheetInitialMode(mode);
      setSheetVisible(true);
    },
    [isAdminPlacementEnabled],
  );

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setPlacementPreview(null);
  }, []);

  const clearPlacementAfterSuccess = useCallback(() => {
    setPlacementPin(null);
    setPlacementPreview(null);
    setSheetVisible(false);
  }, []);

  const value = useMemo(
    (): AdminAddPlaceContextValue => ({
      isAdminPlacementEnabled,
      placementPin,
      placementPreview,
      setPlacementPin,
      setPlacementPreview,
      placePinAt,
      clearPlacementPin,
      sheetVisible,
      sheetInitialMode,
      openSheet,
      closeSheet,
      clearPlacementAfterSuccess,
    }),
    [
      isAdminPlacementEnabled,
      placementPin,
      placementPreview,
      placePinAt,
      clearPlacementPin,
      sheetVisible,
      sheetInitialMode,
      openSheet,
      closeSheet,
      clearPlacementAfterSuccess,
    ],
  );

  return (
    <AdminAddPlaceContext.Provider value={value}>
      {children}
    </AdminAddPlaceContext.Provider>
  );
}
