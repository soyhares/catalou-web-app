import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrderTracking } from '@entities/order/tracking-api';
import { OrderReviewScreen } from '@features/order-review';
import type { OrderReviewController } from '@features/order-review/useOrderReview';
import OrderTrackingPage from './index';
import ActivateAccountPage from '../activate-account';
import { cancelDestination } from '../activate-account/useActivateAccountPage';

/**
 * "Ahora no" en el flujo del pedido vuelve al seguimiento, nunca al catálogo.
 *
 * La causa del reporte: el seguimiento monta el ofrecimiento de cuenta; "Guardar mis datos" →
 * "Ingresar el código" lleva a /activate-account, y ahí "Ahora no" hacía `navigate('/catalog')`
 * fijo. Ahora el ofrecimiento manda `returnTo` con la ruta del pedido.
 */

vi.mock('@app/BrandingContext', () => ({
  useBranding: () => ({ slug: 'demo', branding: { companyName: 'Demo', featuresEnabled: { orders: true } } }),
}));

const requestActivation = vi.fn();
vi.mock('@entities/customer/api', () => ({
  requestActivation: (...args: unknown[]) => requestActivation(...args),
  verifyActivation: vi.fn(),
}));

const getOrderTracking = vi.fn();
vi.mock('@entities/order/tracking-api', () => ({
  getOrderTracking: (...args: unknown[]) => getOrderTracking(...args),
}));

const pending = {
  status: 'PENDING',
  reference: 'ORD-AAAA1111',
  businessName: 'Demo',
  fulfillmentType: 'PICKUP',
  items: [],
  timeline: [{ status: 'PENDING', at: '2026-11-12T15:42:00.000Z' }],
  payment: { status: 'PENDING', timing: 'ON_DELIVERY', method: 'CASH', instructions: null },
  amounts: null,
  noticeData: null,
  reviewable: false,
} as unknown as OrderTracking;

function Where() {
  const { pathname } = useLocation();
  return <p data-testid="where">{pathname}</p>;
}

const appRoutes = (
  <Routes>
    <Route path="/pedido/:token" element={<OrderTrackingPage />} />
    <Route path="/pedido/:token/valoracion" element={<p>Valoración</p>} />
    <Route path="/activate-account" element={<ActivateAccountPage />} />
    <Route path="/catalog" element={<p>Catálogo</p>} />
  </Routes>
);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  requestActivation.mockReset();
  getOrderTracking.mockReset();
});

describe('"Ahora no" en el flujo del pedido', () => {
  it('posponer el código de la cuenta vuelve al seguimiento del pedido, no al catálogo', async () => {
    getOrderTracking.mockResolvedValue(pending);
    requestActivation.mockResolvedValue({ maskedEmail: 'a***@correo.com' });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pedido/tok', state: { orderId: 'o-1', email: 'ana@correo.com' } }]}>
        {appRoutes}
        <Where />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Guardar mis datos' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Ingresar el código' }));
    expect(screen.getByTestId('where').textContent).toBe('/activate-account');

    fireEvent.click(await screen.findByRole('button', { name: 'Ahora no' }));
    expect(screen.getByTestId('where').textContent).toBe('/pedido/tok');
    expect(screen.queryByText('Catálogo')).toBeNull();
    expect(await screen.findByText('Tu pedido quedó registrado')).not.toBeNull();
  });

  it('sin un pedido de origen, "Ahora no" en la cuenta sigue yendo al catálogo', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/activate-account', state: { email: 'ana@correo.com' } }]}>
        {appRoutes}
        <Where />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Ahora no' }));
    expect(screen.getByTestId('where').textContent).toBe('/catalog');
  });

  it('returnTo solo acepta rutas de seguimiento', () => {
    expect(cancelDestination('/pedido/abc_DEF-123')).toBe('/pedido/abc_DEF-123');
    expect(cancelDestination('//evil.example/pedido/x')).toBe('/catalog');
    expect(cancelDestination('https://evil.example')).toBe('/catalog');
    expect(cancelDestination('/pedido/x/valoracion')).toBe('/catalog');
    expect(cancelDestination(undefined)).toBe('/catalog');
  });

  it('"Ahora no" de la valoración vuelve al seguimiento del pedido', () => {
    const controller: OrderReviewController = {
      load: { kind: 'ready', order: { businessName: 'Demo', reference: 'ORD-AAAA1111' }, state: 'form' },
      rating: 0,
      comment: '',
      isSubmitting: false,
      submitError: null,
      setRating: () => {},
      setComment: () => {},
      submit: () => {},
      retry: () => {},
    };
    render(
      <MemoryRouter initialEntries={['/pedido/tok', '/pedido/tok/valoracion']} initialIndex={1}>
        <Routes>
          <Route path="/pedido/:token" element={<p>Seguimiento</p>} />
          <Route path="/pedido/:token/valoracion" element={<OrderReviewScreen {...controller} orderPath="/pedido/tok" />} />
          <Route path="*" element={<p>Catálogo</p>} />
        </Routes>
        <Where />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Ahora no' }));
    expect(screen.getByTestId('where').textContent).toBe('/pedido/tok');
    expect(screen.getByText('Seguimiento')).not.toBeNull();
  });
});
