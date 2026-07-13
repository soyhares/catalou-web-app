import { lazy, Suspense } from 'react';
import { useOrderConfirmedPage } from './useOrderConfirmedPage';

const OrderConfirmedSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function OrderConfirmedPage() {
  const props = useOrderConfirmedPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <OrderConfirmedSkin {...props} />
    </Suspense>
  );
}
