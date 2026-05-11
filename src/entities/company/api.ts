import { publicFetch } from '@shared/lib/api';

export interface BrandingData {
  companyName: string;
  logoUrl: string | null;
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  colorText: string;
  language: 'ES' | 'EN';
}

export async function getBranding(slug: string): Promise<BrandingData> {
  return publicFetch<BrandingData>(`/companies/${slug}/branding`);
}
