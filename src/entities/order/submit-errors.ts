/**
 * Traducción de los rechazos de `POST` de pedido a texto para quien compra.
 *
 * La API responde `{ error, code }`. El `error` es para depurar (y viene en inglés): nunca se
 * muestra. Lo que ve la persona sale de este mapa por `code`; un código desconocido o ausente
 * cae en el mensaje genérico. Así un texto nuevo o crudo de la API no llega a la interfaz.
 */
import type { components, operations } from '@generated/catalog';
import { ApiError } from '@shared/lib/api';

/**
 * Códigos que el contrato declara para `createOrder`: los del 422 de regla de negocio y el del
 * 409 (el negocio no puede recibir pedidos). Salen de los tipos generados, así que un código
 * nuevo en el contrato rompe `tsc` hasta que tenga su mensaje acá.
 */
export type OrderSubmitErrorCode =
  | components['schemas']['OrderValidationErrorResponse']['code']
  | operations['createOrder']['responses'][409]['content']['application/json']['code'];

/** Paso del checkout Directo al que conviene volver para corregir. */
export type OrderSubmitErrorStep = 'delivery';

/** Campo del formulario que el rechazo señala, para marcarlo además del mensaje general. */
export type OrderSubmitErrorField = 'deliveryAddress' | 'phone';

export interface OrderSubmitErrorInfo {
  message: string;
  /** Presente cuando lo que hay que cambiar está en el paso "Entrega y pago". */
  step?: OrderSubmitErrorStep;
  field?: OrderSubmitErrorField;
}

export const ORDER_SUBMIT_ERRORS: Readonly<Record<OrderSubmitErrorCode, OrderSubmitErrorInfo>> = {
  PAYMENT_OPTION_UNAVAILABLE: {
    message: 'Esa forma de pago ya no está disponible. Elegí otra.',
    step: 'delivery',
  },
  FULFILLMENT_UNAVAILABLE: {
    message: 'Esa forma de entrega ya no está disponible. Elegí otra.',
    step: 'delivery',
  },
  PAYMENT_SETTINGS_MISSING: {
    message:
      'El negocio todavía no terminó de configurar sus datos de pago. Elegí otra forma de pago o probá más tarde.',
    step: 'delivery',
  },
  DELIVERY_ADDRESS_REQUIRED: {
    message: 'Falta la dirección de entrega. Completala para continuar.',
    step: 'delivery',
    field: 'deliveryAddress',
  },
  INVALID_PHONE: {
    message: 'El teléfono no es válido. Revisalo e intentá de nuevo.',
    step: 'delivery',
    field: 'phone',
  },
  PRODUCT_UNAVAILABLE: {
    message: 'Uno de los productos de tu pedido ya no está disponible. Revisá tu carrito e intentá de nuevo.',
  },
  ORDER_INVALID: {
    message: 'Hay datos del pedido que no pudimos validar. Revisalos e intentá de nuevo.',
  },
  MERCHANT_SETUP_INCOMPLETE: {
    message: 'Este negocio no está recibiendo pedidos en este momento. Probá más tarde o contactalo directamente.',
  },
};

export const ORDER_SUBMIT_FALLBACK_MESSAGE = 'No se pudo enviar el pedido. Intentá nuevamente.';

export function isOrderSubmitErrorCode(code: string): code is OrderSubmitErrorCode {
  return Object.prototype.hasOwnProperty.call(ORDER_SUBMIT_ERRORS, code);
}

/** Nunca devuelve el texto de la API: o un mensaje del mapa, o el genérico. */
export function orderSubmitErrorInfo(err: unknown): OrderSubmitErrorInfo {
  if (err instanceof ApiError && err.status < 500 && err.code && isOrderSubmitErrorCode(err.code)) {
    return ORDER_SUBMIT_ERRORS[err.code];
  }
  return { message: ORDER_SUBMIT_FALLBACK_MESSAGE };
}
