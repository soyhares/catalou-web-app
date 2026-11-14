import type { OrderTracking } from '@entities/order/tracking-api';
import { ApiError } from '@shared/lib/api';

/**
 * Estados de la valoración (SPEC-023 US6, FR-037, FR-038).
 * - `form`: entregado, sin valorar y dentro de los 30 días.
 * - `not-delivered`: el pedido todavía no se entregó (o se canceló).
 * - `already-reviewed`: ya tiene valoración; no se edita.
 * - `expired`: pasaron más de 30 días desde la entrega.
 * - `sent`: se acaba de enviar.
 */
export type ReviewScreenState = 'form' | 'not-delivered' | 'already-reviewed' | 'expired' | 'sent';

export const REVIEW_COMMENT_MAX = 1000;

export function reviewStateFromTracking(tracking: Pick<OrderTracking, 'status' | 'reviewable' | 'reviewed'>): ReviewScreenState {
  if (tracking.reviewed) return 'already-reviewed';
  if (tracking.status !== 'COMPLETED') return 'not-delivered';
  return tracking.reviewable ? 'form' : 'expired';
}

export type ReviewSubmitFailure =
  | { kind: 'state'; state: ReviewScreenState }
  | { kind: 'not-found' }
  | { kind: 'message'; message: string };

/** Traduce el error del POST a lo que ve la persona. Nunca muestra códigos internos. */
export function reviewFailureFromError(err: unknown): ReviewSubmitFailure {
  if (err instanceof ApiError) {
    if (err.status === 409) return { kind: 'state', state: 'already-reviewed' };
    if (err.status === 422 && err.code === 'REVIEW_WINDOW_CLOSED') return { kind: 'state', state: 'expired' };
    if (err.status === 422 && err.code === 'ORDER_NOT_DELIVERED') return { kind: 'state', state: 'not-delivered' };
    if (err.status === 404) return { kind: 'not-found' };
    if (err.status === 429) {
      return { kind: 'message', message: 'Hiciste muchos intentos seguidos. Esperá unos minutos e intentá de nuevo.' };
    }
    if (err.status === 422) {
      return { kind: 'message', message: 'Revisá la valoración: elegí de 1 a 5 estrellas y un comentario de hasta 1000 caracteres.' };
    }
  }
  return { kind: 'message', message: 'No pudimos enviar tu valoración. Revisá tu conexión e intentá de nuevo.' };
}

/** Cuerpo del POST: estrellas enteras de 1 a 5 y el comentario solo si dice algo. */
export function buildReviewRequest(rating: number, comment: string): { rating: number; comment?: string } | null {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  const trimmed = comment.trim().slice(0, REVIEW_COMMENT_MAX);
  return trimmed ? { rating, comment: trimmed } : { rating };
}
