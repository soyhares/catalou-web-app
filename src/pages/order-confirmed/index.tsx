import { lazy, Suspense } from 'react';
import { useTheme } from '@shared/ui/ThemeProvider';
import { useOrderConfirmedPage, type OrderConfirmedPageProps } from './useOrderConfirmedPage';
import type { CatalogTheme } from '@shared/styles/pwa-themes';

const SKINS: Record<CatalogTheme, React.LazyExoticComponent<React.FC<OrderConfirmedPageProps>>> = {
  'luxury-minimalism': lazy(() => import('./skins/luxury-minimalism')),
  'neo-luxury': lazy(() => import('./skins/neo-luxury')),
  'modern-minimalism': lazy(() => import('./skins/modern-minimalism')),
};

export default function OrderConfirmedPage() {
  const { theme } = useTheme();
  const Skin = SKINS[theme] ?? SKINS['modern-minimalism'];
  const props = useOrderConfirmedPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <Skin {...props} />
    </Suspense>
  );
}
