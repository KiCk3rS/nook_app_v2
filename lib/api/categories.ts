import type { PaginatedResponse, PoiCategory } from '../../types/api';
import { apiRequest } from './client';

export interface CategoryDto {
  id: string;
  slug: string;
  label: string;
  createdAt: string;
}

export interface CategoriesListResponse {
  items: CategoryDto[];
}

export function fetchCategories(): Promise<CategoriesListResponse> {
  return apiRequest<CategoriesListResponse>('/categories');
}

/** Alias pratique si besoin d'une liste plate. */
export async function fetchCategoryItems(): Promise<PoiCategory[]> {
  const { items } = await fetchCategories();
  return items.map(({ slug, label }) => ({ slug, label }));
}
