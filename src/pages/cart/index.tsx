import { lazy, Suspense } from 'react';
import { useCartPage } from './useCartPage';

const CartSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function CartPage() {
  const props = useCartPage();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <CartSkin {...props} />
    </Suspense>
  );
}
