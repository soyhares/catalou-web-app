import { publicFetch } from '@shared/lib/api';

export interface VariantValuePublic {
  id: string;
  value: string;
  priceModifier: string;
  imageUrl: string | null;
}

export interface VariantTypePublic {
  id: string;
  name: string;
  values: VariantValuePublic[];
}

export interface ProductImagePublic {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProductPublic {
  id: string;
  name: string;
  type: 'product' | 'service';
  description: string | null;
  technicalSpecs: string | null;
  basePrice: string;
  mainImageUrl: string | null;
  variantType: VariantTypePublic | null;
  images: ProductImagePublic[];
}

export async function fetchProduct(slug: string, productId: string): Promise<ProductPublic> {
  return publicFetch(`/catalog/${slug}/products/${productId}`);
}
