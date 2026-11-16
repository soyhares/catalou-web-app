import { useEffect, useState } from 'react';
import type { TrackingFreshness } from './useOrderTracking';
import { FRESHNESS_TICK_MS, freshnessLabel } from './freshness';

/**
 * "Se actualiza solo": avisa que la página consulta sola mientras el pedido está abierto
 * (`useOrderTracking`). Discreto a propósito: acompaña al encabezado del estado, no compite.
 *
 * - Punto con un anillo que se expande en el acento del negocio (único bucle de la página, y
 *   solo con `motion-safe:`; sin movimiento queda el punto quieto).
 * - Durante una consulta el punto se realza apenas (anillo fijo), sin spinner.
 * - Si el último refresco falló: "Reintentando…", en el mismo tono, sin rojo ni alarma.
 *
 * No es región aria-live: cambia cada 30 s y sería ruido. El cambio de estado del pedido ya se
 * anuncia aparte (`useTrackingChange`).
 */
export function LiveIndicator({
  freshness,
  align = 'start',
}: {
  freshness: TrackingFreshness;
  align?: 'start' | 'center';
}) {
  const now = useNow(FRESHNESS_TICK_MS);
  const { lastUpdatedAt, isRefreshing, lastRefreshFailed } = freshness;
  const detail = freshnessLabel(lastUpdatedAt, now);

  return (
    <div
      data-testid="live-indicator"
      aria-busy={isRefreshing || undefined}
      className={`flex items-center gap-2.5 font-[family-name:var(--pwa-font-body)] ${align === 'center' ? 'justify-center' : ''}`}
    >
      <span aria-hidden="true" className="relative flex h-2.5 w-2.5 flex-none items-center justify-center">
        {!lastRefreshFailed && (
          <span className="absolute inset-0 rounded-full bg-[var(--pwa-accent)] opacity-0 motion-safe:animate-live-ping" />
        )}
        <span
          className={`relative h-2 w-2 rounded-full transition-[box-shadow,background-color] duration-300 ${
            lastRefreshFailed
              ? 'bg-[color:color-mix(in_srgb,var(--pwa-text)_45%,var(--pwa-bg))]'
              : 'bg-[var(--pwa-accent)]'
          } ${isRefreshing ? 'shadow-[0_0_0_3px_color-mix(in_srgb,var(--pwa-accent)_30%,transparent)]' : ''}`}
        />
      </span>
      <span className={`flex flex-col leading-tight ${align === 'center' ? 'items-center' : ''}`}>
        <span className="text-[12px] font-bold tracking-[0.01em] text-[var(--pwa-text)]">
          {lastRefreshFailed ? 'Reintentando…' : 'Se actualiza solo'}
        </span>
        {detail && (
          <span className="text-[11px] text-[color:color-mix(in_srgb,var(--pwa-text)_72%,var(--pwa-bg))]">{detail}</span>
        )}
      </span>
    </div>
  );
}

/** La hora actual, recalculada cada `tickMs`. */
function useNow(tickMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(timer);
  }, [tickMs]);
  return now;
}
