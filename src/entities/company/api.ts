import { publicFetch } from '@shared/lib/api';

export interface BrandingData {
  companyName: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  colorText: string;
  language: 'ES' | 'EN';
  showPrices: boolean;
  orderType: 'DIRECT' | 'FINANCED' | 'BOTH';
  businessModel: 'DIRECT' | 'ASSOCIATED' | 'BOTH';
  servicePercentage: number;
  associationName?: string | null;
  currency: 'USD' | 'CRC';
  vapidPublicKey: string | null;
  featuresEnabled: Record<string, boolean>;
}

export async function getBranding(slug: string): Promise<BrandingData> {
  return publicFetch<BrandingData>(`/companies/${slug}/branding`);
}
