/** POI minimal pour marqueurs carte. */
export interface CataloguePlaceMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  /** Libellé catégorie API (prioritaire sur i18n mock). */
  categoryLabel?: string;
  parentId?: string | null;
}

/** POI pour carte preview / recherche. */
export interface CataloguePlacePreview extends CataloguePlaceMarker {
  imageUrl: string | null;
  address: string | null;
  readyAudioCount: number;
}

export interface CatalogueCategory {
  id: string;
  slug: string;
  label: string;
}
