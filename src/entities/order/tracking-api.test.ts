import { afterEach, describe, it, expect, vi } from 'vitest';
import { trackingPathFromUrl } from './tracking-api';

describe('trackingPathFromUrl', () => {
  it('extrae la ruta interna de la URL absoluta', () => {
    expect(trackingPathFromUrl('https://demo.catalou.com/pedido/abc_DEF-123')).toBe('/pedido/abc_DEF-123');
    expect(trackingPathFromUrl('https://demo-sandbox.catalou.com/pedido/tok/')).toBe('/pedido/tok');
  });
  it('acepta una ruta relativa', () => {
    expect(trackingPathFromUrl('/pedido/tok')).toBe('/pedido/tok');
  });
  it('null para vacíos u otras rutas', () => {
    expect(trackingPathFromUrl(null)).toBeNull();
    expect(trackingPathFromUrl(undefined)).toBeNull();
    expect(trackingPathFromUrl('https://demo.catalou.com/catalog')).toBeNull();
    expect(trackingPathFromUrl('https://demo.catalou.com/pedido/tok/valoracion')).toBeNull();
  });
});

describe('orderInvoiceUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('arma la URL de la factura en la API con el slug del negocio y el token', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();
    const { orderInvoiceUrl } = await import('./tracking-api');
    const token = 'abc_DEF-123'.padEnd(43, 'x');
    expect(orderInvoiceUrl('demo', token)).toBe(
      `https://api.example.com/catalog/demo/orders/track/${token}/invoice`,
    );
  });

  it('codifica slug y token', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();
    const { orderInvoiceUrl } = await import('./tracking-api');
    expect(orderInvoiceUrl('demo', 'a/b?c')).toBe(
      'https://api.example.com/catalog/demo/orders/track/a%2Fb%3Fc/invoice',
    );
  });
});
