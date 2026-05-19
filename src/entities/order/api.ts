import { publicFetch } from '@shared/lib/api';

export type OrderType = 'DIRECT' | 'FINANCED';
export type OrderStatus = 'PENDING';

export interface SubmitOrderItem {
  productId: string;
  variantValueId: string | null;
  quantity: number;
}

export interface SubmitOrderInput {
  orderType: OrderType;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  deliveryAddress: string;
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

export async function submitOrder(
  slug: string,
  input: SubmitOrderInput,
): Promise<OrderConfirmation> {
  return publicFetch<OrderConfirmation>(`/catalog/${slug}/orders`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
