import type { VariantTypePublic } from './api';

export interface UniqueCombination {
  valueIds: string[];
  label: string | null;
  // sum of the priceModifier of the chosen values; add it to the product base price
  priceModifier: number;
}

/**
 * A product's variant combination is *unique* when every variant type has exactly one value
 * (a product with no variant types included). In that case there is nothing to choose and the
 * catalog card can add it straight to the cart. When any type offers two or more values the
 * combination is ambiguous and the shopper has to pick it on the detail page.
 */
export function resolveUniqueCombination(
  variantTypes: VariantTypePublic[],
): UniqueCombination | null {
  if (variantTypes.some((t) => t.values.length !== 1)) return null;
  if (variantTypes.length === 0) return { valueIds: [], label: null, priceModifier: 0 };
  // same label format as the detail page: "Talla: M, Color: Azul"
  return {
    valueIds: variantTypes.map((t) => t.values[0].id),
    label: variantTypes.map((t) => `${t.name}: ${t.values[0].value}`).join(', '),
    priceModifier: variantTypes.reduce((sum, t) => sum + parseFloat(t.values[0].priceModifier), 0),
  };
}
