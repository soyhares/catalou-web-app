import { lazy, Suspense } from 'react';
import { useProductPage } from './useProductPage';

const ProductSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function ProductPage() {
  const props = useProductPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <ProductSkin {...props} />
    </Suspense>
  );
}
