import { describe, it, expect } from 'vitest';
import { buildTrackingTimeline } from './timeline';

const at = (status: string, iso = '2026-11-12T15:42:00.000Z') => ({ status, at: iso });

describe('buildTrackingTimeline', () => {
  it('en Recibido marca el primer paso como actual y el resto como próximos', () => {
    const steps = buildTrackingTimeline('PENDING', [at('PENDING')], 'DELIVERY');
    expect(steps.map((s) => [s.status, s.state])).toEqual([
      ['PENDING', 'current'],
      ['CONFIRMED', 'upcoming'],
      ['PREPARING', 'upcoming'],
      ['SHIPPED', 'upcoming'],
      ['COMPLETED', 'upcoming'],
    ]);
  });

  it('rotula SHIPPED como "Listo para retirar" en pedidos para retirar', () => {
    const steps = buildTrackingTimeline('PREPARING', [at('PENDING'), at('CONFIRMED'), at('PREPARING')], 'PICKUP');
    expect(steps.find((s) => s.status === 'SHIPPED')?.label).toBe('Listo para retirar');
    expect(steps.find((s) => s.status === 'PREPARING')?.state).toBe('current');
  });

  it('rotula SHIPPED como "Enviado" con envío', () => {
    const steps = buildTrackingTimeline('SHIPPED', [at('PENDING'), at('CONFIRMED'), at('SHIPPED')], 'DELIVERY');
    expect(steps.find((s) => s.status === 'SHIPPED')?.label).toBe('Enviado');
  });

  it('oculta los pasos opcionales que el negocio saltó', () => {
    const steps = buildTrackingTimeline('COMPLETED', [at('PENDING'), at('CONFIRMED'), at('COMPLETED')], 'DELIVERY');
    expect(steps.map((s) => s.status)).toEqual(['PENDING', 'CONFIRMED', 'COMPLETED']);
    expect(steps[steps.length - 1]?.state).toBe('current');
    expect(steps[0].at).toBe('2026-11-12T15:42:00.000Z');
  });

  it('un cancelado muestra lo recorrido y termina en Cancelado', () => {
    const steps = buildTrackingTimeline('CANCELLED', [at('PENDING'), at('CONFIRMED'), at('CANCELLED')], 'DELIVERY');
    expect(steps.map((s) => [s.status, s.state])).toEqual([
      ['PENDING', 'done'],
      ['CONFIRMED', 'done'],
      ['CANCELLED', 'current'],
    ]);
    expect(steps[steps.length - 1]?.label).toBe('Cancelado');
  });

  it('un estado desconocido usa el rótulo de respaldo, nunca el código', () => {
    const steps = buildTrackingTimeline('ON_HOLD', [], 'DELIVERY');
    expect(steps).toHaveLength(1);
    expect(steps[0].label).toBe('En proceso');
  });
});
