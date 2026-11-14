import { publicFetch } from '@shared/lib/api';
import { getAccessToken } from '@shared/lib/customer-session';
import type { components } from '@generated/catalog';

// SPEC-023: el cuerpo y la respuesta salen del contrato generado. `fulfillmentType`,
// `paymentTiming` y `paymentMethod` son opcionales en la fase 1 y `deliveryAddress` solo
// viaja con envío; la confirmación de un pedido Directo trae `reference` y `trackingToken`.
export type SubmitOrderInput = components['schemas']['CreateOrderRequest'];
export type SubmitOrderItem = SubmitOrderInput['items'][number];
export type OrderType = SubmitOrderInput['orderType'];
export type OrderConfirmation = components['schemas']['OrderConfirmation'];
export type OrderStatus = OrderConfirmation['status'];

export interface OrderSummaryItem {
  productNameSnapshot: string;
  variantSnapshot: string | null;
  customerNote: string | null;
  quantity: number;
  unitPriceSnapshot: number;
}

export interface OrderSummaryForAssociation {
  orderId: string;
  status: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  totalAmount: number;
  alreadyConfirmed: boolean;
  items: OrderSummaryItem[];
}

export async function getOrderByToken(
  slug: string,
  token: string,
): Promise<OrderSummaryForAssociation> {
  return publicFetch<OrderSummaryForAssociation>(
    `/catalog/${slug}/confirm-association?token=${encodeURIComponent(token)}`,
  );
}

export async function confirmAssociation(
  slug: string,
  token: string,
): Promise<{ alreadyConfirmed: boolean }> {
  return publicFetch<{ alreadyConfirmed: boolean }>(
    `/catalog/${slug}/confirm-association`,
    {
      method: 'POST',
      body: JSON.stringify({ token }),
    },
  );
}

export async function rejectAssociation(
  slug: string,
  token: string,
  reason: string,
): Promise<{ rejected: boolean }> {
  return publicFetch<{ rejected: boolean }>(`/catalog/${slug}/reject-association`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, reason }),
  });
}

export async function submitOrder(
  slug: string,
  input: SubmitOrderInput,
): Promise<OrderConfirmation> {
  // SPEC-022: si hay sesión de cliente en este negocio, el pedido va firmado y nace asociado
  // a su cuenta. Sin sesión sale igual: pedir como invitado es un camino de primera clase.
  // El correo del formulario nunca alcanza para asociar, justamente porque no está verificado.
  const token = await getAccessToken(slug).catch(() => null);

  return publicFetch<OrderConfirmation>(`/catalog/${slug}/orders`, {
    method: 'POST',
    body: JSON.stringify(input),
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });
}
