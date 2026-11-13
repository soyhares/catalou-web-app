import { describe, it, expect } from 'vitest';
import { buildWaLink } from './whatsapp-link';

describe('buildWaLink', () => {
  it('arma el enlace wa.me con el número y el texto codificado', () => {
    expect(buildWaLink('50688001234', 'Hola')).toBe('https://wa.me/50688001234?text=Hola');
  });

  it('descarta todo lo que no sea dígito del número', () => {
    expect(buildWaLink('+506 8800-1234', 'Hola')).toBe('https://wa.me/50688001234?text=Hola');
  });

  it('codifica espacios, saltos de línea, acentos y caracteres reservados', () => {
    const text = 'Hola, quiero: Café & té?\nhttps://cdn.catalou.com/a.jpg#1';
    const href = buildWaLink('50688001234', text);
    const url = new URL(href);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/50688001234');
    expect(url.searchParams.get('text')).toBe(text);
    expect(href).not.toContain(' ');
    expect(href).not.toContain('\n');
  });

  it('no altera el texto vacío', () => {
    expect(buildWaLink('50688001234', '')).toBe('https://wa.me/50688001234?text=');
  });
});
