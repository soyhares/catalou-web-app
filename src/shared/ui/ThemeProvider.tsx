import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useBranding } from '@app/BrandingContext';
import { PWA_THEMES, defaultTheme, type CatalogTheme, type AppearancePayload } from '@shared/styles/pwa-themes';
import { loadThemeFont } from '@shared/lib/font-loader';

export type { CatalogTheme };

// Sole skin. Kept as a constant so consumers of useTheme().theme keep working
// after the 3-skin collapse without branching.
const THEME: CatalogTheme = 'luxury-minimalism';

interface ThemeContextValue {
  theme: CatalogTheme;
  isMobile: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEME,
  isMobile: false,
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace(/^#/, '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function contrastOnHex(hex: string): string {
  const h = hex.replace(/^#/, '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.4 ? '#111111' : '#FFFFFF';
}

function isHex(v: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(v);
}

// Always applies the luxury base tokens. Only the per-tenant color overrides
// (bg/accent/text/card) from the API are honored; the API's `catalogTheme` is ignored.
function applyThemeTokens(payload: AppearancePayload): void {
  const base = PWA_THEMES[THEME];
  const root = document.documentElement;

  const finalText   = payload.catalogColorText   || base.text;
  const finalAccent = payload.catalogColorAccent || base.accent;
  const finalBg     = payload.catalogColorBg     || base.bg;
  const finalCard   = payload.catalogColorCard   || base.card;

  const customText   = isHex(payload.catalogColorText);
  const customAccent = isHex(payload.catalogColorAccent);

  // Overridable tokens
  root.style.setProperty('--pwa-bg',     finalBg);
  root.style.setProperty('--pwa-accent', finalAccent);
  root.style.setProperty('--pwa-text',   finalText);
  root.style.setProperty('--pwa-card',   finalCard);

  // Derived tokens — recomputed from overridable ones when admin provides custom colors,
  // otherwise use the theme's design-system values.
  root.style.setProperty('--pwa-text-secondary', customText   ? hexToRgba(finalText, 0.6)    : base.textSecondary);
  root.style.setProperty('--pwa-border',         customText   ? hexToRgba(finalText, 0.15)   : base.border);
  root.style.setProperty('--pwa-accent-soft',    customAccent ? hexToRgba(finalAccent, 0.15) : base.accentSoft);
  root.style.setProperty('--pwa-on-accent',      customAccent ? contrastOnHex(finalAccent)   : base.onAccent);

  // Structural palette (non-overridable layout tokens)
  root.style.setProperty('--pwa-surface',           base.surface);
  root.style.setProperty('--pwa-surface-secondary', base.surfaceSecondary);
  root.style.setProperty('--pwa-glass-bg',          base.glassBg);
  root.style.setProperty('--pwa-glass-border',      base.glassBorder);

  // Typography
  root.style.setProperty('--pwa-font-heading', base.headingFont);
  root.style.setProperty('--pwa-font-body',    base.bodyFont);

  // Component tokens
  root.style.setProperty('--pwa-radius-sm',     base.radiusSm);
  root.style.setProperty('--pwa-radius-md',     base.radiusMd);
  root.style.setProperty('--pwa-radius-lg',     base.radiusLg);
  root.style.setProperty('--pwa-radius-button', base.radiusButton);
  root.style.setProperty('--pwa-radius-chip',   base.radiusChip);
  root.style.setProperty('--pwa-shadow',        base.shadow);
  root.style.setProperty('--pwa-motion',        base.motionDuration);
  root.style.setProperty('--pwa-shadow-sm',     base.shadowSm);
  root.style.setProperty('--pwa-shadow-md',     base.shadowMd);
  root.style.setProperty('--pwa-shadow-lg',     base.shadowLg);

  // Semantic state tokens
  root.style.setProperty('--pwa-error',         base.error);
  root.style.setProperty('--pwa-success',       base.success);
  root.style.setProperty('--pwa-warning-bg',    base.warningBg);
  root.style.setProperty('--pwa-warning-text',  base.warningText);

  root.setAttribute('data-pwa-theme', THEME);
}

const EMPTY_OVERRIDES: AppearancePayload = {
  catalogColorBg: '', catalogColorAccent: '', catalogColorText: '', catalogColorCard: '',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { slug } = useBranding();
  const mobileBp = PWA_THEMES[defaultTheme].isMobileBreakpoint;
  const mobileQuery = `(max-width: ${mobileBp}px)`;
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.matchMedia(mobileQuery).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(mobileQuery);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mobileQuery]);

  useEffect(() => {
    loadThemeFont(THEME);
    if (!slug) {
      applyThemeTokens(EMPTY_OVERRIDES);
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL as string;
    fetch(`${apiUrl}/companies/${slug}/appearance-public`)
      .then((r) => (r.ok ? (r.json() as Promise<AppearancePayload>) : Promise.reject()))
      .then((data) => applyThemeTokens(data))
      .catch(() => applyThemeTokens(EMPTY_OVERRIDES));
  }, [slug]);

  return <ThemeContext.Provider value={{ theme: THEME, isMobile }}>{children}</ThemeContext.Provider>;
}
