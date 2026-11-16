import { describe, expect, it } from 'vitest';
import { formatStepDate } from './format-date';

describe('formatStepDate', () => {
  it('conserva "a. m." completo y no deja punto en el mes', () => {
    const text = formatStepDate('2026-11-16T14:00:00.000Z')!;
    expect(text).toMatch(/[ap]\.\sm\.$/);
    expect(text).not.toMatch(/[a-z]{3}\./i);
  });

  it('una fecha inválida no se muestra', () => {
    expect(formatStepDate('no-es-fecha')).toBeNull();
    expect(formatStepDate(null)).toBeNull();
  });
});
