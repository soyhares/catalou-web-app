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

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { load, retry };
}
