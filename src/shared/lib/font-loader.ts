import type { CatalogTheme } from '@shared/styles/pwa-themes';

const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2?';

const THEME_FONT_URLS: Record<CatalogTheme, string | null> = {
  'luxury-minimalism': `${GOOGLE_FONTS_BASE}family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Lato:wght@300;400&display=swap`,
  'neo-luxury':        `${GOOGLE_FONTS_BASE}family=Space+Grotesk:wght@400;500;700&display=swap`,
  'modern-minimalism': `${GOOGLE_FONTS_BASE}family=Inter:wght@400;500;600&display=swap`,
};

export function loadThemeFont(theme: CatalogTheme): void {
  const url = THEME_FONT_URLS[theme];
  if (!url) return;

  const existing = document.querySelector<HTMLLinkElement>('link[data-theme-font]');
  if (existing?.href === url) return;
  existing?.remove();

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.setAttribute('data-theme-font', theme);
  document.head.appendChild(link);
}
