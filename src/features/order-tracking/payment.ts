import { formatPrice } from '@shared/lib/formatPrice';
import type { OrderTrackingAmounts, OrderTrackingPayment } from '@entities/order/tracking-api';

/**
 * Montos de la tarjeta de pago según D53 / FR-032.
 *
 * La API ya filtra por `showPrices`: con precios ocultos `total`, `adjustment` y `reason`
 * llegan en null. La PWA no decide nada sobre precios; solo dibuja lo que le llega:
 * - total sin ajuste: una fila "Total".
 * - total con monto acordado distinto: total, ajuste con motivo y monto acordado.
 * - solo monto acordado (precios ocultos): una fila "Monto acordado".
 * - nada: ninguna fila (el negocio todavía no fijó el monto).
 */

export type AmountRowKind = 'total' | 'adjustment' | 'agreed';

export interface AmountRow {
  kind: AmountRowKind;
  label: string;
  value: string;
  /** La fila que dice cuánto hay que pagar va resaltada. */
  emphasis: boolean;
}

function present(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

function currencyOf(amounts: OrderTrackingAmounts | undefined): 'USD' | 'CRC' {
  return amounts?.currency === 'USD' ? 'USD' : 'CRC';
}

export function formatSignedAmount(value: number, currency: 'USD' | 'CRC'): string {
  if (value < 0) return `-${formatPrice(Math.abs(value), currency)}`;
  return `+${formatPrice(value, currency)}`;
}

export function paymentAmountRows(amounts: OrderTrackingAmounts | undefined): AmountRow[] {
  if (!amounts) return [];
  const currency = currencyOf(amounts);
  const { total, amountToCharge, adjustment, reason } = amounts;

  if (present(total)) {
    if (present(amountToCharge) && amountToCharge !== total) {
      const delta = present(adjustment) ? adjustment : amountToCharge - total;
      const trimmedReason = reason?.trim();
      return [
        { kind: 'total', label: 'Total del pedido', value: formatPrice(total, currency), emphasis: false },
        {
          kind: 'adjustment',
          label: trimmedReason ? `Ajuste: ${trimmedReason}` : 'Ajuste',
          value: formatSignedAmount(delta, currency),
          emphasis: false,
        },
        { kind: 'agreed', label: 'Monto acordado', value: formatPrice(amountToCharge, currency), emphasis: true },
      ];
    }
    return [{ kind: 'total', label: 'Total', value: formatPrice(total, currency), emphasis: true }];
  }

  if (present(amountToCharge)) {
    return [{ kind: 'agreed', label: 'Monto acordado', value: formatPrice(amountToCharge, currency), emphasis: true }];
  }
  return [];
}

/** El total para el aterrizaje en Recibido: solo si la API lo mandó (FR-013). */
export function landingTotal(amounts: OrderTrackingAmounts | undefined): string | null {
  if (!amounts) return null;
  const value = present(amounts.amountToCharge) ? amounts.amountToCharge : amounts.total;
  return present(value) ? formatPrice(value, currencyOf(amounts)) : null;
}

const METHOD_LABELS: Readonly<Record<OrderTrackingPayment['method'], string>> = {
  SINPE_MOVIL: 'SINPE Móvil',
  BANK_TRANSFER: 'Transferencia bancaria',
  CASH: 'Efectivo',
};

const TIMING_LABELS: Readonly<Record<OrderTrackingPayment['timing'], string>> = {
  UPFRONT: 'por adelantado',
  ON_DELIVERY: 'al recibir',
};

export function paymentSummary(payment: OrderTrackingPayment): string {
  return `${METHOD_LABELS[payment.method] ?? 'Pago'}, ${TIMING_LABELS[payment.timing] ?? ''}`.replace(/, $/, '');
}

export function paymentStatusLabel(status: OrderTrackingPayment['status']): string {
  return status === 'VERIFIED' ? 'Recibido' : 'Pendiente';
}

export function fulfillmentLabel(fulfillmentType: string): string {
  return fulfillmentType === 'PICKUP' ? 'Retiro en el local' : 'Envío a domicilio';
}

/** Número de SINPE como "8765 4321"; si no son 8 dígitos se muestra tal cual. */
export function formatSinpePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.length === 11 && digits.startsWith('506') ? digits.slice(3) : digits;
  return local.length === 8 ? `${local.slice(0, 4)} ${local.slice(4)}` : phone;
}

/** Valor que se copia: solo dígitos locales, que es lo que pide la app del banco. */
export function sinpeCopyValue(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('506') ? digits.slice(3) : digits;
}

/** IBAN en grupos de 4 (R9). Se copia sin espacios. */
export function formatIban(iban: string): string {
  return iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
}
