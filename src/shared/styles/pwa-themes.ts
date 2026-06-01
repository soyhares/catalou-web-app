export type CatalogTheme = 'luxury-minimalism' | 'neo-luxury' | 'modern-minimalism';

export interface AppearancePayload {
  catalogTheme: CatalogTheme;
  catalogColorBg: string;
  catalogColorAccent: string;
  catalogColorText: string;
  catalogColorCard: string;
}

export interface ThemeTokens {
  bg: string; surface: string; surfaceSecondary: string;
  accent: string; accentSoft: string; border: string;
  text: string; textSecondary: string; card: string;
  glassBg: string; glassBorder: string;
  headingFont: string; bodyFont: string;
  radiusSm: string; radiusMd: string; radiusLg: string;
  radiusButton: string; radiusChip: string;
  shadow: string; shadowSm: string; shadowMd: string; shadowLg: string;
  motionDuration: string;
  isMobileBreakpoint: number;
}

export const PWA_THEMES: Record<CatalogTheme, ThemeTokens> = {
  'luxury-minimalism': {
    bg: '#FAF7F2', surface: '#FFFFFF', surfaceSecondary: '#F5EFE6',
    accent: '#C9A96E', accentSoft: '#E8DDD0', border: '#E8DDD0',
    text: '#3D2E1E', textSecondary: '#8B7355', card: '#FFFFFF',
    glassBg: 'rgba(250,247,242,0.85)', glassBorder: 'rgba(200,180,150,0.3)',
    headingFont: "'Cormorant Garamond'", bodyFont: "'Lato'",
    radiusSm: '8px', radiusMd: '12px', radiusLg: '20px',
    radiusButton: '30px', radiusChip: '20px',
    shadow: '0 2px 12px rgba(60,40,20,0.06)',
    shadowSm: '0 1px 4px rgba(60,40,20,0.05)',
    shadowMd: '0 4px 20px rgba(60,40,20,0.08)',
    shadowLg: '0 8px 32px rgba(60,40,20,0.10)',
    motionDuration: '300ms',
    isMobileBreakpoint: 768,
  },
  'neo-luxury': {
    bg: '#0D0718', surface: '#150B2A', surfaceSecondary: '#1E0A35',
    accent: '#E879F9', accentSoft: 'rgba(232,121,249,0.15)', border: 'rgba(167,139,250,0.15)',
    text: '#F8FAFC', textSecondary: 'rgba(167,139,250,0.7)', card: '#150B2A',
    glassBg: 'rgba(21,11,42,0.85)', glassBorder: 'rgba(167,139,250,0.2)',
    headingFont: "'Space Grotesk'", bodyFont: "'Space Grotesk'",
    radiusSm: '8px', radiusMd: '12px', radiusLg: '16px',
    radiusButton: '24px', radiusChip: '20px',
    shadow: '0 4px 20px rgba(232,121,249,0.1)',
    shadowSm: '0 2px 8px rgba(0,0,0,0.3)',
    shadowMd: '0 8px 32px rgba(232,121,249,0.12)',
    shadowLg: '0 16px 48px rgba(232,121,249,0.15)',
    motionDuration: '200ms',
    isMobileBreakpoint: 768,
  },
  'modern-minimalism': {
    bg: '#FFFFFF', surface: '#FFFFFF', surfaceSecondary: '#F9FAFB',
    accent: '#111827', accentSoft: '#F3F4F6', border: '#E5E7EB',
    text: '#111827', textSecondary: '#6B7280', card: '#FFFFFF',
    glassBg: 'rgba(255,255,255,0.92)', glassBorder: 'rgba(229,231,235,0.8)',
    headingFont: "'Inter'", bodyFont: "'Inter'",
    radiusSm: '4px', radiusMd: '8px', radiusLg: '12px',
    radiusButton: '8px', radiusChip: '6px',
    shadow: '0 1px 3px rgba(0,0,0,0.08)',
    shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
    shadowLg: '0 8px 24px rgba(0,0,0,0.10)',
    motionDuration: '150ms',
    isMobileBreakpoint: 768,
  },
};

export const defaultTheme: CatalogTheme = 'modern-minimalism';
