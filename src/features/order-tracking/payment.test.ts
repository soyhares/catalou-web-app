import { describe, it, expect } from 'vitest';
import { formatPrice } from '@shared/lib/formatPrice';
import {
  paymentAmountRows,
  landingTotal,
  formatSignedAmount,
  formatSinpePhone,
  sinpeCopyValue,
  formatIban,
  paymentSummary,
  paymentStatusLabel,
} from './payment';

const crc = (n: number) => formatPrice(n, 'CRC');

describe('paymentAmountRows (D53, FR-032)', () => {
  it('precios visibles sin ajuste: solo el total', () => {
    const rows = paymentAmountRows({ total: 18500, amountToCharge: 18500, currency: 'CRC' });
    expect(rows).toEqual([{ kind: 'total', label: 'Total', value: crc(18500), emphasis: true }]);
  });

  it('precios visibles sin monto acordado todavía: el total', () => {
    const rows = paymentAmountRows({ total: 18500, amountToCharge: null, currency: 'CRC' });
    expect(rows.map((r) => r.kind)).toEqual(['total']);
  });

  it('precios visibles con ajuste: total, ajuste con motivo y monto acordado', () => {
    const rows = paymentAmountRows({
      total: 18500,
      adjustment: 1500,
      reason: 'caja de regalo',
      amountToCharge: 20000,
      currency: 'CRC',
    });
    expect(rows).toEqual([
      { kind: 'total', label: 'Total del pedido', value: crc(18500), emphasis: false },
      { kind: 'adjustment', label: 'Ajuste: caja de regalo', value: `+${crc(1500)}`, emphasis: false },
      { kind: 'agreed', label: 'Monto acordado', value: crc(20000), emphasis: true },
    ]);
  });

  it('calcula el ajuste si la API no lo manda y muestra los descuentos con signo menos', () => {
    const rows = paymentAmountRows({ total: 18500, amountToCharge: 17000, reason: null, currency: 'CRC' });
    expect(rows[1]).toEqual({ kind: 'adjustment', label: 'Ajuste', value: `-${crc(1500)}`, emphasis: false });
  });

  it('precios ocultos: solo el monto acordado, sin total ni motivo', () => {
    const rows = paymentAmountRows({
      total: null,
      adjustment: null,
      reason: null,
      amountToCharge: 20000,
      currency: 'CRC',
    });
    expect(rows).toEqual([{ kind: 'agreed', label: 'Monto acordado', value: crc(20000), emphasis: true }]);
  });

  it('precios ocultos sin monto fijado: ninguna fila', () => {
    expect(paymentAmountRows({ total: null, amountToCharge: null, currency: 'CRC' })).toEqual([]);
    expect(paymentAmountRows(undefined)).toEqual([]);
  });

  it('formatea en dólares cuando la moneda es USD', () => {
    const rows = paymentAmountRows({ total: 25, amountToCharge: 25, currency: 'USD' });
    expect(rows[0].value).toBe(formatPrice(25, 'USD'));
  });
});

describe('landingTotal', () => {
  it('usa el total cuando viene', () => {
    expect(landingTotal({ total: 18500, currency: 'CRC' })).toBe(crc(18500));
  });
  it('no muestra nada con precios ocultos', () => {
    expect(landingTotal({ total: null, amountToCharge: null })).toBeNull();
    expect(landingTotal(undefined)).toBeNull();
  });
});

describe('formatos de pago', () => {
  it('formatSignedAmount', () => {
    expect(formatSignedAmount(-10, 'USD')).toBe(`-${formatPrice(10, 'USD')}`);
    expect(formatSignedAmount(10, 'USD')).toBe(`+${formatPrice(10, 'USD')}`);
  });
  it('SINPE en dos grupos y copia de 8 dígitos', () => {
    expect(formatSinpePhone('87654321')).toBe('8765 4321');
    expect(formatSinpePhone('+50687654321')).toBe('8765 4321');
    expect(sinpeCopyValue('+506 8765-4321')).toBe('87654321');
  });
  it('IBAN en grupos de 4', () => {
    expect(formatIban('CR05015202001026284066')).toBe('CR05 0152 0200 1026 2840 66');
  });
  it('resumen y estado del pago', () => {
    expect(paymentSummary({ method: 'SINPE_MOVIL', timing: 'UPFRONT', status: 'PENDING' })).toBe('SINPE Móvil, por adelantado');
    expect(paymentStatusLabel('VERIFIED')).toBe('Recibido');
    expect(paymentStatusLabel('PENDING')).toBe('Pendiente');
  });
});
