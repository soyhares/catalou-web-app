import { lazy, Suspense } from 'react';
import { useCheckoutPage } from './useCheckoutPage';

const CheckoutSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function CheckoutPage() {
  const props = useCheckoutPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <CheckoutSkin {...props} />
    </Suspense>
  );
}
