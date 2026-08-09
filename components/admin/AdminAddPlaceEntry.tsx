import { useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { canUseAdminEditorialTools } from '../../lib/auth/roles';
import { isApiConfigured } from '../../lib/config';
import { AddPlaceControl } from './AddPlaceControl';
import { AddWikipediaPoiSheet } from './AddWikipediaPoiSheet';

/**
 * Point d’entrée carte A1.1 : gate admin + bouton + feuille Wikipedia → POI.
 * `CarteScreen` n’a pas à connaître auth / API / état de feuille.
 */
export function AdminAddPlaceEntry() {
  const { user, isAuthenticated, isMockSession } = useAuth();
  const [sheetVisible, setSheetVisible] = useState(false);

  const canShow = canUseAdminEditorialTools({
    user,
    isAuthenticated,
    isMockSession,
    apiConfigured: isApiConfigured(),
  });

  if (!canShow) {
    return null;
  }

  return (
    <>
      <AddPlaceControl onPress={() => setSheetVisible(true)} />
      <AddWikipediaPoiSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}
