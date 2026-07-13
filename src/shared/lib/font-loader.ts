import type { CatalogTheme } from '@shared/styles/pwa-themes';

// Single unified skin (luxury-minimalism): Cormorant Garamond + Lato.
const LUXURY_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Lato:wght@300;400&display=swap';

export function loadThemeFont(theme: CatalogTheme): void {
  const existing = document.querySelector<HTMLLinkElement>('link[data-theme-font]');
  if (existing?.href === LUXURY_FONT_URL) return;
  existing?.remove();

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LUXURY_FONT_URL;
  link.setAttribute('data-theme-font', theme);
  document.head.appendChild(link);
}
