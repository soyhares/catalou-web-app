import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrderTracking } from '@entities/order/tracking-api';
import { OrderTrackingScreen } from './OrderTrackingScreen';
import type { OrderTrackingLoad, TrackingFreshness } from './useOrderTracking';
import { FRESHNESS_TICK_MS } from './freshness';

const tracking = (status: string, extra: Partial<OrderTracking> = {}) =>
  ({
    status,
    reference: 'ORD-AAAA1111',
    businessName: 'Demo',
    merchantWhatsappE164: '+50688887777',
    fulfillmentType: 'DELIVERY',
    items: [],
    timeline: [{ status: 'PENDING', at: '2026-11-12T15:42:00.000Z' }, { status, at: '2026-11-12T16:00:00.000Z' }],
    payment: { status: 'VERIFIED', timing: 'ON_DELIVERY', method: 'CASH' },
    amounts: null,
    reviewable: false,
    ...extra,
  }) as unknown as OrderTracking;

const ready = (data: OrderTracking): OrderTrackingLoad => ({ kind: 'ready', data });
const fresh = (over: Partial<TrackingFreshness> = {}): TrackingFreshness => ({
  lastUpdatedAt: Date.now(),
  isRefreshing: false,
  lastRefreshFailed: false,
  ...over,
});
const ui = (load: OrderTrackingLoad, freshness: TrackingFreshness = fresh()) => (
  <MemoryRouter>
    <OrderTrackingScreen load={load} onRetry={() => {}} reviewPath="/pedido/tok/valoracion" freshness={freshness} />
  </MemoryRouter>
);
const indicator = () => screen.queryByTestId('live-indicator');
const moment = () => screen.queryByTestId('confirmed-moment');

beforeEach(() => sessionStorage.clear());

describe('indicador "Se actualiza solo"', () => {
  afterEach(() => vi.useRealTimers());

  it.each(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED'])('visible con el pedido abierto (%s)', (status) => {
    render(ui(ready(tracking(status))));
    expect(indicator()).not.toBeNull();
    expect(indicator()?.textContent).toContain('Se actualiza solo');
    expect(indicator()?.textContent).toContain('Actualizado recién');
    expect(indicator()?.querySelector('[class*="motion-safe:animate-live-ping"]')).not.toBeNull();
  });

  it.each(['COMPLETED', 'CANCELLED'])('oculto con el pedido cerrado (%s)', (status) => {
    render(ui(ready(tracking(status))));
    expect(indicator()).toBeNull();
    expect(screen.queryByText('Se actualiza solo')).toBeNull();
  });

  it('"Actualizado hace" avanza solo, sin que llegue otra respuesta', () => {
    vi.useFakeTimers();
    render(ui(ready(tracking('PREPARING')), fresh({ lastUpdatedAt: Date.now() })));
    expect(indicator()?.textContent).toContain('Actualizado recién');

    act(() => {
      vi.advanceTimersByTime(FRESHNESS_TICK_MS * 4);
    });
    expect(indicator()?.textContent).toContain('Actualizado hace 2 min');
  });

  it('si el último refresco falló dice "Reintentando…" y conserva la antigüedad del dato', () => {
    render(ui(ready(tracking('PREPARING')), fresh({ lastUpdatedAt: Date.now() - 3 * 60_000, lastRefreshFailed: true })));
    expect(indicator()?.textContent).toContain('Reintentando…');
    expect(indicator()?.textContent).toContain('Actualizado hace 3 min');
    expect(indicator()?.querySelector('[class*="animate-live-ping"]')).toBeNull();
  });

  it('durante una consulta se marca ocupado, sin cambiar el texto', () => {
    render(ui(ready(tracking('PREPARING')), fresh({ isRefreshing: true })));
    expect(indicator()?.getAttribute('aria-busy')).toBe('true');
    expect(indicator()?.textContent).toContain('Se actualiza solo');
  });
});

describe('momento de Confirmado', () => {
  it('celebra al pasar a CONFIRMED con la página abierta, y el indicador sigue', () => {
    const { rerender } = render(ui(ready(tracking('PENDING'))));
    expect(moment()).toBeNull();

    rerender(ui(ready(tracking('CONFIRMED'))));
    expect(moment()?.textContent).toContain('¡Tu pedido fue confirmado!');
    expect(moment()?.textContent).toContain('El negocio ya lo tiene en marcha.');
    expect(moment()?.querySelector('[class*="motion-safe:animate-check-draw"]')).not.toBeNull();
    expect(indicator()).not.toBeNull();
  });

  it('celebra una sola vez por pedido: recargar no lo repite', () => {
    const first = render(ui(ready(tracking('CONFIRMED'))));
    expect(moment()).not.toBeNull();
    first.unmount();

    render(ui(ready(tracking('CONFIRMED'))));
    expect(moment()).toBeNull();
  });

  it('otro pedido sí se celebra', () => {
    const first = render(ui(ready(tracking('CONFIRMED'))));
    first.unmount();
    render(ui(ready(tracking('CONFIRMED', { reference: 'ORD-BBBB2222' }))));
    expect(moment()).not.toBeNull();
  });

  it('desaparece cuando el pedido avanza', () => {
    const { rerender } = render(ui(ready(tracking('CONFIRMED'))));
    expect(moment()).not.toBeNull();
    rerender(ui(ready(tracking('PREPARING'))));
    expect(moment()).toBeNull();
  });

  it('el token no se guarda en el almacenamiento', () => {
    render(ui(ready(tracking('CONFIRMED'))));
    const keys = Object.keys(sessionStorage);
    expect(keys.some((k) => k.includes('ORD-AAAA1111'))).toBe(true);
    expect(keys.some((k) => k.includes('tok'))).toBe(false);
  });
});

describe('estados de cierre', () => {
  it('Entregado: check grande, agradecimiento y valoración destacada', () => {
    render(ui(ready(tracking('COMPLETED', { reviewable: true }))));
    const final = screen.getByTestId('final-completed');
    expect(final.textContent).toContain('Pedido entregado');
    expect(final.textContent).toContain('¡Gracias por tu compra!');
    const cta = screen.getByRole('link', { name: 'Valorar tu pedido' });
    expect(final.contains(cta)).toBe(true);
    expect(cta.getAttribute('href')).toBe('/pedido/tok/valoracion');
    expect(screen.getAllByRole('link', { name: 'Valorar tu pedido' })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Pedido entregado');
  });

  it('Entregado en un retiro dice "Pedido retirado"', () => {
    render(ui(ready(tracking('COMPLETED', { fulfillmentType: 'PICKUP', reviewable: true }))));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Pedido retirado');
  });

  it('Entregado y ya valorado: sin CTA, con el agradecimiento', () => {
    render(ui(ready(tracking('COMPLETED', { reviewable: false, reviewed: true }))));
    expect(screen.queryByRole('link', { name: 'Valorar tu pedido' })).toBeNull();
    expect(screen.getByTestId('final-completed').textContent).toContain('Gracias por tu valoración.');
  });

  it('Cancelado: sobrio, sin celebración, con el enlace para escribirle al negocio', () => {
    const { container } = render(ui(ready(tracking('CANCELLED'))));
    const final = screen.getByTestId('final-cancelled');
    expect(final.textContent).toContain('Pedido cancelado');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Pedido cancelado');
    expect(moment()).toBeNull();
    expect(container.querySelector('[class*="animate-moment"], [class*="animate-check-draw"], [class*="animate-ring-draw"]')).toBeNull();
    const contact = screen.getAllByRole('link', { name: /Escribirle a Demo por WhatsApp/ });
    expect(contact).toHaveLength(1);
    expect(final.contains(contact[0])).toBe(true);
    expect(screen.queryByText(/Gracias por tu compra/)).toBeNull();
  });

  it('Cancelado sin WhatsApp del negocio no promete un botón que no está', () => {
    render(ui(ready(tracking('CANCELLED', { merchantWhatsappE164: null }))));
    expect(screen.queryByRole('link', { name: /Escribirle/ })).toBeNull();
    expect(screen.getByTestId('final-cancelled').textContent).toContain('comunicate con Demo');
  });
});
