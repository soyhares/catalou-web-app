import { describe, it, expect } from 'vitest';
import { resolveUniqueCombination } from './variants';
import type { VariantTypePublic } from './api';

function type(name: string, values: [string, string, string][]): VariantTypePublic {
  return {
    id: `t-${name}`,
    name,
    values: values.map(([id, value, priceModifier]) => ({
      id,
      value,
      priceModifier,
      imageUrl: null,
    })),
  };
}

describe('resolveUniqueCombination', () => {
  it('no variant types → empty combination, addable from the grid', () => {
    expect(resolveUniqueCombination([])).toEqual({ valueIds: [], label: null, priceModifier: 0 });
  });

  it('every type with a single value → resolves ids, label and price modifier', () => {
    const combo = resolveUniqueCombination([
      type('Talla', [['v1', 'M', '0']]),
      type('Color', [['v2', 'Azul', '1500.5']]),
    ]);
    expect(combo).toEqual({
      valueIds: ['v1', 'v2'],
      label: 'Talla: M, Color: Azul',
      priceModifier: 1500.5,
    });
  });

  it('a type with two values → null (must be chosen on the detail page)', () => {
    expect(
      resolveUniqueCombination([type('Talla', [['v1', 'M', '0'], ['v2', 'L', '0']])]),
    ).toBeNull();
  });

  it('null when any type is ambiguous, even if the others are single', () => {
    expect(
      resolveUniqueCombination([
        type('Talla', [['v1', 'M', '0']]),
        type('Color', [['v2', 'Azul', '0'], ['v3', 'Rojo', '0']]),
      ]),
    ).toBeNull();
  });
});
