import { orderStatusLabel } from '@entities/order/status-labels';

/**
 * Línea de tiempo del pedido que ve el cliente (SPEC-023 FR-031, FR-046).
 *
 * En preparación y Enviado/Listo para retirar son opcionales (D14): si el pedido ya los pasó
 * sin registrarlos, no se dibujan como pendientes eternos. Los que todavía no llegaron se
 * muestran como próximos. Un pedido cancelado muestra lo que alcanzó a recorrer y termina en
 * Cancelado.
 *
 * Mientras el pedido está abierto, el paso que sigue al actual es el "paso siguiente vivo": lleva
 * `nextNote`, la línea de apoyo que dice de quién depende el avance ("Esperando al negocio").
 */

export type TimelineStepState = 'done' | 'current' | 'upcoming';

export interface TimelineStep {
  status: string;
  label: string;
  /** Fecha ISO del registro, si el paso ocurrió. */
  at: string | null;
  state: TimelineStepState;
  /** Solo en el próximo paso de un pedido abierto: qué se está esperando para llegar a él. */
  nextNote?: string;
}

const FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'COMPLETED'] as const;
const OPTIONAL = new Set<string>(['PREPARING', 'SHIPPED']);

/**
 * Línea de apoyo del paso siguiente, según el estado actual. Hasta Enviado el avance depende del
 * negocio; después, de la entrega o del retiro. Null si el pedido no tiene paso siguiente.
 */
export function nextStepNote(status: string, fulfillmentType: string): string | null {
  if (status === 'SHIPPED') return fulfillmentType === 'PICKUP' ? 'Pendiente de retiro' : 'Pendiente de entrega';
  if (status === 'PENDING' || status === 'CONFIRMED' || status === 'PREPARING') return 'Esperando al negocio';
  return null;
}

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
    // El paso siguiente es el que viene en el flujo, aunque sea opcional: desde Confirmado,
    // En preparación.
    const note = i === currentIndex + 1 ? nextStepNote(status, fulfillmentType) : null;
    return [note ? { ...step(s, 'upcoming'), nextNote: note } : step(s, 'upcoming')];
  });
}
