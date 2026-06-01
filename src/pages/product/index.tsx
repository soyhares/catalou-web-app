import { lazy, Suspense } from 'react';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useProductPage, type ProductPageProps } from './useProductPage';
import type { CatalogTheme } from '@shared/styles/pwa-themes';

const SKINS: Record<CatalogTheme, React.LazyExoticComponent<React.FC<ProductPageProps>>> = {
  'luxury-minimalism': lazy(() => import('./skins/luxury-minimalism')),
  'neo-luxury': lazy(() => import('./skins/neo-luxury')),
  'modern-minimalism': lazy(() => import('./skins/modern-minimalism')),
};

export default function ProductPage() {
  const { theme } = useTheme();
  const Skin = SKINS[theme] ?? SKINS['modern-minimalism'];
  const props = useProductPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <Skin {...props} />
    </Suspense>
  );
}
