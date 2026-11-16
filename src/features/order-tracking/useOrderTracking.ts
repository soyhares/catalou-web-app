import { useCallback, useEffect, useState } from 'react';
import { getOrderTracking, type OrderTracking } from '@entities/order/tracking-api';
import { ApiError } from '@shared/lib/api';

export type OrderTrackingLoad =
  | { kind: 'loading' }
  | { kind: 'ready'; data: OrderTracking }
  /** 404: inexistente, vencido o de otro negocio. La PWA no los distingue (FR-033). */
  | { kind: 'not-found' }
  | { kind: 'rate-limited' }
  | { kind: 'error' };

/** Cada cuánto se refresca solo mientras la página está visible. 60 s = 60 consultas por hora,
 * la mitad del límite por IP del endpoint (120/h). */
export const TRACKING_REFRESH_MS = 60_000;
const FINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

export function useOrderTracking(slug: string, token: string): { load: OrderTrackingLoad; retry: () => void } {
  const [load, setLoad] = useState<OrderTrackingLoad>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!slug || !token) {
      setLoad({ kind: 'not-found' });
      return;
    }
    setLoad({ kind: 'loading' });
    getOrderTracking(slug, token)
      .then((data) => {
        if (!cancelled) setLoad({ kind: 'ready', data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setLoad({ kind: 'not-found' });
        else if (err instanceof ApiError && err.status === 429) setLoad({ kind: 'rate-limited' });
        else setLoad({ kind: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [slug, token, attempt]);

  // Refresco silencioso: el cliente ve el estado nuevo sin recargar. Corre cada TRACKING_REFRESH_MS
  // mientras la pestaña está visible y al volver a ella; un fallo deja los datos que ya hay.
  const status = load.kind === 'ready' ? load.data.status : null;
  useEffect(() => {
    if (!status || FINAL_STATUSES.has(status)) return;
    let cancelled = false;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      getOrderTracking(slug, token)
        .then((data) => {
          if (!cancelled) setLoad({ kind: 'ready', data });
        })
        .catch(() => {});
    };
    const timer = window.setInterval(refresh, TRACKING_REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [slug, token, status]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { load, retry };
}
