import { describe, it, expect } from 'vitest';
import {
  orderStatusLabel,
  ORDER_STATUS_FALLBACK_LABEL,
  ORDER_SHIPPED_PICKUP_LABEL,
} from './status-labels';

describe('orderStatusLabel', () => {
  it.each([
    ['PENDING', 'Recibido'],
    ['CONFIRMED', 'Confirmado'],
    ['PREPARING', 'En preparación'],
    ['COMPLETED', 'Entregado'],
    ['CANCELLED', 'Cancelado'],
    ['ASSOCIATION_CONFIRMED', 'Aprobado por asociación'],
  ])('rotula %s como "%s"', (status, label) => {
    expect(orderStatusLabel(status)).toBe(label);
  });

  it('rotula SHIPPED según el tipo de entrega', () => {
    expect(orderStatusLabel('SHIPPED', 'DELIVERY')).toBe('Enviado');
    expect(orderStatusLabel('SHIPPED', 'PICKUP')).toBe(ORDER_SHIPPED_PICKUP_LABEL);
    expect(ORDER_SHIPPED_PICKUP_LABEL).toBe('Listo para retirar');
  });

  it('rotula SHIPPED como "Enviado" cuando no se conoce el tipo de entrega', () => {
    expect(orderStatusLabel('SHIPPED')).toBe('Enviado');
    expect(orderStatusLabel('SHIPPED', null)).toBe('Enviado');
  });

  it('usa el rótulo de respaldo para valores desconocidos y nunca muestra el código', () => {
    expect(orderStatusLabel('SOMETHING_NEW')).toBe(ORDER_STATUS_FALLBACK_LABEL);
    expect(orderStatusLabel('toString')).toBe(ORDER_STATUS_FALLBACK_LABEL);
    expect(orderStatusLabel('')).toBe(ORDER_STATUS_FALLBACK_LABEL);
    expect(orderStatusLabel(null)).toBe(ORDER_STATUS_FALLBACK_LABEL);
    expect(orderStatusLabel(undefined)).toBe(ORDER_STATUS_FALLBACK_LABEL);
  });

  it('el tipo de entrega solo afecta a SHIPPED', () => {
    expect(orderStatusLabel('PENDING', 'PICKUP')).toBe('Recibido');
  });
});
