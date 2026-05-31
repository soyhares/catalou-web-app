export type CatalogTheme = 'luxury' | 'clarity' | 'warm';

export interface ThemeTokens {
  bg: string; surface: string; surfaceSecondary: string;
  accent: string; accentSoft: string; border: string;
  text: string; textSecondary: string; card: string;
  headingFont: string; bodyFont: string;
  radiusSm: string; radiusMd: string; radiusLg: string;
  radiusButton: string; radiusChip: string;
  shadow: string; motionDuration: string;
  shadowSm: string; shadowMd: string; shadowLg: string;
  glassBg: string; glassBorder: string;
}

export const PWA_THEMES: Record<CatalogTheme, ThemeTokens> = {
  luxury: {
    bg: '#F5F0E6', surface: '#FFFCF8', surfaceSecondary: '#EDE5D8',
    accent: '#9A7B4F', accentSoft: '#C8A97A', border: '#E4D9CA',
    text: '#1A1816', textSecondary: '#6B6259', card: '#FFFCF8',
    headingFont: "'Cormorant Garamond', serif", bodyFont: "'Inter', sans-serif",
    radiusSm: '10px', radiusMd: '16px', radiusLg: '24px',
    radiusButton: '100px', radiusChip: '100px',
    shadow: '0 2px 12px rgba(26,24,22,0.10)', motionDuration: '300ms',
    shadowSm: '0 1px 3px rgba(26,24,22,0.06), 0 1px 2px rgba(26,24,22,0.04)',
    shadowMd: '0 4px 16px rgba(26,24,22,0.10), 0 2px 8px rgba(26,24,22,0.06)',
    shadowLg: '0 12px 40px rgba(26,24,22,0.18), 0 4px 16px rgba(26,24,22,0.10)',
    glassBg: 'rgba(255,252,248,0.85)', glassBorder: 'rgba(154,123,79,0.18)',
  },
  clarity: {
    bg: '#F8FAFC', surface: '#FFFFFF', surfaceSecondary: '#EFF6FF',
    accent: '#1D4ED8', accentSoft: '#3B82F6', border: '#E2E8F0',
    text: '#0F172A', textSecondary: '#475569', card: '#FFFFFF',
    headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif",
    radiusSm: '8px', radiusMd: '12px', radiusLg: '18px',
    radiusButton: '8px', radiusChip: '6px',
    shadow: '0 1px 4px rgba(15,23,42,0.08)', motionDuration: '150ms',
    shadowSm: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
    shadowMd: '0 4px 16px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04)',
    shadowLg: '0 12px 40px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.08)',
    glassBg: 'rgba(255,255,255,0.88)', glassBorder: 'rgba(226,232,240,0.80)',
  },
  warm: {
    bg: '#FEF4E8', surface: '#FFFFFF', surfaceSecondary: '#FDEBD4',
    accent: '#C2571A', accentSoft: '#F59963', border: '#EDD8C4',
    text: '#3B2F2F', textSecondary: '#7C6A5D', card: '#FFFFFF',
    headingFont: "'Poppins', sans-serif", bodyFont: "'Inter', sans-serif",
    radiusSm: '12px', radiusMd: '18px', radiusLg: '28px',
    radiusButton: '100px', radiusChip: '100px',
    shadow: '0 4px 16px rgba(194,87,26,0.12)', motionDuration: '200ms',
    shadowSm: '0 1px 3px rgba(194,87,26,0.06), 0 1px 2px rgba(194,87,26,0.04)',
    shadowMd: '0 4px 16px rgba(194,87,26,0.10), 0 2px 8px rgba(194,87,26,0.06)',
    shadowLg: '0 12px 40px rgba(194,87,26,0.16), 0 4px 16px rgba(194,87,26,0.10)',
    glassBg: 'rgba(255,252,248,0.88)', glassBorder: 'rgba(194,87,26,0.14)',
  },
};
