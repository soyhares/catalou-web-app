import { describe, expect, it } from 'vitest';
import { freshnessLabel } from './freshness';

const T = 1_700_000_000_000;

describe('freshnessLabel', () => {
  it('vacío antes de la primera respuesta', () => {
    expect(freshnessLabel(null, T)).toBe('');
  });
  it('"recién" el primer minuto, también con un reloj apenas atrasado', () => {
    expect(freshnessLabel(T, T + 59_000)).toBe('Actualizado recién');
    expect(freshnessLabel(T, T - 5_000)).toBe('Actualizado recién');
  });
  it('minutos y, pasada la hora, horas', () => {
    expect(freshnessLabel(T, T + 60_000)).toBe('Actualizado hace 1 min');
    expect(freshnessLabel(T, T + 59 * 60_000)).toBe('Actualizado hace 59 min');
    expect(freshnessLabel(T, T + 125 * 60_000)).toBe('Actualizado hace 2 h');
  });
});
