import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import OrderInvoicePage from './OrderInvoicePage';

vi.mock('@app/BrandingContext', () => ({ useBranding: () => ({ slug: 'demo' }) }));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pedido/:token/factura" element={<OrderInvoicePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OrderInvoicePage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('pregunta con HEAD y, si la factura no existe, muestra un mensaje en vez del JSON de la API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    renderAt('/pedido/tok123/factura');

    expect((await screen.findByRole('alert')).textContent).toContain('Esta factura ya no está disponible');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/catalog/demo/orders/track/tok123/invoice'), {
      method: 'HEAD',
      cache: 'no-store',
    });
    expect(screen.getByRole('link', { name: 'Ver el seguimiento del pedido' }).getAttribute('href')).toBe('/pedido/tok123');
  });

  it('un 429 pide esperar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 429 })));
    renderAt('/pedido/tok123/factura');
    expect((await screen.findByRole('alert')).textContent).toContain('demasiados intentos');
  });
});
