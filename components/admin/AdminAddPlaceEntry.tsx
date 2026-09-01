import { AddPlaceControl } from './AddPlaceControl';
import { useAdminAddPlace } from './AdminAddPlaceContext';
import { AddWikipediaPoiSheet } from './AddWikipediaPoiSheet';

/**
 * Point d’entrée carte A1.1 : gate admin + bouton + feuille Wikipedia → POI.
 */
export function AdminAddPlaceEntry() {
  const adminAddPlace = useAdminAddPlace();

  if (!adminAddPlace?.isAdminPlacementEnabled) {
    return null;
  }

  return (
    <>
      <AddPlaceControl onPress={() => adminAddPlace.openSheet('search')} />
      <AddWikipediaPoiSheet
        visible={adminAddPlace.sheetVisible}
        initialMode={adminAddPlace.sheetInitialMode}
        placementPin={adminAddPlace.placementPin}
        onClose={adminAddPlace.closeSheet}
        onSuccess={adminAddPlace.clearPlacementAfterSuccess}
      />
    </>
  );
}
