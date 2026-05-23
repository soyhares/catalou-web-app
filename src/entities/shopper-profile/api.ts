import { publicFetch } from '@shared/lib/api';

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'website';
  url: string;
}

export interface CatalogProfile {
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  publicEmail: string | null;
  socialLinks: SocialLink[];
  hasAboutSection: boolean;
}

export async function getCatalogProfile(slug: string): Promise<CatalogProfile> {
  return publicFetch<CatalogProfile>(`/public/catalog/${slug}/profile`);
}

export interface PrivacyPolicySection {
  title: string;
  content: string;
}

export interface PrivacyPolicyDto {
  businessName: string;
  contactEmail: string;
  language: 'ES' | 'EN';
  generatedAt: string;
  sections: PrivacyPolicySection[];
}

export async function getPrivacyPolicy(slug: string): Promise<PrivacyPolicyDto> {
  return publicFetch<PrivacyPolicyDto>(`/public/catalog/${slug}/privacy-policy`);
}
