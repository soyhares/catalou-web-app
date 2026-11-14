import { orderStatusLabel } from '@entities/order/status-labels';

/**
 * Línea de tiempo del pedido que ve el cliente (SPEC-023 FR-031, FR-046).
 *
 * En preparación y Enviado/Listo para retirar son opcionales (D14): si el pedido ya los pasó
 * sin registrarlos, no se dibujan como pendientes eternos. Los que todavía no llegaron se
 * muestran como próximos. Un pedido cancelado muestra lo que alcanzó a recorrer y termina en
 * Cancelado.
 */

export type TimelineStepState = 'done' | 'current' | 'upcoming';

export interface TimelineStep {
  status: string;
  label: string;
  /** Fecha ISO del registro, si el paso ocurrió. */
  at: string | null;
  state: TimelineStepState;
}

const FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'COMPLETED'] as const;
const OPTIONAL = new Set<string>(['PREPARING', 'SHIPPED']);

export function buildTrackingTimeline(
  status: string,
  timeline: ReadonlyArray<{ status: string; at: string }>,
  fulfillmentType: string,
): TimelineStep[] {
  // Último registro de cada estado (un estado puede repetirse si se revirtió algo).
  const reachedAt = new Map<string, string>();
  for (const entry of timeline) reachedAt.set(entry.status, entry.at);

  const step = (s: string, state: TimelineStepState): TimelineStep => ({
    status: s,
    label: orderStatusLabel(s, fulfillmentType),
    at: reachedAt.get(s) ?? null,
    state,
  });

  if (status === 'CANCELLED') {
    const reached = FLOW.filter((s) => reachedAt.has(s) || s === 'PENDING');
    return [...reached.map((s) => step(s, 'done')), step('CANCELLED', 'current')];
  }

  const currentIndex = FLOW.indexOf(status as (typeof FLOW)[number]);
  if (currentIndex === -1) {
    // Estado que la PWA no conoce: se muestra solo, con el rótulo de respaldo.
    return [step(status, 'current')];
  }

  return FLOW.flatMap((s, i): TimelineStep[] => {
    if (i < currentIndex) {
      if (OPTIONAL.has(s) && !reachedAt.has(s)) return [];
      return [step(s, 'done')];
    }
    if (i === currentIndex) return [step(s, 'current')];
    return [step(s, 'upcoming')];
  });
}
