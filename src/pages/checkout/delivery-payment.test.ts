import { describe, expect, it } from 'vitest';
import {
  EMPTY_SELECTION,
  availableFulfillmentTypes,
  availableMethods,
  availableTimings,
  confirmationDestination,
  isValidCrPhone,
  normalizeCrPhone,
  reconcileSelection,
  timingLabel,
  toCrE164,
  validateDeliveryPayment,
  type CheckoutOptions,
} from './delivery-payment';

const FULL: CheckoutOptions = {
  acceptsDirectOrders: true,
  fulfillmentTypes: ['PICKUP', 'DELIVERY'],
  paymentTimings: ['ON_DELIVERY', 'UPFRONT'],
  paymentMethods: [
    { method: 'CASH', timings: ['ON_DELIVERY'] },
    { method: 'SINPE_MOVIL', timings: ['UPFRONT', 'ON_DELIVERY'] },
    { method: 'BANK_TRANSFER', timings: ['UPFRONT'] },
  ],
};

// US2, escenario 1: solo retiro y solo SINPE Móvil por adelantado.
const PICKUP_SINPE_ONLY: CheckoutOptions = {
  acceptsDirectOrders: true,
  fulfillmentTypes: ['PICKUP'],
  paymentTimings: ['UPFRONT'],
  paymentMethods: [{ method: 'SINPE_MOVIL', timings: ['UPFRONT'] }],
};

describe('opciones disponibles', () => {
  it('ordena las opciones de forma fija, sin depender del orden de la API', () => {
    expect(availableFulfillmentTypes(FULL)).toEqual(['DELIVERY', 'PICKUP']);
    expect(availableTimings(FULL)).toEqual(['UPFRONT', 'ON_DELIVERY']);
  });

  it('muestra solo los métodos cuyo par con el momento es válido', () => {
    expect(availableMethods(FULL, 'UPFRONT')).toEqual(['SINPE_MOVIL', 'BANK_TRANSFER']);
    expect(availableMethods(FULL, 'ON_DELIVERY')).toEqual(['SINPE_MOVIL', 'CASH']);
    expect(availableMethods(FULL, null)).toEqual([]);
  });

  it('no ofrece un método para un momento que el negocio no habilitó', () => {
    const opts: CheckoutOptions = { ...FULL, paymentTimings: ['UPFRONT'] };
    expect(availableMethods(opts, 'ON_DELIVERY')).toEqual([]);
    expect(availableTimings(opts)).toEqual(['UPFRONT']);
  });

  it('no ofrece un momento sin ningún método que lo admita', () => {
    const opts: CheckoutOptions = {
      ...FULL,
      paymentMethods: [{ method: 'BANK_TRANSFER', timings: ['UPFRONT'] }],
    };
    expect(availableTimings(opts)).toEqual(['UPFRONT']);
  });
});

describe('reconcileSelection', () => {
  it('preselecciona todo cuando hay una sola opción en cada grupo', () => {
    expect(reconcileSelection(PICKUP_SINPE_ONLY, EMPTY_SELECTION)).toEqual({
      fulfillmentType: 'PICKUP',
      paymentTiming: 'UPFRONT',
      paymentMethod: 'SINPE_MOVIL',
    });
  });

  it('no preselecciona cuando hay más de una opción', () => {
    expect(reconcileSelection(FULL, EMPTY_SELECTION)).toEqual(EMPTY_SELECTION);
  });

  it('descarta el método que deja de ser válido al cambiar el momento', () => {
    const next = reconcileSelection(FULL, {
      fulfillmentType: 'PICKUP',
      paymentTiming: 'UPFRONT',
      paymentMethod: 'CASH',
    });
    expect(next.paymentMethod).toBeNull();
  });

  it('preselecciona el único método válido para el momento elegido', () => {
    const opts: CheckoutOptions = {
      ...FULL,
      paymentMethods: [
        { method: 'CASH', timings: ['ON_DELIVERY'] },
        { method: 'BANK_TRANSFER', timings: ['UPFRONT'] },
      ],
    };
    const next = reconcileSelection(opts, { ...EMPTY_SELECTION, paymentTiming: 'ON_DELIVERY' });
    expect(next.paymentMethod).toBe('CASH');
  });

  it('conserva una selección válida', () => {
    const sel = { fulfillmentType: 'DELIVERY', paymentTiming: 'ON_DELIVERY', paymentMethod: 'CASH' } as const;
    expect(reconcileSelection(FULL, sel)).toEqual(sel);
  });
});

describe('teléfono de Costa Rica', () => {
  it.each([
    ['88881234', '88881234'],
    ['8888 1234', '88881234'],
    ['8888-1234', '88881234'],
    ['+506 8888 1234', '88881234'],
    ['50688881234', '88881234'],
    ['888812345', '88881234'],
    ['abc', ''],
  ])('normaliza %s a %s', (raw, expected) => {
    expect(normalizeCrPhone(raw)).toBe(expected);
  });

  it('exige exactamente 8 dígitos', () => {
    expect(isValidCrPhone('88881234')).toBe(true);
    expect(isValidCrPhone('8888123')).toBe(false);
    expect(isValidCrPhone('')).toBe(false);
  });

  it('se envía normalizado con +506', () => {
    expect(toCrE164('88881234')).toBe('+50688881234');
  });
});

describe('validateDeliveryPayment', () => {
  const valid = {
    options: FULL,
    selection: { fulfillmentType: 'PICKUP', paymentTiming: 'UPFRONT', paymentMethod: 'SINPE_MOVIL' } as const,
    deliveryAddress: '',
    phoneDigits: '88881234',
  };

  it('acepta retiro sin dirección', () => {
    expect(validateDeliveryPayment(valid)).toEqual({});
  });

  it('con envío la dirección es obligatoria (US2, escenario 2)', () => {
    const errs = validateDeliveryPayment({
      ...valid,
      selection: { ...valid.selection, fulfillmentType: 'DELIVERY' },
      deliveryAddress: '   ',
    });
    expect(errs.deliveryAddress).toBeTruthy();
  });

  it('un teléfono sin 8 dígitos da un error claro (US2, escenario 3)', () => {
    const errs = validateDeliveryPayment({ ...valid, phoneDigits: '8888123' });
    expect(errs.phone).toMatch(/8 dígitos/);
  });

  it('pide cada elección que falta', () => {
    const errs = validateDeliveryPayment({ ...valid, selection: EMPTY_SELECTION });
    expect(Object.keys(errs).sort()).toEqual(['fulfillmentType', 'paymentTiming']);
  });

  it('rechaza un par método/momento que el negocio no habilitó', () => {
    const errs = validateDeliveryPayment({
      ...valid,
      selection: { ...valid.selection, paymentTiming: 'UPFRONT', paymentMethod: 'CASH' },
    });
    expect(errs.paymentMethod).toBeTruthy();
  });

  it('sin opciones del negocio (API anterior) pide dirección y teléfono como antes', () => {
    const errs = validateDeliveryPayment({
      options: null,
      selection: EMPTY_SELECTION,
      deliveryAddress: '',
      phoneDigits: '88881234',
    });
    expect(Object.keys(errs)).toEqual(['deliveryAddress']);
  });
});

describe('timingLabel', () => {
  it('nombra el pago al recibir según el tipo de entrega', () => {
    expect(timingLabel('UPFRONT', null).label).toBe('Ahora');
    expect(timingLabel('ON_DELIVERY', 'PICKUP').label).toBe('Al retirar');
    expect(timingLabel('ON_DELIVERY', 'DELIVERY').label).toBe('Al recibir');
    expect(timingLabel('ON_DELIVERY', null).label).toBe('Al recibir o retirar');
  });
});

describe('confirmationDestination (T075)', () => {
  it('un pedido Directo con token va a su seguimiento', () => {
    expect(confirmationDestination({ orderType: 'DIRECT', trackingToken: 'abc-123' })).toEqual({
      kind: 'tracking',
      path: '/pedido/abc-123',
    });
  });

  it('FINANCED sigue en /order-confirmed', () => {
    expect(confirmationDestination({ orderType: 'FINANCED', trackingToken: null }).path).toBe('/order-confirmed');
  });

  it('una API vieja sin token cae a /order-confirmed', () => {
    expect(confirmationDestination({ orderType: 'DIRECT' }).path).toBe('/order-confirmed');
    expect(confirmationDestination({ orderType: 'DIRECT', trackingToken: null }).path).toBe('/order-confirmed');
  });
});
