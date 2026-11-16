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

/** Qué tan fresco está lo que se ve. La pantalla muestra `lastUpdatedAt` como "Última actualización". */
export interface TrackingFreshness {
  /** `Date.now()` de la última respuesta buena (carga o refresco); null antes de la primera. */
  lastUpdatedAt: number | null;
  /** Hay un refresco silencioso en curso. La carga inicial no cuenta: esa ya tiene su esqueleto. */
  isRefreshing: boolean;
  /** El último refresco falló; se vuelve a intentar en el próximo ciclo. */
  lastRefreshFailed: boolean;
}

/** Cada cuánto se refresca solo mientras la página está visible. 60 s = 60 consultas por hora,
 * la mitad del límite por IP del endpoint (120/h). */
export const TRACKING_REFRESH_MS = 60_000;
const FINAL_STATUSES = new Set(['COMPLETED', 'CANCELLED']);

/** COMPLETED y CANCELLED: el pedido ya no cambia y la página deja de consultar. */
export function isFinalOrderStatus(status: string): boolean {
  return FINAL_STATUSES.has(status);
}

export function useOrderTracking(
  slug: string,
  token: string,
): { load: OrderTrackingLoad; retry: () => void } & TrackingFreshness {
  const [load, setLoad] = useState<OrderTrackingLoad>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshFailed, setLastRefreshFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!slug || !token) {
      setLoad({ kind: 'not-found' });
      return;
    }
    setLoad({ kind: 'loading' });
    getOrderTracking(slug, token)
      .then((data) => {
        if (cancelled) return;
        setLoad({ kind: 'ready', data });
        setLastUpdatedAt(Date.now());
        setLastRefreshFailed(false);
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
    if (!status || isFinalOrderStatus(status)) return;
    let cancelled = false;
    let inFlight = false;
    const refresh = () => {
      if (document.visibilityState !== 'visible' || inFlight) return;
      inFlight = true;
      setIsRefreshing(true);
      getOrderTracking(slug, token, { silent: true })
        .then((data) => {
          if (cancelled) return;
          setLoad({ kind: 'ready', data });
          setLastUpdatedAt(Date.now());
          setLastRefreshFailed(false);
        })
        .catch(() => {
          if (!cancelled) setLastRefreshFailed(true);
        })
        .finally(() => {
          inFlight = false;
          if (!cancelled) setIsRefreshing(false);
        });
    };
    const timer = window.setInterval(refresh, TRACKING_REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      setIsRefreshing(false);
    };
  }, [slug, token, status]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { load, retry, lastUpdatedAt, isRefreshing, lastRefreshFailed };
}
