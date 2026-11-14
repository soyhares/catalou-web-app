import { describe, expect, it } from 'vitest';
import { ApiError } from '@shared/lib/api';
import {
  ORDER_SUBMIT_ERRORS,
  ORDER_SUBMIT_FALLBACK_MESSAGE,
  orderSubmitErrorInfo,
} from './submit-errors';

describe('orderSubmitErrorInfo', () => {
  it('traduce PAYMENT_OPTION_UNAVAILABLE y vuelve al paso de entrega y pago', () => {
    const info = orderSubmitErrorInfo(new ApiError(422, 'Payment option not available', 'PAYMENT_OPTION_UNAVAILABLE'));
    expect(info).toEqual({ message: 'Esa forma de pago ya no está disponible. Elegí otra.', step: 'delivery' });
  });

  it('FULFILLMENT_UNAVAILABLE también vuelve al paso de entrega y pago', () => {
    expect(orderSubmitErrorInfo(new ApiError(422, 'x', 'FULFILLMENT_UNAVAILABLE')).step).toBe('delivery');
  });

  it('marca el campo cuando el rechazo lo señala', () => {
    expect(orderSubmitErrorInfo(new ApiError(422, 'x', 'DELIVERY_ADDRESS_REQUIRED')).field).toBe('deliveryAddress');
    expect(orderSubmitErrorInfo(new ApiError(422, 'x', 'INVALID_PHONE')).field).toBe('phone');
  });

  it('MERCHANT_SETUP_INCOMPLETE (409): el negocio no puede recibir pedidos', () => {
    const info = orderSubmitErrorInfo(new ApiError(409, 'Merchant setup incomplete', 'MERCHANT_SETUP_INCOMPLETE'));
    expect(info.message).toBe(ORDER_SUBMIT_ERRORS.MERCHANT_SETUP_INCOMPLETE.message);
    expect(info.message).not.toBe(ORDER_SUBMIT_FALLBACK_MESSAGE);
    expect(info.step).toBeUndefined();
  });

  it.each(['PRODUCT_UNAVAILABLE', 'ORDER_INVALID', 'PAYMENT_SETTINGS_MISSING'] as const)('%s tiene mensaje propio', (code) => {
    expect(orderSubmitErrorInfo(new ApiError(422, 'raw english', code)).message).toBe(ORDER_SUBMIT_ERRORS[code].message);
  });

  it('un código de prototipo no se confunde con un código conocido', () => {
    expect(orderSubmitErrorInfo(new ApiError(422, 'x', 'toString')).message).toBe(ORDER_SUBMIT_FALLBACK_MESSAGE);
  });

  it('código desconocido: mensaje genérico, nunca el texto de la API', () => {
    const info = orderSubmitErrorInfo(new ApiError(422, 'Something exploded in English', 'SOMETHING_NEW'));
    expect(info).toEqual({ message: ORDER_SUBMIT_FALLBACK_MESSAGE });
  });

  it('sin código: mensaje genérico, nunca el texto de la API', () => {
    expect(orderSubmitErrorInfo(new ApiError(400, 'Bad request body')).message).toBe(ORDER_SUBMIT_FALLBACK_MESSAGE);
  });

  it('5xx o error que no es de la API: mensaje genérico', () => {
    expect(orderSubmitErrorInfo(new ApiError(500, 'x', 'ORDER_INVALID')).message).toBe(ORDER_SUBMIT_FALLBACK_MESSAGE);
    expect(orderSubmitErrorInfo(new TypeError('Failed to fetch')).message).toBe(ORDER_SUBMIT_FALLBACK_MESSAGE);
    expect(orderSubmitErrorInfo(undefined).message).toBe(ORDER_SUBMIT_FALLBACK_MESSAGE);
  });

  it('ningún mensaje usa guion largo', () => {
    for (const info of Object.values(ORDER_SUBMIT_ERRORS)) expect(info.message).not.toMatch(/—/);
  });
});
