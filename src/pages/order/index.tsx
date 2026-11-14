import { useLocation, useParams } from 'react-router-dom';
import { useBranding } from '@app/BrandingContext';
import { AccountOffer } from '@features/account-offer';
import { OrderTrackingScreen, useOrderTracking } from '@features/order-tracking';

/**
 * SPEC-023 (T076): `/pedido/:token`, fuera de `OrdersGuard` (FR-034: el seguimiento sigue en
 * solo lectura aunque el negocio apague Pedidos).
 *
 * El checkout llega acá con `{ orderId, email }` en el state de la navegación (T075, RV-7):
 * con eso se ancla el ofrecimiento de cuenta, como antes en `/order-confirmed`. Abierto desde
 * un enlace no hay state y el ofrecimiento no aparece.
 */
export default function OrderTrackingPage() {
  const { token = '' } = useParams<{ token: string }>();
  const { slug } = useBranding();
  const location = useLocation();
  const state = location.state as { orderId?: string; email?: string } | null;
  const { load, retry } = useOrderTracking(slug, token);

  return (
    <>
      <OrderTrackingScreen load={load} onRetry={retry} reviewPath={`/pedido/${encodeURIComponent(token)}/valoracion`} />
      {load.kind === 'ready' && (
        <AccountOffer slug={slug} orderId={state?.orderId ?? null} email={state?.email ?? null} />
      )}
    </>
  );
}
