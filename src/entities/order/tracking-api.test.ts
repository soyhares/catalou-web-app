import { describe, it, expect } from 'vitest';
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
