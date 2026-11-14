import { publicFetch } from '@shared/lib/api';
import type { VariantTypePublic } from '@entities/product/api';
import type { components } from '@generated/catalog';

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

export type CheckoutOptions = components['schemas']['CheckoutOptions'];

/**
 * SPEC-023 (FR-011): opciones de entrega y pago del checkout Directo. Viajan en la misma
 * respuesta de GET /catalog/{slug} que el service worker ya tiene en caché. `null` cuando la
 * API todavía no las manda (fase 1 del despliegue): el checkout sigue como antes.
 */
export async function fetchCheckoutOptions(slug: string): Promise<CheckoutOptions | null> {
  const data = await publicFetch<components['schemas']['CatalogResponse']>(`/catalog/${slug}`);
  return data?.checkout ?? null;
}
