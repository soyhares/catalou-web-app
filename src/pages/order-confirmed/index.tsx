import { lazy, Suspense } from 'react';
import { useBranding } from '@app/BrandingContext';
import { AccountOffer } from '@features/account-offer';
import { useOrderConfirmedPage } from './useOrderConfirmedPage';

const OrderConfirmedSkin = lazy(() => import('./skins/luxury-minimalism'));

export default function OrderConfirmedPage() {
  const props = useOrderConfirmedPage();
  const { slug } = useBranding();

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--pwa-bg)' }} />}>
      <OrderConfirmedSkin {...props} />
      {/* SPEC-022: offered only once the order is already confirmed, never as part of it */}
      <AccountOffer slug={slug} orderId={props.orderId} email={props.email} />
    </Suspense>
  );
}
