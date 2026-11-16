import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { OrderTracking } from '@entities/order/tracking-api';
import { OrderTrackingScreen } from './OrderTrackingScreen';
import type { OrderTrackingLoad } from './useOrderTracking';

const tracking = (status: string, payment = 'PENDING') =>
  ({
    status,
    reference: 'A-1',
    businessName: 'Demo',
    fulfillmentType: 'DELIVERY',
    items: [],
    timeline: [{ status: 'PENDING', at: '2026-11-12T15:42:00.000Z' }, { status, at: '2026-11-12T16:00:00.000Z' }],
    payment: { status: payment, timing: 'ON_DELIVERY', method: 'CASH' },
    amounts: null,
  }) as unknown as OrderTracking;

const ready = (data: OrderTracking): OrderTrackingLoad => ({ kind: 'ready', data });
const ui = (load: OrderTrackingLoad) => (
  <MemoryRouter>
    <OrderTrackingScreen load={load} onRetry={() => {}} reviewPath="/r" />
  </MemoryRouter>
);
const live = () => screen.getByRole('status');
const animated = (container: HTMLElement) => container.querySelectorAll('[class*="animate-"]');

describe('OrderTrackingScreen: animación de cambio', () => {
  it('en la carga inicial no marca cambio', () => {
    const { container } = render(ui(ready(tracking('CONFIRMED'))));
    expect(live().textContent).toBe('');
    expect(animated(container)).toHaveLength(0);
  });

  it('un refresco con el mismo estado no marca cambio', () => {
    const { container, rerender } = render(ui(ready(tracking('CONFIRMED'))));
    rerender(ui(ready(tracking('CONFIRMED'))));
    expect(live().textContent).toBe('');
    expect(animated(container)).toHaveLength(0);
  });

  it('un refresco con otro estado anima y lo anuncia', () => {
    const { container, rerender } = render(ui(ready(tracking('CONFIRMED'))));
    rerender(ui(ready(tracking('PREPARING'))));
    expect(live().textContent).toContain('Tu pedido pasó a');
    expect(container.querySelector('h1')?.className).toContain('motion-safe:animate-status-halo');
    expect(container.querySelector('li[aria-current="step"]')?.className).toContain('motion-safe:animate-step-in');
  });

  it('un cambio solo de pago anima la tarjeta de pago', () => {
    const { container, rerender } = render(ui(ready(tracking('CONFIRMED'))));
    rerender(ui(ready(tracking('CONFIRMED', 'VERIFIED'))));
    expect(live().textContent).toContain('Tu pago pasó a');
    expect(container.querySelector('section')?.className).toContain('motion-safe:animate-status-halo');
    expect(container.querySelector('h1')?.className).not.toContain('animate-');
  });
});
