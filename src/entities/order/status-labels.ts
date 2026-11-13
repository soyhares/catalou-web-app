/**
 * Rótulos de estado del pedido que ve el cliente final (SPEC-023 FR-018, data-model.md).
 * Fuente única para la PWA: cuenta, seguimiento y cualquier vista nueva los toman de acá.
 *
 * Se tipan como `string` a propósito: la API puede sumar estados antes de que este archivo
 * los conozca, y un valor desconocido muestra el rótulo de respaldo en vez del código crudo.
 */
export type OrderFulfillmentType = 'DELIVERY' | 'PICKUP';

export const ORDER_STATUS_LABELS: Readonly<Record<string, string>> = {
  PENDING: 'Recibido',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  SHIPPED: 'Enviado',
  COMPLETED: 'Entregado',
  CANCELLED: 'Cancelado',
  ASSOCIATION_CONFIRMED: 'Aprobado por asociación',
};

/** `SHIPPED` en un pedido para retirar: el negocio lo dejó listo, no lo envió. */
export const ORDER_SHIPPED_PICKUP_LABEL = 'Listo para retirar';

/** Para cualquier estado que la PWA todavía no conoce. Nunca se muestra el código interno. */
export const ORDER_STATUS_FALLBACK_LABEL = 'En proceso';

export function orderStatusLabel(
  status: string | null | undefined,
  fulfillmentType?: OrderFulfillmentType | string | null,
): string {
  if (!status) return ORDER_STATUS_FALLBACK_LABEL;
  if (status === 'SHIPPED' && fulfillmentType === 'PICKUP') return ORDER_SHIPPED_PICKUP_LABEL;
  return Object.prototype.hasOwnProperty.call(ORDER_STATUS_LABELS, status)
    ? ORDER_STATUS_LABELS[status]
    : ORDER_STATUS_FALLBACK_LABEL;
}
