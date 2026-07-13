import { lazy, Suspense } from 'react';
import { useCatalogPage } from './useCatalogPage';

const CatalogSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function CatalogPage() {
  const props = useCatalogPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <CatalogSkin {...props} />
    </Suspense>
  );
}
