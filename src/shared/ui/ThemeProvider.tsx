import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useBranding } from '@app/BrandingContext';
import { PWA_THEMES, type CatalogTheme } from '@shared/styles/pwa-themes';
import { loadThemeFont } from '@shared/lib/font-loader';

export type { CatalogTheme };

interface ThemeContextValue {
  theme: CatalogTheme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'clarity' });

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

interface AppearancePayload {
  catalogTheme: CatalogTheme;
  catalogColorBg: string;
  catalogColorAccent: string;
  catalogColorText: string;
  catalogColorCard: string;
}

function applyThemeTokens(payload: AppearancePayload): void {
  const base = PWA_THEMES[payload.catalogTheme];
  const root = document.documentElement;
  // Editable tokens (overridable)
  root.style.setProperty('--pwa-bg',     payload.catalogColorBg     || base.bg);
  root.style.setProperty('--pwa-accent', payload.catalogColorAccent || base.accent);
  root.style.setProperty('--pwa-text',   payload.catalogColorText   || base.text);
  root.style.setProperty('--pwa-card',   payload.catalogColorCard   || base.card);
  // Full palette
  root.style.setProperty('--pwa-surface',           base.surface);
  root.style.setProperty('--pwa-surface-secondary', base.surfaceSecondary);
  root.style.setProperty('--pwa-accent-soft',       base.accentSoft);
  root.style.setProperty('--pwa-border',            base.border);
  root.style.setProperty('--pwa-text-secondary',    base.textSecondary);
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
  root.style.setProperty('--pwa-glass-bg',      base.glassBg);
  root.style.setProperty('--pwa-glass-border',  base.glassBorder);
  root.setAttribute('data-pwa-theme', payload.catalogTheme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { slug } = useBranding();
  const [theme, setTheme] = useState<CatalogTheme>('clarity');

  useEffect(() => {
    if (!slug) return;
    const apiUrl = import.meta.env.VITE_API_URL as string;
    fetch(`${apiUrl}/companies/${slug}/appearance-public`)
      .then((r) => (r.ok ? (r.json() as Promise<AppearancePayload>) : Promise.reject()))
      .then((data) => {
        applyThemeTokens(data);
        loadThemeFont(data.catalogTheme);
        setTheme(data.catalogTheme);
      })
      .catch(() => {
        // Fallback to clarity defaults — endpoint not yet available (TASK-070/071 pending)
        applyThemeTokens({ catalogTheme: 'clarity', catalogColorBg: '', catalogColorAccent: '', catalogColorText: '', catalogColorCard: '' });
        loadThemeFont('clarity');
      });
  }, [slug]);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}
