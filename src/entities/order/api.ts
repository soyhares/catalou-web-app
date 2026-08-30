import { publicFetch } from '@shared/lib/api';
import { getAccessToken } from '@shared/lib/customer-session';

export type OrderType = 'DIRECT' | 'FINANCED';
export type OrderStatus = 'PENDING';

export interface SubmitOrderItem {
  productId: string;
  // one value per variant type of the product; [] when it has none
  variantValueIds: string[];
  quantity: number;
  // free-text note the shopper wrote for this product (SPEC-021); omit when none
  customerNote?: string;
}

export interface SubmitOrderInput {
  orderType: OrderType;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  deliveryAddress: string;
  affiliateNumber?: string;
  items: SubmitOrderItem[];
}

export interface OrderConfirmation {
  orderId: string;
  orderType: OrderType;
  status: OrderStatus;
}

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
