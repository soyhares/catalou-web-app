import type { components } from '@generated/catalog';
import { formatPrice } from './formatPrice';

const WA_BASE_URL = 'https://wa.me/';

/**
 * Builds a `wa.me` deep link with a prefilled message. Pure: no I/O, no await, so the caller
 * can build it while rendering and the tap opens WhatsApp synchronously (iOS blocks
 * navigations that follow an await as popups).
 *
 * `phoneE164Digits` is the number in E.164 without the `+` (e.g. `50688001234`). Any
 * non-digit character is dropped, since `wa.me` only accepts digits.
 */
export function buildWaLink(phoneE164Digits: string, text: string): string {
  const digits = phoneE164Digits.replace(/\D/g, '');
  return `${WA_BASE_URL}${digits}?text=${encodeURIComponent(text)}`;
}

/* ── Aviso del cliente al negocio (SPEC-023, FR-016) ─────────────────────────────────── */


/** Datos que entrega la API, ya filtrados por `showPrices` (R7). Nunca null acá. */
export type MerchantNotice = NonNullable<components['schemas']['MerchantNoticeData']>;

const PAYMENT_METHOD_PHRASES: Readonly<Record<MerchantNotice['paymentMethod'], string>> = {
  SINPE_MOVIL: 'Pago por SINPE Móvil',
  BANK_TRANSFER: 'Pago por transferencia bancaria',
  CASH: 'Pago en efectivo',
};

const PAYMENT_TIMING_PHRASES: Readonly<Record<MerchantNotice['paymentTiming'], string>> = {
  UPFRONT: 'por adelantado',
  ON_DELIVERY: 'al recibir',
};

const FULFILLMENT_PHRASES: Readonly<Record<MerchantNotice['fulfillmentType'], string>> = {
  DELIVERY: 'Envío a domicilio.',
  PICKUP: 'Retiro en el local.',
};

/**
 * Texto que el cliente le manda al negocio al cerrar el pedido (as-is-to-be §4.4, FR-016).
 *
 * Copy de Catalou: voseo, sin emojis ni guion largo (`design/copy_and_iconography.md` §2).
 * El total va solo si la API lo mandó (precios visibles). Nunca lleva enlaces al panel ni los
 * datos de cuenta del propio negocio: el negocio busca la referencia en su lista.
 */
export function buildMerchantNoticeMessage(notice: MerchantNotice): string {
  const greeting =
    `Hola, ${notice.businessName}. Soy ${notice.customerName} y acabo de hacer el pedido ` +
    `${notice.reference} en tu catálogo.`;

  const details: string[] = [];
  if (notice.total !== null && notice.total !== undefined) {
    const currency = notice.currency === 'USD' ? 'USD' : 'CRC';
    details.push(`Total: ${formatPrice(notice.total, currency)}`);
  }
  details.push(FULFILLMENT_PHRASES[notice.fulfillmentType]);

  let payment = `${PAYMENT_METHOD_PHRASES[notice.paymentMethod]}, ${PAYMENT_TIMING_PHRASES[notice.paymentTiming]}.`;
  // El comprobante solo existe cuando se paga antes y no en efectivo.
  if (notice.paymentTiming === 'UPFRONT' && notice.paymentMethod !== 'CASH') {
    payment += ' Te mando el comprobante por acá.';
  }
  details.push(payment);

  return `${greeting}\n\n${details.join('\n')}`;
}

/**
 * Enlace `wa.me` del aviso al negocio, o null si el negocio no tiene un WhatsApp válido
 * (R8: el botón se deshabilita con explicación). Puro: se arma al renderizar.
 */
export function buildMerchantNoticeLink(
  notice: MerchantNotice,
  fallbackPhoneE164?: string | null,
): string | null {
  const phone = notice.merchantWhatsappE164 ?? fallbackPhoneE164 ?? null;
  if (!phone || !/\d/.test(phone)) return null;
  return buildWaLink(phone, buildMerchantNoticeMessage(notice));
}

/** Mensaje libre al negocio desde el seguimiento ("Escribirle al negocio"). */
export function buildOrderInquiryMessage(businessName: string, reference: string): string {
  return `Hola, ${businessName}. Te escribo por el pedido ${reference}.`;
}
