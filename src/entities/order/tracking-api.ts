import { publicFetch } from '@shared/lib/api';
import type { components } from '@generated/catalog';

/**
 * SPEC-023 (T076, T077): seguimiento y valoración del pedido Directo por token.
 *
 * Público y sin sesión: el portador del enlace es quien accede (ADR-033 §5). El 404 es el mismo
 * para un token inexistente, vencido o de otro negocio (FR-033), así que la PWA tampoco los
 * distingue. El service worker no guarda estas respuestas (`vite.config.ts`, FR-035).
 */

export type OrderTracking = components['schemas']['OrderTracking'];
export type OrderTrackingStatus = OrderTracking['status'];
export type OrderTrackingAmounts = NonNullable<OrderTracking['amounts']>;
export type OrderTrackingPayment = OrderTracking['payment'];
export type PaymentInstructions = components['schemas']['PaymentInstructions'];
export type CreateOrderReviewRequest = components['schemas']['CreateOrderReviewRequest'];

function trackPath(slug: string, token: string): string {
  return `/catalog/${encodeURIComponent(slug)}/orders/track/${encodeURIComponent(token)}`;
}

export async function getOrderTracking(slug: string, token: string): Promise<OrderTracking> {
  return publicFetch<OrderTracking>(trackPath(slug, token));
}

/** 201 sin cuerpo. 409 `REVIEW_ALREADY_EXISTS`; 422 `ORDER_NOT_DELIVERED` o `REVIEW_WINDOW_CLOSED`. */
export async function submitOrderReview(
  slug: string,
  token: string,
  input: CreateOrderReviewRequest,
): Promise<void> {
  await publicFetch<void>(`${trackPath(slug, token)}/review`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Ruta interna (`/pedido/:token`) de una `trackingUrl` absoluta de la API, para navegar sin
 * recargar la PWA. Null si la URL no es de seguimiento.
 */
export function trackingPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { pathname } = new URL(url, 'https://placeholder.invalid');
    return /^\/pedido\/[^/]+\/?$/.test(pathname) ? pathname.replace(/\/$/, '') : null;
  } catch {
    return null;
  }
}
