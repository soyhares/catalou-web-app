import { publicFetch } from '@shared/lib/api';
import type { VariantTypePublic } from '@entities/product/api';

export interface PublicSubcategory {
  id: string;
  name: string;
}

export interface PublicCategory {
  id: string;
  name: string;
  purpose: 'services' | 'menu' | 'informative' | null;
  subcategories: PublicSubcategory[];
}

export interface PublicProduct {
  id: string;
  name: string;
  basePrice: string;
  mainImageUrl: string | null;
  subcategoryId: string;
  categoryId: string;
  type: 'product' | 'service';
  durationMinutes: number | null;
  description?: string | null;
  // absent on responses from an API older than the variant-aware listing
  variantTypes?: VariantTypePublic[];
}

export interface CatalogData {
  categories: PublicCategory[];
  products: PublicProduct[];
  showPrices: boolean;
}

export async function fetchCatalog(
  slug: string,
  params?: { q?: string; categoryId?: string; subcategoryId?: string },
): Promise<CatalogData> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.categoryId) qs.set('categoryId', params.categoryId);
  if (params?.subcategoryId) qs.set('subcategoryId', params.subcategoryId);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return publicFetch(`/catalog/${slug}${query}`);
}
