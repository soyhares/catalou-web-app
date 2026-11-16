import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import type { OrderTracking } from '@entities/order/tracking-api';
import { OrderTrackingScreen } from './OrderTrackingScreen';
import type { OrderTrackingLoad, TrackingFreshness } from './useOrderTracking';

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
const nextStep = () => screen.queryByTestId('next-step');
const lastUpdated = () => screen.queryByTestId('last-updated');
const moment = () => screen.queryByTestId('confirmed-moment');
/** 9:41 de la mañana, hora local: la que se espera ver en "Última actualización". */
const AT_941 = new Date(2026, 10, 12, 9, 41).getTime();

beforeEach(() => sessionStorage.clear());

describe('paso siguiente vivo', () => {
  it.each([
    ['PENDING', 'Confirmado'],
    ['CONFIRMED', 'En preparación'],
    ['PREPARING', 'Enviado'],
  ])('con el pedido abierto (%s) muestra el próximo paso esperando al negocio', (status, label) => {
    render(ui(ready(tracking(status))));
    const step = nextStep();
    expect(step).not.toBeNull();
    expect(step?.textContent).toContain(label);
    expect(step?.textContent).toContain('Esperando al negocio');
    expect(step?.textContent).toContain(`Próximo paso: ${label}, esperando al negocio`);
    expect(step?.getAttribute('aria-current')).toBeNull();
  });

  it('el brillo es decorativo y solo corre con movimiento permitido', () => {
    render(ui(ready(tracking('CONFIRMED'))));
    const shimmer = screen.getByTestId('next-step-shimmer');
    expect(shimmer.className).toContain('motion-safe:animate-next-shimmer');
    expect(shimmer.className).toContain('motion-reduce:hidden');
    expect(shimmer.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('en Enviado con envío el próximo es Entregado, pendiente de entrega', () => {
    render(ui(ready(tracking('SHIPPED'))));
    expect(nextStep()?.textContent).toContain('Entregado');
    expect(nextStep()?.textContent).toContain('Pendiente de entrega');
  });

  it('en Listo para retirar el próximo dice pendiente de retiro', () => {
    render(ui(ready(tracking('SHIPPED', { fulfillmentType: 'PICKUP' }))));
    expect(nextStep()?.textContent).toContain('Pendiente de retiro');
    expect(nextStep()?.textContent).toContain('Próximo paso: Entregado, pendiente de retiro');
    expect(screen.queryByText('Esperando al negocio')).toBeNull();
  });

  it('cuando llega el cambio, el paso siguiente pasa a actual con su entrada y aparece el nuevo', () => {
    const { rerender } = render(ui(ready(tracking('CONFIRMED'))));
    expect(nextStep()?.textContent).toContain('En preparación');

    rerender(ui(ready(tracking('PREPARING'))));
    const current = document.querySelector('[aria-current="step"]');
    expect(current?.textContent).toContain('En preparación');
    expect(current?.className).toContain('motion-safe:animate-step-in');
    expect(nextStep()?.textContent).toContain('Enviado');
  });

  it.each(['COMPLETED', 'CANCELLED'])('con el pedido cerrado (%s) no hay paso siguiente', (status) => {
    render(ui(ready(tracking(status))));
    expect(nextStep()).toBeNull();
    expect(screen.queryByText('Esperando al negocio')).toBeNull();
  });

  it('el indicador viejo ya no existe', () => {
    render(ui(ready(tracking('PREPARING'))));
    expect(screen.queryByText(/Se actualiza solo/)).toBeNull();
    expect(screen.queryByText(/Actualizado hace|Actualizado recién|Reintentando/)).toBeNull();
    expect(document.querySelector('[class*="animate-live-ping"]')).toBeNull();
  });
});

describe('"Última actualización"', () => {
  it.each(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED'])('con el pedido abierto (%s) muestra la hora', (status) => {
    render(ui(ready(tracking(status)), fresh({ lastUpdatedAt: AT_941 })));
    expect(lastUpdated()?.textContent).toContain('Última actualización');
    expect(lastUpdated()?.textContent).toContain('9:41');
    expect(lastUpdated()?.textContent).toMatch(/a\.\sm\./);
  });

  it('en cada refresco la hora entra con un fundido', () => {
    const { rerender } = render(ui(ready(tracking('PREPARING')), fresh({ lastUpdatedAt: AT_941 })));
    const before = lastUpdated()?.querySelector('time');
    expect(before?.className).toContain('motion-safe:animate-time-fade');

    rerender(ui(ready(tracking('PREPARING')), fresh({ lastUpdatedAt: AT_941 + 60_000 })));
    const after = lastUpdated()?.querySelector('time');
    expect(after?.textContent).toContain('9:42');
    expect(after).not.toBe(before);
  });

  it('si el último refresco falló conserva la última hora buena, sin aviso de error', () => {
    render(ui(ready(tracking('PREPARING')), fresh({ lastUpdatedAt: AT_941, lastRefreshFailed: true })));
    expect(lastUpdated()?.textContent).toContain('9:41');
    expect(screen.queryByText(/Reintentando|error|falló/i)).toBeNull();
  });

  it.each(['COMPLETED', 'CANCELLED'])('oculta con el pedido cerrado (%s)', (status) => {
    render(ui(ready(tracking(status)), fresh({ lastUpdatedAt: AT_941 })));
    expect(lastUpdated()).toBeNull();
    expect(screen.queryByText(/Última actualización/)).toBeNull();
  });

  it('sin respuesta buena todavía, no se muestra', () => {
    render(ui(ready(tracking('PREPARING')), fresh({ lastUpdatedAt: null })));
    expect(lastUpdated()).toBeNull();
  });
});

describe('momento de Confirmado', () => {
  it('celebra al pasar a CONFIRMED con la página abierta, y el paso siguiente sigue', () => {
    const { rerender } = render(ui(ready(tracking('PENDING'))));
    expect(moment()).toBeNull();

    rerender(ui(ready(tracking('CONFIRMED'))));
    expect(moment()?.textContent).toContain('¡Tu pedido fue confirmado!');
    expect(moment()?.textContent).toContain('El negocio ya lo tiene en marcha.');
    expect(moment()?.querySelector('[class*="motion-safe:animate-check-draw"]')).not.toBeNull();
    expect(nextStep()).not.toBeNull();
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
