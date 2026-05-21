export type CatalogTheme = 'luxury' | 'clarity' | 'warm';

export interface ThemeTokens {
  bg: string; surface: string; surfaceSecondary: string;
  accent: string; accentSoft: string; border: string;
  text: string; textSecondary: string; card: string;
  headingFont: string; bodyFont: string;
  radiusSm: string; radiusMd: string; radiusLg: string;
  radiusButton: string; radiusChip: string;
  shadow: string; motionDuration: string;
}

export const PWA_THEMES: Record<CatalogTheme, ThemeTokens> = {
  luxury: {
    bg: '#F6F2EB', surface: '#FFFCF8', surfaceSecondary: '#EFE7DB',
    accent: '#B08D57', accentSoft: '#D6C2A1', border: '#E7DED1',
    text: '#1A1816', textSecondary: '#6E665E', card: '#FFFCF8',
    headingFont: "'Cormorant Garamond', serif", bodyFont: "'Inter', sans-serif",
    radiusSm: '10px', radiusMd: '16px', radiusLg: '24px',
    radiusButton: '100px', radiusChip: '100px',
    shadow: '0 2px 12px rgba(0,0,0,0.08)', motionDuration: '300ms',
  },
  clarity: {
    bg: '#F8FAFC', surface: '#FFFFFF', surfaceSecondary: '#EBF4FF',
    accent: '#2563EB', accentSoft: '#06B6D4', border: '#E2E8F0',
    text: '#0F172A', textSecondary: '#475569', card: '#FFFFFF',
    headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif",
    radiusSm: '8px', radiusMd: '12px', radiusLg: '18px',
    radiusButton: '8px', radiusChip: '6px',
    shadow: '0 1px 3px rgba(0,0,0,0.1)', motionDuration: '150ms',
  },
  warm: {
    bg: '#FFF8F1', surface: '#FFFFFF', surfaceSecondary: '#FDF1E6',
    accent: '#D97757', accentSoft: '#FDBA74', border: '#F1E5D8',
    text: '#3B2F2F', textSecondary: '#7C6A5D', card: '#FFFFFF',
    headingFont: "'Poppins', sans-serif", bodyFont: "'Inter', sans-serif",
    radiusSm: '12px', radiusMd: '18px', radiusLg: '28px',
    radiusButton: '100px', radiusChip: '100px',
    shadow: '0 4px 16px rgba(217,119,87,0.12)', motionDuration: '200ms',
  },
};
