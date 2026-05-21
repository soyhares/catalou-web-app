import type { CatalogTheme } from '@shared/styles/pwa-themes';

const THEME_FONT_URLS: Record<CatalogTheme, string | null> = {
  luxury:  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap',
  clarity: null,
  warm:    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap',
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
