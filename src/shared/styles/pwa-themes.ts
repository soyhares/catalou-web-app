// Single unified skin. The 3-skin architecture (modern-minimalism / neo-luxury)
// was collapsed onto luxury-minimalism as the sole base. Per-tenant color overrides
// still apply (see ThemeProvider.applyThemeTokens); the API's `catalogTheme` is ignored.
export type CatalogTheme = 'luxury-minimalism';

// appearance-public payload — only the per-tenant color overrides are consumed.
// The raw API also sends `catalogTheme`, which we deliberately ignore.
export interface AppearancePayload {
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
  onAccent: string;
  error: string;
  success: string;
  warningBg: string;
  warningText: string;
}

export const PWA_THEMES: Record<CatalogTheme, ThemeTokens> = {
  'luxury-minimalism': {
    bg: '#FAF7F2', surface: '#FFFFFF', surfaceSecondary: '#F5EFE6',
    accent: '#C9A96E', accentSoft: '#E8DDD0', border: '#E8DDD0',
    text: '#3D2E1E', textSecondary: '#8B7355', card: '#FFFFFF',
    glassBg: 'rgba(250,247,242,0.85)', glassBorder: 'rgba(200,180,150,0.3)',
    headingFont: "'Cormorant Garamond', Georgia, serif", bodyFont: "'Lato', system-ui, sans-serif",
    radiusSm: '8px', radiusMd: '12px', radiusLg: '20px',
    radiusButton: '30px', radiusChip: '20px',
    shadow: '0 2px 12px rgba(60,40,20,0.06)',
    shadowSm: '0 1px 4px rgba(60,40,20,0.05)',
    shadowMd: '0 4px 20px rgba(60,40,20,0.08)',
    shadowLg: '0 8px 32px rgba(60,40,20,0.10)',
    motionDuration: '300ms',
    isMobileBreakpoint: 768,
    onAccent: '#3D2E1E',
    error: '#8B3A3A',
    success: '#4A7A5A',
    warningBg: 'rgba(201,169,110,0.12)',
    warningText: '#8B7355',
  },
};

export const defaultTheme: CatalogTheme = 'luxury-minimalism';
