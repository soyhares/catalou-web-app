import type { components } from '@generated/catalog';

// SPEC-023 (T074, FR-011, FR-012): reglas puras del paso "Entrega y pago" del checkout
// Directo. Viven fuera del hook para poder probarlas sin React y para que la skin solo
// pinte lo que estas funciones deciden.

export type CheckoutOptions = components['schemas']['CheckoutOptions'];
export type FulfillmentType = CheckoutOptions['fulfillmentTypes'][number];
export type PaymentTiming = CheckoutOptions['paymentTimings'][number];
export type PaymentMethod = CheckoutOptions['paymentMethods'][number]['method'];

export interface DeliveryPaymentSelection {
  fulfillmentType: FulfillmentType | null;
  paymentTiming: PaymentTiming | null;
  paymentMethod: PaymentMethod | null;
}

export const EMPTY_SELECTION: DeliveryPaymentSelection = {
  fulfillmentType: null,
  paymentTiming: null,
  paymentMethod: null,
};

// Orden fijo de presentación: no depende del orden en que la API mande las opciones.
const FULFILLMENT_ORDER: FulfillmentType[] = ['DELIVERY', 'PICKUP'];
const TIMING_ORDER: PaymentTiming[] = ['UPFRONT', 'ON_DELIVERY'];
const METHOD_ORDER: PaymentMethod[] = ['SINPE_MOVIL', 'BANK_TRANSFER', 'CASH'];

export function availableFulfillmentTypes(options: CheckoutOptions): FulfillmentType[] {
  return FULFILLMENT_ORDER.filter((f) => options.fulfillmentTypes.includes(f));
}

/** Métodos válidos para un momento: solo los pares que el negocio declaró. */
export function availableMethods(options: CheckoutOptions, timing: PaymentTiming | null): PaymentMethod[] {
  if (!timing || !options.paymentTimings.includes(timing)) return [];
  return METHOD_ORDER.filter((m) =>
    options.paymentMethods.some((pm) => pm.method === m && pm.timings.includes(timing)),
  );
}

/** Un momento solo se ofrece si al menos un método lo admite: si no, sería un callejón sin salida. */
export function availableTimings(options: CheckoutOptions): PaymentTiming[] {
  return TIMING_ORDER.filter(
    (t) => options.paymentTimings.includes(t) && availableMethods(options, t).length > 0,
  );
}

/**
 * Descarta lo que dejó de ser válido y preselecciona cuando hay una sola opción. Se aplica
 * después de cada cambio: elegir otro momento puede dejar sin efecto el método (Efectivo
 * solo existe al recibir o retirar).
 */
export function reconcileSelection(
  options: CheckoutOptions,
  selection: DeliveryPaymentSelection,
): DeliveryPaymentSelection {
  const fulfillments = availableFulfillmentTypes(options);
  let fulfillmentType =
    selection.fulfillmentType && fulfillments.includes(selection.fulfillmentType)
      ? selection.fulfillmentType
      : null;
  if (!fulfillmentType && fulfillments.length === 1) fulfillmentType = fulfillments[0];

  const timings = availableTimings(options);
  let paymentTiming =
    selection.paymentTiming && timings.includes(selection.paymentTiming) ? selection.paymentTiming : null;
  if (!paymentTiming && timings.length === 1) paymentTiming = timings[0];

  const methods = availableMethods(options, paymentTiming);
  let paymentMethod =
    selection.paymentMethod && methods.includes(selection.paymentMethod) ? selection.paymentMethod : null;
  if (!paymentMethod && methods.length === 1) paymentMethod = methods[0];

  return { fulfillmentType, paymentTiming, paymentMethod };
}

/* ── Teléfono de Costa Rica (FR-012) ─────────────────────────────────────── */

/**
 * Deja solo los 8 dígitos locales. Acepta lo que traiga el autocompletado o un pegado
 * ("+506 8888-1234", "50688881234", "8888 1234"): el prefijo +506 es fijo y visible aparte.
 */
export function normalizeCrPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length > 8 && digits.startsWith('506')) digits = digits.slice(3);
  return digits.slice(0, 8);
}

export function isValidCrPhone(digits: string): boolean {
  return /^\d{8}$/.test(digits);
}

export function toCrE164(digits: string): string {
  return `+506${digits}`;
}

/* ── Validación del paso ─────────────────────────────────────────────────── */

export type DeliveryPaymentField =
  | 'fulfillmentType'
  | 'paymentTiming'
  | 'paymentMethod'
  | 'deliveryAddress'
  | 'phone';

export function validateDeliveryPayment(input: {
  options: CheckoutOptions | null;
  selection: DeliveryPaymentSelection;
  deliveryAddress: string;
  phoneDigits: string;
}): Partial<Record<DeliveryPaymentField, string>> {
  const { options, selection, deliveryAddress, phoneDigits } = input;
  const errors: Partial<Record<DeliveryPaymentField, string>> = {};

  if (!isValidCrPhone(phoneDigits)) {
    errors.phone = 'Escribí tu número de WhatsApp de 8 dígitos.';
  }

  // Sin opciones (API anterior a SPEC-023) el pedido sale como antes: la dirección se pide
  // siempre y el servidor no espera entrega ni pago.
  if (!options) {
    if (!deliveryAddress.trim()) errors.deliveryAddress = 'Escribí la dirección de entrega.';
    return errors;
  }

  const fulfillments = availableFulfillmentTypes(options);
  if (!selection.fulfillmentType || !fulfillments.includes(selection.fulfillmentType)) {
    errors.fulfillmentType = 'Elegí cómo lo recibís.';
  }
  if (selection.fulfillmentType === 'DELIVERY' && !deliveryAddress.trim()) {
    errors.deliveryAddress = 'Escribí la dirección de entrega.';
  }
  if (!selection.paymentTiming || !availableTimings(options).includes(selection.paymentTiming)) {
    errors.paymentTiming = 'Elegí cuándo pagás.';
  } else if (
    !selection.paymentMethod ||
    !availableMethods(options, selection.paymentTiming).includes(selection.paymentMethod)
  ) {
    errors.paymentMethod = 'Elegí cómo pagás.';
  }
  return errors;
}

/* ── Textos ──────────────────────────────────────────────────────────────── */

export const FULFILLMENT_LABELS: Record<FulfillmentType, string> = {
  DELIVERY: 'Envío',
  PICKUP: 'Retiro en el local',
};

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  SINPE_MOVIL: 'SINPE Móvil',
  BANK_TRANSFER: 'Transferencia (IBAN)',
  CASH: 'Efectivo',
};

export function timingLabel(
  timing: PaymentTiming,
  fulfillment: FulfillmentType | null,
): { label: string; hint: string } {
  if (timing === 'UPFRONT') return { label: 'Ahora', hint: 'Por adelantado' };
  if (fulfillment === 'DELIVERY') return { label: 'Al recibir', hint: 'Contra entrega' };
  if (fulfillment === 'PICKUP') return { label: 'Al retirar', hint: 'En el local' };
  return { label: 'Al recibir o retirar', hint: '' };
}

/* ── Destino tras crear el pedido (T075) ─────────────────────────────────── */

/**
 * Un pedido Directo aterriza en su página de seguimiento. FINANCED, o una API que todavía
 * no manda token, sigue en la confirmación de siempre.
 */
export function confirmationDestination(confirmation: {
  orderType: 'DIRECT' | 'FINANCED';
  trackingToken?: string | null;
}): { kind: 'tracking'; path: string } | { kind: 'legacy'; path: '/order-confirmed' } {
  if (confirmation.orderType === 'DIRECT' && confirmation.trackingToken) {
    return { kind: 'tracking', path: `/pedido/${encodeURIComponent(confirmation.trackingToken)}` };
  }
  return { kind: 'legacy', path: '/order-confirmed' };
}
