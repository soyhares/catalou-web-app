import { useEffect, useRef, useState } from 'react';
import type { OrderTracking } from '@entities/order/tracking-api';
import { orderStatusLabel } from '@entities/order/status-labels';
import { paymentStatusLabel } from './payment';

export interface TrackingChange {
  /** Sube con cada cambio de estado del pedido; 0 = ninguno (carga inicial). Sirve de `key` para repetir la animación. */
  statusChangeId: number;
  /** Ídem para el estado del pago. */
  paymentChangeId: number;
  /** Texto para la región aria-live; vacío hasta que haya un cambio. */
  announcement: string;
}

const NONE: TrackingChange = { statusChangeId: 0, paymentChangeId: 0, announcement: '' };

/**
 * Detecta si un refresco trajo un estado de pedido o de pago distinto al anterior.
 * La primera lectura (y la que sigue a un 'loading' o un reintento) solo fija la referencia: nunca marca cambio.
 */
export function useTrackingChange(data: OrderTracking | null): TrackingChange {
  const prev = useRef<{ status: string; payment: string } | null>(null);
  const [change, setChange] = useState<TrackingChange>(NONE);

  useEffect(() => {
    if (!data) {
      prev.current = null;
      setChange(NONE);
      return;
    }
    const before = prev.current;
    prev.current = { status: data.status, payment: data.payment.status };
    if (!before) return;
    const statusChanged = before.status !== data.status;
    const paymentChanged = before.payment !== data.payment.status;
    if (!statusChanged && !paymentChanged) return;
    setChange((c) => ({
      statusChangeId: statusChanged ? c.statusChangeId + 1 : c.statusChangeId,
      paymentChangeId: paymentChanged ? c.paymentChangeId + 1 : c.paymentChangeId,
      announcement: statusChanged
        ? `Tu pedido pasó a ${orderStatusLabel(data.status, data.fulfillmentType)}`
        : `Tu pago pasó a ${paymentStatusLabel(data.payment.status)}`,
    }));
  }, [data]);

  return change;
}
